import axios from "axios"
import download from "image-downloader"

const OPENSEA_API_KEY = "INSERT_KEY_HERE"
const WALLET = "INSERT_WALLET_HERE"

const chains = ["ethereum", "base", "optimism", "matic", "arbitrum", "zora"]

async function pullAllChains() {
    for(let chain of chains) {
        await pullNFTImagesFromChain(chain)
    }
}

async function pullNFTImagesFromChain(chain) {
    const NFT_URL = `https://api.opensea.io/api/v2/chain/${chain}/account/${WALLET}/nfts?limit=200`

    let response = await axios.get(NFT_URL, {
        headers: {
            "X-API-KEY": OPENSEA_API_KEY
        }
    })

    while(response.data.nfts.length > 0) {
        for(let nft of response.data.nfts) {
            console.log(`Pulling ${nft.name}`)

            // Avoid things that don't work as filenames
            const name = nft.name.replace(/\./g, "").replace(/\//g, "").replace(/"/g, "")

            // Some images wind up unpinned from IPFS or otherwise unavailable, which will cause download.image to fail
            try {
                await download.image({
                    url: nft.image_url,
                    dest: process.cwd() + `/images/${name}.png`
                })
            } catch(e) {
                console.log(`Error downloading ${nft.name}`)
            }
        }

        // Pull our next batch of NFTs
        response = await axios.get(NFT_URL + "&next=" + response.data.next)
    }
}

pullAllChains()