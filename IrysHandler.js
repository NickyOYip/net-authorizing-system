import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";

const getIrysUploader = async () => {
  // RPC URLs change often. Use a current one from https://chainlist.org/
  const rpcURL = "https://sepolia.gateway.tenderly.co"; 
  PRIVATE_KEY = "194252f902a8480d62c1bf4b342e81e394f82ee65888ca89b9ddee4df93afe8d";
  const irysUploader = await Uploader(Ethereum)
    .withWallet(PRIVATE_KEY)
    .withRpc(rpcURL)
    .devnet();

  return irysUploader;
};

const fundAccount = async () => {
	const irysUploader = await getIrysUploader();
	try {
		const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(0.05));
		console.log(`Successfully funded ${irysUploader.utils.fromAtomic(fundTx.quantity)} ${irysUploader.token}`);
	} catch (e) {
		console.log("Error when funding ", e);
	}
};

const uploadData = async () => {
	const irysUploader = await getIrysUploader();
	const dataToUpload = "hirys world.";
	try {
		const receipt = await irysUploader.upload(dataToUpload);
		console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
	} catch (e) {
		console.log("Error when uploading ", e);
	}
};

const uploadFolder = async () => {
	const irysUploader = await getIrysUploader();

	// Upload an entire folder
	const folderToUpload = "./my-images/"; // Path to folder
	try {
		const receipt = await irysUploader.uploadFolder("./" + folderToUpload, {
			indexFile: "", // Optional index file (file the user will load when accessing the manifest)
			batchSize: 50, // Number of items to upload at once
			keepDeleted: false, // whether to keep now deleted items from previous uploads
		}); // Returns the manifest ID

		console.log(`Files uploaded. Manifest ID ${receipt.id}`);
	} catch (e) {
		console.log("Error when uploading ", e);
	}
};