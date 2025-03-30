import { WebUploader } from "@irys/web-upload";

/**
 * Check the current balance for the connected wallet in Irys
 * @param irysUploader - The WebUploader instance
 * @returns The current balance
 */
export const checkBalance = async (irysUploader: WebUploader) => {
  try {
    const balance = await irysUploader.getBalance();
    console.log("Current balance:", balance);
    // Convert BigNumber to string to avoid serialization issues
    return balance.toString();
  } catch (error) {
    console.error("Error checking balance:", error);
    throw error;
  }
};

/**
 * Fund your Irys account with the specified amount
 * @param irysUploader - The WebUploader instance
 * @param amount - Amount to fund (in atomic units)
 * @returns The funding transaction details
 */
export const fundAccount = async (irysUploader: WebUploader, amount: string) => {
  try {
    console.log("Attempting to fund with testnet configuration...");
    
    // For testnet environments, we need very specific transaction settings
    const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(amount));
    
    console.log("Funding transaction:", fundTx);
    return fundTx;
  } catch (error) {
    console.error("Error funding account:", error);
    throw error;
  }
};

/**
 * Upload a file or data to Irys
 * @param irysUploader - The WebUploader instance
 * @param data - File or data to upload
 * @param tags - Optional metadata tags
 * @returns The upload receipt containing the transaction ID
 */
export const uploadData = async (
  irysUploader,
  data: File | Buffer | string,
) => {
  try {   
      const tags = [{ name: ".txt", value: "/txt" }];
      const receipt = await irysUploader.uploadFile(data, tags);
      console.log("Upload successful:", receipt.id);
      return receipt;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Get the price estimation for uploading data of certain size
 * @param irysUploader - The WebUploader instance
 * @param bytes - Size of data in bytes
 * @returns The estimated price
 */
export const getPrice = async (irysUploader: WebUploader, bytes: number) => {
  try {
    const price = await irysUploader.getPrice(bytes);
    console.log(`Cost to upload ${bytes} bytes:`, price);
    return price.toString();
  } catch (error) {
    console.error("Error getting price estimation:", error);
    throw error;
  }
};

/**
 * Get the connected wallet's address on Irys
 * @param irysUploader - The WebUploader instance
 * @returns The wallet address
 */
export const getAddress = (irysUploader: WebUploader) => {
  return irysUploader.address;
};