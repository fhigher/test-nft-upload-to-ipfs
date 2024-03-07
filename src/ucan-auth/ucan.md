
## UCAN：User Controlled Authorization Networks

### Storage端：
1. 创建nft.storage账户
2. 获取API KEY

### Server端：
1. 创建keypair并保存私钥
2. 调用https://api.nft.storage/user/did，用API_KEY注册keypair里的DID
3. 调用https://api.nft.storage/ucan/token，获取返回的root token，第一次用API_KEY获取，之后使用root token刷新有效期，默认两周
4. You can use the root token to derive child UCAN tokens for other users, or to create a request token to upload content using UCAN auth instead of your API token.

### Client端：
1. 创建keypair并保存私钥
2. 使用keypair里的DID，从Server端获取child token
3. 使用child token和keypair创建request token，需要获取Storage端的DID，调用https://api.nft.storage/did
5. 创建NFTStorage对象时，传入request token和keypair里的DID
 