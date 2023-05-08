const { keyStores, transactions, connect, utils } = require("near-api-js");
require('dotenv').config()
const keyPair = utils.KeyPair.fromString(process.env.EDUCHAIN_CONTRACT_PRIVATE_KEY);
const keyStore = new keyStores.InMemoryKeyStore();
const ACCOUNT_ID = process.env.EDUCHAIN_CONTRACT;

keyStore.setKey(process.env.NETWORK_ID, ACCOUNT_ID, keyPair);

const config = {
    keyStore,
    networkId: process.env.NETWORK_ID,
    nodeUrl: `https://rpc.${process.env.NETWORK_ID}.near.org`,
};

async function addCourseToContract(course) {
    try {
        const near = await connect(config);
        const account = await near.account(ACCOUNT_ID);
        const result = await account.signAndSendTransaction(
            {
                receiverId: ACCOUNT_ID,
                actions: [
                    transactions.functionCall(
                        "add_course",
                        Buffer.from(JSON.stringify(course)),
                        10000000000000
                    ),
                ],
            }
        )
        return result
    } catch (error) {
        return { error: error.message }
    }
}

async function addNgo(ngo) {
    try {
        const near = await connect(config);
        const account = await near.account(ACCOUNT_ID);
        const result = await account.signAndSendTransaction(
            {
                receiverId: ACCOUNT_ID,
                actions: [
                    transactions.functionCall(
                        "add_ngo",
                        Buffer.from(JSON.stringify(ngo)),
                        10000000000000
                    ),
                ],
            }
        )
        return result
    } catch (error) {
        return { error: error.message }
    }
}
module.exports = {
    addCourseToContract, addNgo
};
