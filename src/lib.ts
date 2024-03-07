
import { NFTStorage, type RateLimiter, createRateLimiter } from 'nft.storage'


const IPFS_PREFIX = "ipfs://"

export class NftToIpfs {
    private rateLimit: RateLimiter

    constructor(private token: string[], private retrievalGateway: string[], private did?: string) {
        if (!Array.isArray(token) || !Array.isArray(retrievalGateway)) {
            throw new TypeError('the api key or retrieval gateway of nft.storage is not array')
        }
        this.rateLimit = createRateLimiter()
    }

    private async getImage(imgHttpUrl: string) {
        const resp = await fetch(imgHttpUrl)
        if (! resp.ok) {
            throw new Error(`error fetching image: [${resp.status}]: ${resp.statusText}`)
        }

        return resp.blob()
    }

    public async upload(name: string, desc: string, imgHttpUrl?: string, imgData?: Blob) {
        let imgBlob: Blob;
        if (imgHttpUrl) {
            try { 
                imgBlob = await this.getImage(imgHttpUrl)
            } catch (e) {
                throw e
            }
        } else {
            imgBlob = imgData ? imgData : new Blob([])
        }

        if (imgBlob.size == 0) {
            return null
        }

        const data = {
            image: imgBlob,
            name: name,
            description: desc,
        }

        let i: number = 0;
        do {
            try {
                const client = new NFTStorage({token: this.token[i], rateLimiter: this.rateLimit})
                const metadata = await client.store(data)
                if (metadata) {
                    return metadata
                }
            } catch (e) {
                throw e
            }
            i++

        } while (i < this.token.length)

        return null
    }

    public preview(imgIpfsUrl: string): string[] {
        if (! imgIpfsUrl.startsWith(IPFS_PREFIX)) {
            throw new Error("the URL address must be prefixed with ipfs://")
        }

        const cid = imgIpfsUrl.substring(IPFS_PREFIX.length)
        return this.retrievalGateway.map<string>((value): string =>  {
            return value + cid
        });
    }

}