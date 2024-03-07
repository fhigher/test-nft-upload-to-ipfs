import { AesUtils } from './aes'
import { KeyPair } from 'ucan-storage/keypair'
import * as ed from '@noble/ed25519'

async function testEncryptAndDecrypt() {
    const aes = new AesUtils("sdfjk23kkl123")
    for (let i = 0; i < 100000; i++) {
        const kp = await KeyPair.create()
        const cipherText = aes.Encrypt(kp.privateKey)
        const plainText = aes.Decrypt(cipherText)
        const dkp = new KeyPair(plainText, await ed.getPublicKey(plainText))
        
        if (kp.privateKey.length === dkp.privateKey.length && kp.export() === dkp.export()) {
            continue
        } else {
            console.log("not equal")
        }
    }
}

testEncryptAndDecrypt().then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})