document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchNfts').addEventListener('click', fetchAndDisplayNFTs);
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
    gallery.classList.add('carousel'); 

    Object.keys(data).forEach(blockchainKey => {
        const tokenBalances = data[blockchainKey].TokenBalance;
        tokenBalances.forEach(tokenBalance => {
            const imageUrl = tokenBalance.tokenNfts?.contentValue?.image?.medium || 'fallback-image.png';
            const fallbackImageUrl = 'fallback-image.png';
            if (imageUrl === fallbackImageUrl) return;

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
            updateFooterVisibility();

        });
    } else {
        const index = selectedImagesData.findIndex(item => item.src === imageSrc);
        if (index > -1) {
            selectedImagesData.splice(index, 1);
            updatePreviewAndButtonVisibility();
            updateFooterVisibility();

        }
    }
}

function updateFooterVisibility() {
    const footer = document.getElementById('stickyFooter');
    if (selectedImagesData.length > 0) {
        footer.classList.remove('hidden'); // Show the footer
        footer.classList.add('sticky-footer'); // Hide the footer

    } else {
        footer.classList.add('hidden'); // Hide the footer
        footer.classList.remove('sticky-footer'); // Show the footer

    }
}

function convertImageToDataURL(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; 
    img.onload = function() {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 300; 
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
    previewArea.innerHTML = ''; 

    selectedImagesData.forEach(item => {
        const imgElement = document.createElement('img');
        imgElement.src = item.dataURL;
        imgElement.classList.add('preview-image'); 
        previewArea.appendChild(imgElement);
    });


}


document.getElementById('createGifButton').addEventListener('click', () => {
    console.log('Create GIF button clicked');
    createGifFromDataUrls(selectedImagesData.map(item => item.dataURL));
});
document.getElementById('resetButton').addEventListener('click', resetSelectionAndGif);
function resetSelectionAndGif() {
    selectedImagesData = [];
    gifContainer.innerHTML = ''; 
    gifContainer.classList.add('hidden');
    document.getElementById('selectedImagesPreview').innerHTML = '';
    document.getElementById('nftGallery').querySelectorAll('.nft-item.selected').forEach(item => {
        item.classList.remove('selected');
    

    });

    
}





function createGifFromDataUrls(dataUrls) {
    if (dataUrls.length === 0) {
        alert('Please select some images to make a GIF.');
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js', 
        width: 300, 
        height: 300,
    });

    let loadCount = 0;

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
        let gifContainer = document.getElementById('gifContainer');
        if (!gifContainer) {
            gifContainer = document.createElement('div');
            gifContainer.id = 'gifContainer';
            gifContainer.classList.add('flex', 'flex-col', 'items-center', 'mt-4');
            document.body.appendChild(gifContainer);
            
        } else {
            gifContainer.innerHTML = ''; 
            gifContainer.classList.add('hidden');

        }
    
        const previewImg = document.createElement('img');
        previewImg.src = url;
        gifContainer.appendChild(previewImg);
        gifContainer.classList.remove('hidden');
    
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'nft-collection.gif';
        downloadLink.textContent = 'Download GIF';
        downloadLink.id = 'download';
        
        downloadLink.classList.add('mt-8', 'bg-purple-500', 'hover:bg-purple-700', 'text-white', 'font-bold','py-2','px-4','rounded');
        gifContainer.appendChild(downloadLink);
    });
};    
