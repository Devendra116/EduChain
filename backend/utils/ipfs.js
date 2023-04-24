const { encode } = require('base-64');
let secrets = '2LXbDy8qoEAThQoV1PtygIXO9fp:9c3769c21ef049f6cbd6235b9e95796d';
let encodedSecrets = encode(secrets);

async function addImageToIPFS(imageBuffer) {
  const { create } = await import('ipfs-http-client')
  const client = await create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      "Authorization": `Basic ${encodedSecrets}`
    }
  });

  // Add the image to IPFS
  const result = await client.add(imageBuffer);
  // Return the IPFS response
  return result
}

module.exports = {addImageToIPFS};