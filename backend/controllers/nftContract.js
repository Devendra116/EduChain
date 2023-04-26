const { keyStores, transactions, connect, utils } = require("near-api-js");
require('dotenv').config()
const keyPair = utils.KeyPair.fromString(process.env.NFT_CONTRACT_PRIVATE_KEY);
const keyStore = new keyStores.InMemoryKeyStore();
const ACCOUNT_ID = process.env.NFT_CONTRACT;

keyStore.setKey(process.env.NETWORK_ID, ACCOUNT_ID, keyPair);

const config = {
    keyStore,
    networkId: process.env.NETWORK_ID,
    nodeUrl: `https://rpc.${process.env.NETWORK_ID}.near.org`,
};

const mintNFT = async (nft) => {
    try {
        const near = await connect(config);
        const account = await near.account(ACCOUNT_ID);
        const result = await account.signAndSendTransaction(
            {
                receiverId: ACCOUNT_ID,
                actions: [
                    transactions.functionCall(
                        "nft_mint",
                        Buffer.from(JSON.stringify(nft)),
                        10000000000000,
                        "10000000000000000000000"
                    ),
                ],
            }
        )
        return result
    } catch (error) {
        return {error: error.message }
    }
}

 
async function isNFTMinted(nft_token_id) {
    try {
        const near = await connect(config);
        const response = await near.connection.provider.query({
            request_type: "call_function",
            finality: "final",
            account_id: ACCOUNT_ID,
            method_name: "nft_token",
            args_base64:  Buffer.from(JSON.stringify({ "token_id": nft_token_id })).toString('base64'),
          });
          const decodedResult=Buffer.from(response.result, 'base64').toString('utf8')
        console.log(typeof decodedResult)
        if (decodedResult != 'null') return true
        else return false 
    } catch (error) {

        console.log(`Error: ${error}`)
    }
}


module.exports = {
    mintNFT,
};
