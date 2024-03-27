document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchNfts').addEventListener('click', fetchAndDisplayNFTs);
    document.getElementById('createGifButton').style.display = 'none'; // Initially hide the button
});

let selectedImagesData = [];

async function fetchAndDisplayNFTs() {
    const ensAddress = document.getElementById('ensAddress').value.trim();
    if (!ensAddress) {
        alert('Please enter a valid ENS address.');
        return;
    }

    try {
        const response = await fetch(`/api/fetch-nfts?ensAddress=${encodeURIComponent(ensAddress)}`);
        const data = await response.json();
        displayNfts(data);
    } catch (error) {
        console.error('Error fetching NFTs:', error);
    }
}

function displayNfts(data) {
    const gallery = document.getElementById('nftGallery');
    gallery.innerHTML = '';
    gallery.classList.add('carousel'); // Ensure your HTML has this class styled as per the CSS provided

    Object.keys(data).forEach(blockchainKey => {
        const tokenBalances = data[blockchainKey].TokenBalance;
        tokenBalances.forEach(tokenBalance => {
            const imageUrl = tokenBalance.tokenNfts?.contentValue?.image?.medium || 'fallback-image-url.png';

            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = tokenBalance.token?.name || 'NFT Image';
            imgElement.classList.add('nft-item');
            imgElement.addEventListener('click', function() {
                this.classList.toggle('selected');
                handleImageSelection(this, imageUrl);
            });

            gallery.appendChild(imgElement);
        });
    });
}

function handleImageSelection(img, imageSrc) {
    if (img.classList.contains('selected')) {
        convertImageToDataURL(imageSrc, dataURL => {
            selectedImagesData.push({ src: imageSrc, dataURL: dataURL });
            updatePreviewAndButtonVisibility();
        });
    } else {
        const index = selectedImagesData.findIndex(item => item.src === imageSrc);
        if (index > -1) {
            selectedImagesData.splice(index, 1);
            updatePreviewAndButtonVisibility();
        }
    }
}

function convertImageToDataURL(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; 
    img.onload = function() {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 300; // Example size for square images
        const ctx = canvas.getContext('2d');
        const x = (canvas.width / 2) - (img.width / 2) * (size / img.width);
        const y = (canvas.height / 2) - (img.height / 2) * (size / img.height);
        ctx.drawImage(img, x, y, img.width * (size / img.width), img.height * (size / img.height));
        const dataURL = canvas.toDataURL('image/png');
        callback(dataURL);
    };
    img.src = imageSrc;
}

function updatePreviewAndButtonVisibility() {
    const previewArea = document.getElementById('selectedImagesPreview');
    previewArea.innerHTML = ''; // Clear previous content
    selectedImagesData.forEach(item => {
        const imgElement = document.createElement('img');
        imgElement.src = item.dataURL;
        imgElement.classList.add('preview-image'); // Ensure this class is styled appropriately
        previewArea.appendChild(imgElement);
    });

    document.getElementById('createGifButton').style.display = selectedImagesData.length > 0 ? 'block' : 'none';
}

document.getElementById('createGifButton').addEventListener('click', () => {
    console.log('Create GIF button clicked');
    // Assuming createGifFromDataUrls function exists and is correctly implemented
    createGifFromDataUrls(selectedImagesData.map(item => item.dataURL));
    scrollToGifPreview();
});
function createGifFromDataUrls(dataUrls) {
    if (dataUrls.length === 0) {
        console.log('No images selected for GIF creation.');
        return;
    }

    console.log('Create GIF button clicked');

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js', 
        width: 300, 
        height: 300,
    });

    let loadCount = 0; //img count

    dataUrls.forEach(dataUrl => {
        const img = new Image();
        img.onload = () => {
            console.log('Adding image to GIF');
            gif.addFrame(img, { delay: 200 });

            loadCount++;
            if (loadCount === dataUrls.length) {
                console.log('All images loaded, starting GIF render...');
                gif.render();
            }
        };
        img.src = dataUrl;
    });

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
    
        // Create or select a container for the GIF and download link
        let gifContainer = document.getElementById('gifContainer');
        if (!gifContainer) {
            gifContainer = document.createElement('div');
            gifContainer.id = 'gifContainer';
            gifContainer.classList.add('flex', 'flex-col', 'items-center', 'mt-4');
            document.body.appendChild(gifContainer); // Adjust this as needed
        } else {
            gifContainer.innerHTML = ''; // Clear previous content
        }
    
        // Create and append the preview image
        const previewImg = document.createElement('img');
        previewImg.src = url;
        gifContainer.appendChild(previewImg);
    
        // Create and append the download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'nft-collection.gif';
        downloadLink.textContent = 'Download GIF';
        downloadLink.classList.add('mt-8', 'bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold','py-2','px-4','rounded');
        gifContainer.appendChild(downloadLink);
        scrollToGif();

    });
function scrollToGifPreview() {
    document.getElementById('selectedImagesPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
