import { sha512 } from '@noble/hashes/sha512'
import { gcm } from '@noble/ciphers/aes'
import { Cipher } from '@noble/ciphers/utils'

export class AesUtils {
    private aes: Cipher
    constructor (pwd: string) {
        const digest = sha512(pwd)
        const key = digest.slice(0, 32)
        const nonce = digest.slice(32, 48)
        this.aes = gcm(key, nonce)
    }
    public Encrypt(plainText: Uint8Array) {
        return this.aes.encrypt(plainText)
    }

    public Decrypt(cipherText: Uint8Array) {
        return this.aes.decrypt(cipherText)
    }
}
