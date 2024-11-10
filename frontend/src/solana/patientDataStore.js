// FE/src/solana/patientDataStore.js

const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { Program, AnchorProvider, web3 } = require("@project-serum/anchor");
const idl = require("./patient_data_chain.json"); // Import your program's IDL
const programID = new PublicKey("YourProgramIDHere");

// Initialize Solana and Anchor connections
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const provider = AnchorProvider.local(); // Using a local provider
const wallet = provider.wallet;

/**
 * Store IPFS hash in the Solana blockchain
 * @param {string} ipfsHash - The IPFS hash to store on Solana
 * @returns {Promise<void>}
 */
async function storePatientData(ipfsHash) {
  try {
    // Initialize Anchor program
    const program = new Program(idl, programID, provider);

    // Find a PDA to store patient data for the user
    const [patientDataPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("patient_data"), wallet.publicKey.toBuffer()],
      program.programId
    );

    // Send transaction to store IPFS hash on Solana
    await program.rpc.storePatientData(ipfsHash, {
      accounts: {
        patientData: patientDataPDA,
        user: wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [],
    });

    console.log("IPFS hash stored on Solana:", ipfsHash);
  } catch (error) {
    console.error("Failed to store IPFS hash on Solana:", error);
    throw error;
  }
}

module.exports = {
  storePatientData,
};
