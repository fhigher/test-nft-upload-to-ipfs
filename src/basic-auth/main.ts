import { NftToIpfs } from '../lib';
import { NFT_STORAGE_RETRIEVAL_GATEWAY, NFT_STORAGE_API_KEYS } from '../config'

async function main() {
    // metadata.json -> cid ipfs://bafyreig6kp6ap5wxfdyva443apoudw7grnbst24e7g7laig5nda4fe4iiq/metadata.json
    // woman.png -> cid ipfs://bafybeif4jwzwecbzsmwmydhdvgt7gfbtn3k7lq3734lntczktas4u7w6ie/blob
    try {
        const handler = new NftToIpfs(NFT_STORAGE_API_KEYS, NFT_STORAGE_RETRIEVAL_GATEWAY)
        const metadata = await handler.upload("woman.png", "a woman", "https://cdn.pixabay.com/photo/2017/07/19/10/55/woman-2518758_960_720.png")
        if (metadata) {
            console.log('IPFS URL for the metadata:', metadata.url)
            console.log('metadata.json contents:\n', metadata.data.image.href)
            console.log('metadata.json with IPFS gateway URLs:\n', metadata.embed())
            
            const gateways = handler.preview(metadata.url)
            console.log(gateways)
        } else {
            console.log("empty")
        }
    } catch (e) {
        console.log("main: " + e)
    }
}


main().then(function (response) {
    console.log(response)
  })
  .catch(function (error) {
    console.log(error)
  })