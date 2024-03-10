import { UcanServer, start } from "../ucan-server";

async function runServer() {
    const srv = new UcanServer()
    await srv.init()
    start(srv, 9000)
}

runServer().then(() => {console.log("the api server start at :9000")}).catch((err) => {console.log(err)})