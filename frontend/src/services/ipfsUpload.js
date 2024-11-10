// FE/src/services/ipfsUpload.js

const ipfsClient = require("ipfs-http-client");
const fs = require("fs");

// Initialize IPFS client
const ipfs = ipfsClient({ url: "https://ipfs.infura.io:5001/api/v0" });

/**
 * Upload a PDF file to IPFS and return the IPFS hash.
 * @param {string} filePath - Local path to the PDF file
 * @returns {Promise<string>} IPFS hash of the uploaded file
 */
async function uploadToIPFS(filePath) {
  try {
    // Read PDF file data
    const fileData = fs.readFileSync(filePath);
    // Upload to IPFS
    const result = await ipfs.add(fileData);
    console.log("File uploaded to IPFS with hash:", result.path);
    return result.path; // This is the IPFS hash
  } catch (error) {
    console.error("Failed to upload to IPFS:", error);
    throw error;
  }
}

module.exports = {
  uploadToIPFS,
};
