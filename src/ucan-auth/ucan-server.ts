import * as fs from 'node:fs';
import { KeyPair } from 'ucan-storage/keypair'
import { validate, build } from 'ucan-storage/ucan-storage'
import { NFT_STORAGE_API_GATEWAY, NFT_STORAGE_API_KEYS, UCAN_KEY_PATH, UCAN_KEY_PWD } from '../config'
import { AesUtils } from './aes'
import * as ed from '@noble/ed25519'
import fetch from 'node-fetch';
import { ValidateResult } from 'ucan-storage/types';

export interface tokenResult {ok: boolean, value: string, validResult: ValidateResult}

export class Server {
    private keypair: Promise<KeyPair>
    private kPath: string
    private kPwd: string
    private aesObj: AesUtils 
    private apiKey: string
    private apiGateway: string
    private rootToken: tokenResult // default is undefined

    constructor(/* private ip: string, private port: string */) {
        this.kPath = UCAN_KEY_PATH ? UCAN_KEY_PATH : ".ucan.key"     // if UCAN_KEY_PATH is empty, use default value
        this.kPwd = UCAN_KEY_PWD ? UCAN_KEY_PWD : "sd0g0e23ASd8dFE0" // if UCAN_KEY_PWD is empty, use default value
        this.aesObj = new AesUtils(this.kPwd)
        this.apiKey = NFT_STORAGE_API_KEYS[0]
        this.apiGateway = NFT_STORAGE_API_GATEWAY
        //console.log(this.rootToken)
        if (! fs.existsSync(this.kPath)) {
            this.keypair = this.createAndSaveKeypair()
        } else {
            this.keypair = this.loadKeypairFromFile()
        }
        
    }
    private async createAndSaveKeypair() {
        const kp = await KeyPair.create()
        const cipherText = this.aesObj.Encrypt(kp.privateKey)
        await fs.promises.writeFile(this.kPath, cipherText)
        return kp
    }

    private async loadKeypairFromFile() {
        const cipherText = await fs.promises.readFile(this.kPath)
        const plainText = this.aesObj.Decrypt(new Uint8Array(cipherText))
        return new KeyPair(plainText, await ed.getPublicKey(plainText))
    }

    public async getKeypair() {
        return this.keypair
    }

    // only register once
    public async registerDid() {
        let jsonData = JSON.stringify({ did: (await this.keypair).did() })
        //console.log(jsonData)
        const res = await fetch(this.apiGateway + "/user/did", {
            method: "post",
            body: jsonData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.apiKey
            }
        })

        return (await res.json()) as tokenResult
    }

    public async getRootToken() {
        const res = await fetch(this.apiGateway + "/ucan/token", {
            method: "post",
            body: null,
            headers: {
                "Authorization": "Bearer " + this.apiKey
            }
        })
        this.rootToken = (await res.json()) as tokenResult
        // validate the parent UCAN and extract the ValidateResult
        try {
            this.rootToken.validResult = await validate(this.rootToken.value)
        } catch (err) {
            throw err
        }

        return this.rootToken
    }

    // audienceDID - user
    public async deriveUserToken(audienceDID: string) {
        const nowTime = Math.floor(Date.now() / 1000) - 600
        if ( ! this.rootToken || ! this.rootToken.ok || this.rootToken.validResult.payload.exp < nowTime) {
            // update root token
            try {
                await this.getRootToken()
            } catch (err) {
                throw err
            }
        } 
        // the `att` field contains the capabilities
        const { att } = this.rootToken.validResult.payload
      
        // for each capability in the parent, keep everything except the
        // resource path, to which we append the DID for the new token's audience
        let storageCap = new Array()
        att.map(
            (capability) => (
                storageCap.push({
                    can: capability.can,
                    with: [capability.with, audienceDID].join('/'),
                })
            )
        )
        // include the parent UCAN JWT string in the proofs array
        const proofs = [this.rootToken.value]
      
        const userToken = await build({
            issuer: await this.keypair,
            audience: audienceDID,
            capabilities: storageCap,
            lifetimeInSeconds: 604800, // 7 days in seconds
            proofs,
        })

        return userToken
    }
}