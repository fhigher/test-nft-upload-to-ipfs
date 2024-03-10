import { ValidateResult } from "ucan-storage/types"
import { TokenManager } from "./token-manager"
import { validate } from 'ucan-storage/ucan-storage'
import { KeyPair } from 'ucan-storage/keypair'

const srv = new TokenManager()

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
    const res = await srv.viewRootToken() 
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
    //await testRegistDid()
    //await testGetServerRootToken()
    //await testDeriveToken()
    const tmpUtoken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsInVjdiI6IjAuOC4wIn0.eyJhdWQiOiJkaWQ6a2V5Ono2TWtyR0NBNVh0MkV6eXhaSDNrYzdCNHUyQnZVbXlYNGhveTNTZDhpVFFZYVJQZyIsImF0dCI6W3siY2FuIjoidXBsb2FkLyoiLCJ3aXRoIjoic3RvcmFnZTovL2RpZDprZXk6ejZNa3JHQ0E1WHQyRXp5eFpIM2tjN0I0dTJCdlVteVg0aG95M1NkOGlUUVlhUlBnL2RpZDprZXk6ejZNa3JHQ0E1WHQyRXp5eFpIM2tjN0I0dTJCdlVteVg0aG95M1NkOGlUUVlhUlBnIn1dLCJleHAiOjE3MTA2NTA5MzgsImlzcyI6ImRpZDprZXk6ejZNa3JHQ0E1WHQyRXp5eFpIM2tjN0I0dTJCdlVteVg0aG95M1NkOGlUUVlhUlBnIiwicHJmIjpbImV5SmhiR2NpT2lKRlpFUlRRU0lzSW5SNWNDSTZJa3BYVkNJc0luVmpkaUk2SWpBdU9DNHdJbjAuZXlKaGRXUWlPaUprYVdRNmEyVjVPbm8yVFd0eVIwTkJOVmgwTWtWNmVYaGFTRE5yWXpkQ05IVXlRblpWYlhsWU5HaHZlVE5UWkRocFZGRlpZVkpRWnlJc0ltRjBkQ0k2VzNzaWQybDBhQ0k2SW5OMGIzSmhaMlU2THk5a2FXUTZhMlY1T25vMlRXdHlSME5CTlZoME1rVjZlWGhhU0ROcll6ZENOSFV5UW5aVmJYbFlOR2h2ZVROVFpEaHBWRkZaWVZKUVp5SXNJbU5oYmlJNkluVndiRzloWkM4cUluMWRMQ0psZUhBaU9qRTNNVEV5TlRVMU5EY3NJbWx6Y3lJNkltUnBaRHByWlhrNmVqWk5hMjVxVW1KV1IydG1WMHN4ZURWbmVVcGFZalpFTkV4cVRXb3hSWE5wZEVaNlkxTmpZMU16YzBGaGRtbFJJaXdpY0hKbUlqcGJYWDAua000YWE3Wjg5blJ4SnhjaU55NF9QSDZFZDFkMnU2NldpM2lUbGR3Q0ZudU9pcFN2VUJXNTI1dzBlVDgyQ3JuN0FTc3BleHlEbkNfN3BkblVSUlJtQUEiXX0.mjOHFwp6lwiWzcWLY4ORCYv-mF5s2B83YKlj3j9ZA0KNTV9-gVx5DkczlZ8Z4OJLsX6Ii8XBDk9RDjr08TEjAQ"
    await validPrint(tmpUtoken)
}

testMain().then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})