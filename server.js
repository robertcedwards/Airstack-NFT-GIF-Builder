const express = require('express');
const { init, fetchQuery } = require("@airstack/node");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
init(process.env.AIRSTACK_API_KEY);

const query = `query GetTokens($tokenType: [TokenType!], $limit: Int, $sortBy: OrderBy, $owner: Identity) {
    
  ethereum: TokenBalances(
    input: {filter: {owner: {_eq: $owner},tokenType: {_in: $tokenType}}, blockchain: ethereum, limit: $limit, order: {lastUpdatedTimestamp: $sortBy}}
  ) {
    TokenBalance {
      
      amount
tokenType
blockchain
formattedAmount
tokenId
tokenAddress
lastUpdatedTimestamp
owner {
    addresses
}
tokenNfts {
    tokenId
    contentValue {
        image {
          medium
        }
    }
    erc6551Accounts {
      address {
        addresses
        tokenBalances {
          tokenAddress
          tokenId
          tokenNfts {
            contentValue {
              image {
                medium
              }
            }
          }
        }
      }
    }
}
token {
  isSpam
  name
  symbol
  logo {
    small
  }
  projectDetails {
    imageUrl
  }
}
tokenTransfers(input: {filter: {from: {_eq: "0x0000000000000000000000000000000000000000"},operator: {_eq: $owner},to: {_eq: $owner}}, order: {blockTimestamp: ASC}, limit: 1}) {
    type
  }

    }
  }

  base: TokenBalances(
    input: {filter: {owner: {_eq: $owner},tokenType: {_in: $tokenType}}, blockchain: base, limit: $limit, order: {lastUpdatedTimestamp: $sortBy}}
  ) {
    TokenBalance {
      
      amount
tokenType
blockchain
formattedAmount
tokenId
tokenAddress
lastUpdatedTimestamp
owner {
    addresses
}
tokenNfts {
    tokenId
    contentValue {
        image {
          medium
        }
    }
    erc6551Accounts {
      address {
        addresses
        tokenBalances {
          tokenAddress
          tokenId
          tokenNfts {
            contentValue {
              image {
                medium
              }
            }
          }
        }
      }
    }
}
token {
  isSpam
  name
  symbol
  logo {
    small
  }
  projectDetails {
    imageUrl
  }
}
tokenTransfers(input: {filter: {from: {_eq: "0x0000000000000000000000000000000000000000"},operator: {_eq: $owner},to: {_eq: $owner}}, order: {blockTimestamp: ASC}, limit: 1}) {
    type
  }

    }
  }

  polygon: TokenBalances(
    input: {filter: {owner: {_eq: $owner},tokenType: {_in: $tokenType}}, blockchain: polygon, limit: $limit, order: {lastUpdatedTimestamp: $sortBy}}
  ) {
    TokenBalance {
      
      amount
tokenType
blockchain
formattedAmount
tokenId
tokenAddress
lastUpdatedTimestamp
owner {
    addresses
}
tokenNfts {
    tokenId
    contentValue {
        image {
          medium
        }
    }
    erc6551Accounts {
      address {
        addresses
        tokenBalances {
          tokenAddress
          tokenId
          tokenNfts {
            contentValue {
              image {
                medium
              }
            }
          }
        }
      }
    }
}
token {
  isSpam
  name
  symbol
  logo {
    small
  }
  projectDetails {
    imageUrl
  }
}
tokenTransfers(input: {filter: {from: {_eq: "0x0000000000000000000000000000000000000000"},operator: {_eq: $owner},to: {_eq: $owner}}, order: {blockTimestamp: ASC}, limit: 1}) {
    type
  }

    }
  }

  zora: TokenBalances(
    input: {filter: {owner: {_eq: $owner},tokenType: {_in: $tokenType}}, blockchain: zora, limit: $limit, order: {lastUpdatedTimestamp: $sortBy}}
  ) {
    TokenBalance {
      
      amount
tokenType
blockchain
formattedAmount
tokenId
tokenAddress
lastUpdatedTimestamp
owner {
    addresses
}
tokenNfts {
    tokenId
    contentValue {
        image {
          medium
        }
    }
    erc6551Accounts {
      address {
        addresses
        tokenBalances {
          tokenAddress
          tokenId
          tokenNfts {
            contentValue {
              image {
                medium
              }
            }
          }
        }
      }
    }
}
token {
  isSpam
  name
  symbol
  logo {
    small
  }
  projectDetails {
    imageUrl
  }
}
tokenTransfers(input: {filter: {from: {_eq: "0x0000000000000000000000000000000000000000"},operator: {_eq: $owner},to: {_eq: $owner}}, order: {blockTimestamp: ASC}, limit: 1}) {
    type
  }

    }
  }
}`;

app.use(express.static('public'));
app.get('/api/fetch-nfts', async (req, res) => {
    const ensAddress = req.query.ensAddress;

    if (!ensAddress) {
        return res.status(400).send({ error: 'ENS address is required.' });
    }

    const variables = {
        tokenType: ["ERC721"],
        limit: 10,
        sortBy: "DESC",
        owner: ensAddress
    };

    try {
        const { data, errors } = await fetchQuery(query, variables);

        if (errors) {
            console.error("Error fetching NFT data:", errors);
            return res.status(500).send({ error: 'Failed to fetch NFT data.' });
        }

        res.send(data);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

  