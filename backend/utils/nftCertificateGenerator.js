const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const { addImageToIPFS } = require('./ipfs')
const fs = require('fs');

async function generateCertificate(textFields) {
  // Define the certificate template path
  const templatePath = path.join(__dirname, 'certificateTemplate.png');

  // Set the canvas dimensions and load the certificate template image
  const canvasWidth = 1000;
  const canvasHeight = 750;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  const templateImage = await loadImage(templatePath);

  // Draw the certificate template image on the canvas
  ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);

  // Loop through each text field and draw it on the certificate
  for (let i = 0; i < textFields.length; i++) {
    const { text, x, y, fontSize, fontBold, fontColor, fontFamily } = textFields[i];
    ctx.font = `${fontBold ? 'bold ' : ''}${fontSize}px ${fontFamily || 'sans-serif'}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  }

  // Save the certificate image as a PNG file
  const certificateImage = canvas.toBuffer('image/png');
  // fs.writeFileSync('certificate.png', certificateImage);
  // Add the certificate image to IPFS
  const response = await addImageToIPFS(certificateImage);

  const ImgHash = `https://ipfs.io/ipfs/${response.path}`;
  console.log(`Certificate uploaded to IPFS with hash: ${ImgHash}`);
  return ImgHash
}

// // Call the function with an array of desired text fields and their respective properties
// generateCertificate([
//   { text: "Devendra Chauhan", x: 500, y: 420, fontSize: 48, fontBold: true, fontColor: "#000", fontFamily: "Verdana" },
//   { text: "For Completing The Online Course -", x: 490, y: 470, fontSize: 24, fontBold: false, fontColor: "#333", fontFamily: "Verdana" },
//   { text: "Introduction to Blockchain: Intro to NEAR", x: 490, y: 500, fontSize: 28, fontBold: true, fontColor: "#111", fontFamily: "Verdana" },
//   { text: "janesmith.near", x: 735, y: 600, fontSize: 24, fontBold: false, fontColor: "#444", fontFamily: "Times New Roman" },
//   { text: "Jane Smith", x: 730, y: 655, fontSize: 18, fontBold: true, fontColor: "#444", fontFamily: "Times New Roman" },
//   { text: "Completed On 22nd April, 2023.", x: 850, y: 18, fontSize: 18, fontBold: false, fontColor: "#666", fontFamily: "Times New Roman" },
// ]);

module.exports = { generateCertificate }