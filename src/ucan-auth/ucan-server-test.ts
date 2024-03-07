import { ValidateResult } from "ucan-storage/types"
import { Server } from "./ucan-server"
import { validate } from 'ucan-storage/ucan-storage'
import { KeyPair } from 'ucan-storage/keypair'

const srv = new Server()

async function testKeyPair() {
    const kp = await srv.getKeypair()
    console.log(`DID: ${kp.did()}`)
    console.log(`PUB: ${kp.publicKeyStr()}`)
    console.log(`PRI: ${kp.export()}`)
}

async function testRegistDid() {
    const data = await srv.registerDid()
    console.log(data)
}

async function testGetServerRootToken() {
    // 每执行一次都获取新的token（但iss,aud保持一致,exp刷新）。
    // 可以将token缓存，每次被访问时判断过期时间，如快过期则用此token刷新过期时间，或用API KEY获取新的token
    const res = await srv.getRootToken() 
    console.log(typeof res)
    console.log(res.ok, res.value)
    if (! res.ok) {
        return
    } 

    await validPrint(res.value)
}

async function testDeriveToken() {
    const userKeyPair = KeyPair.create()
    const userToken = await srv.deriveUserToken((await userKeyPair).did())
    await validPrint(userToken)
}

async function validPrint(token: string) {
    let result: ValidateResult
    try {
        result = await validate(token)
        const { iss, aud, exp, att } = result.payload
        console.log("iss: ", iss)
        console.log("aud: ", aud)
        console.log("exp: ", exp) // default in two weeks
        console.log("att: ", att)
    } catch (err) {
        console.log(err)
    }
}

async function testMain() {
    //await testKeyPair()
    await testRegistDid()
    //await testGetServerRootToken()
    //await testDeriveToken()
}

testMain().then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})