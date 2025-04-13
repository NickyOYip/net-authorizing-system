require("dotenv").config();

function checkEnv() {
  console.log("Checking environment variables...");
  
  // Check SEPOLIA_RPC_URL
  const sepoliaUrl = process.env.SEPOLIA_RPC_URL;
  if (!sepoliaUrl) {
    console.error("❌ SEPOLIA_RPC_URL is missing");
  } else {
    console.log("✅ SEPOLIA_RPC_URL is set");
    console.log(`   URL: ${sepoliaUrl.substring(0, 20)}...`);
  }
  
  // Check PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY is missing");
  } else {
    // Handle private key with or without 0x prefix
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    if (cleanKey.length !== 64) {
      console.error(`❌ PRIVATE_KEY has incorrect length: ${cleanKey.length} characters (should be 64 characters without 0x prefix)`);
      console.error(`   Make sure there are no newlines, spaces, or quotation marks in your .env file`);
    } else {
      console.log("✅ PRIVATE_KEY is set with correct length");
    }
    
    // Print first and last 4 characters for verification (don't print full key for security)
    const start = cleanKey.substring(0, 4);
    const end = cleanKey.substring(cleanKey.length - 4);
    console.log(`   Key starts with: ${start}... and ends with: ...${end}`);
  }
  
  // Check ETHERSCAN_API_KEY
  const etherscanKey = process.env.ETHERSCAN_API_KEY;
  if (!etherscanKey) {
    console.error("❌ ETHERSCAN_API_KEY is missing");
  } else {
    console.log("✅ ETHERSCAN_API_KEY is set");
    console.log(`   Key starts with: ${etherscanKey.substring(0, 4)}...`);
  }
}

checkEnv();
