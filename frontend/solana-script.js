// Import the required modules
const { uploadToIPFS } = require("./services/ipfsUpload");
const { storePatientData } = require("./solana/patientDataStore");

async function uploadPatientData(filePath) {
  try {
    // Step 1: Upload the PDF to IPFS
    const ipfsHash = await uploadToIPFS(filePath);
    console.log("Uploaded to IPFS with hash:", ipfsHash);

    // Step 2: Store the IPFS hash on Solana
    await storePatientData(ipfsHash);
    console.log("Patient data stored on Solana with IPFS hash:", ipfsHash);
  } catch (error) {
    console.error("Failed to upload patient data:", error);
  }
}

// Call the function with the path to the PDF file
uploadPatientData("path/to/patient_data.pdf");
