### Run
    npm install
    npm run test-token-manager
    npm run test-aes
    npm run run-basic
    npm run run-server

### Api
    curl 127.0.0.1:9000/admin/did
    curl 127.0.0.1:9000/admin/rtoken
    curl -H "X-User-Did: ${YourDID}" 127.0.0.1:9000/utoken
        eg. YourDID = did:key:z6MkrGCA5Xt2EzyxZH3kc7B4u2BvUmyX4hoy3Sd8iTQYaRPg
    