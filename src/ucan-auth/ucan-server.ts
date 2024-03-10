import Koa, { Context } from 'koa'
import Router from '@koa/router'
//import koaBody from 'koa-body'
import { TokenManager } from './token-manager'
import { parse } from 'ucan-storage/did'

export class UcanServer {
    private tokenManager: TokenManager
    private systemDid: string
    constructor() {
        this.tokenManager = new TokenManager()
    }

    public async init() {
        this.systemDid = (await this.tokenManager.registerDid()).value
        console.log("the did of this server is: ", this.systemDid)
        try {
            const rootToken = (await this.tokenManager.viewRootToken()).value
            console.log("the root token of this server is: ", rootToken)
        } catch (err) {
            throw err
        }
    }

    public async userToken(ctx: Context) {
        const uDid = ctx.request.get("X-User-Did")
        try {
            parse(uDid)
        } catch (err) {
            console.log(`invalid user did ${uDid}, error: ${err}`)
            ctx.throw(400, "invalid user did")
        }
        
        try {
            ctx.body = await this.tokenManager.deriveUserToken(uDid)
        } catch(err) {
            console.error(`derive token for user ${uDid}, error: ${err}`)
            ctx.throw()
        }
    }
    
    public sysDid(ctx: Context) {
        ctx.body = this.systemDid
    }
    
    public async systemRootToken(ctx: Context) {
        let rootToken: string
        try {
            rootToken = (await this.tokenManager.viewRootToken()).value
        } catch (err) {
            console.log(`view root token error: ${err}`)
            ctx.throw()
        }
    
        ctx.body = rootToken
    }
}

function createRouter(srv: UcanServer) {
    const router = new Router()
    // user api
    router.get("/utoken", async (ctx: Context) => {
        await srv.userToken(ctx)
    })
    // admin api
    router.get("/admin/did", (ctx: Context) => {
        srv.sysDid(ctx)
    })
    router.get("/admin/rtoken", async (ctx: Context) => {
        await srv.systemRootToken(ctx)
    })

    return router
}

export function start(srv: UcanServer, port: number) {
    const app = new Koa()
    const router = createRouter(srv)
    //app.use(koaBody())
    app.use(router.routes())
    app.listen(port)
}