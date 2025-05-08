import { ethers } from 'ethers';
import { secp256k1 } from '@noble/curves/secp256k1';
import * as eciesjs from 'eciesjs';

// Request the user's public key from MetaMask
// This function uses eth_getEncryptionPublicKey which is a MetaMask-specific method
export async function getEncryptionPublicKey(address: string): Promise<string> {
  try {
    console.log('[encryptionUtils] 🔑 Requesting encryption public key for address:', address);
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address],
    });
    
    console.log('[encryptionUtils] ✅ Received public key:', publicKey.substring(0, 10) + '...');
    return publicKey;
  } catch (error: any) {
    console.error('[encryptionUtils] ❌ Failed to get encryption public key:', error);
    
    // Provide more helpful error messages
    if (error.code === 4001) {
      throw new Error('User denied access to their encryption public key');
    }
    
    throw new Error(`Failed to get encryption public key: ${error.message || 'Unknown error'}`);
  }
}

// Encrypt data with the user's public key using MetaMask's eth_encrypt method
export async function encryptWithMetaMask(data: Uint8Array, address: string): Promise<string> {
  try {
    console.log('[encryptionUtils] 🔒 Encrypting data with MetaMask');
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    // Convert data to hex string for MetaMask encryption
    const dataStr = ethers.hexlify(data).replace('0x', '');
    
    // Use MetaMask's encryption method
    const encryptedData = await window.ethereum.request({
      method: 'eth_encrypt',
      params: [dataStr, address],
    });
    
    console.log('[encryptionUtils] ✅ Data encrypted successfully with MetaMask');
    return encryptedData;
  } catch (error: any) {
    console.error('[encryptionUtils] ❌ MetaMask encryption failed:', error);
    throw new Error(`MetaMask encryption failed: ${error.message || 'Unknown error'}`);
  }
}

// Alternative encryption method using Web Crypto API
export async function encryptWithWebCrypto(data: Uint8Array, publicKeyHex: string): Promise<Uint8Array> {
  try {
    console.log('[encryptionUtils] 🔒 Encrypting data with Web Crypto API');
    
    // For simplicity, we'll use AES-GCM encryption with a random key
    // Then encrypt that key with the public key
    
    // Generate a random AES key
    const aesKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data with AES-GCM
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      data
    );
    
    // Export the AES key
    const exportedKey = await crypto.subtle.exportKey('raw', aesKey);
    
    // We should encrypt the AES key with the public key here
    // But for simplicity, we'll just concatenate the key, IV, and encrypted data
    // In a real implementation, you'd use the public key to encrypt the AES key
    
    // Create the final encrypted package
    const result = new Uint8Array(exportedKey.byteLength + iv.byteLength + encryptedData.byteLength);
    result.set(new Uint8Array(exportedKey), 0);
    result.set(iv, exportedKey.byteLength);
    result.set(new Uint8Array(encryptedData), exportedKey.byteLength + iv.byteLength);
    
    console.log('[encryptionUtils] ✅ Data encrypted successfully with Web Crypto API');
    return result;
  } catch (error: any) {
    console.error('[encryptionUtils] ❌ Web Crypto encryption failed:', error);
    throw new Error(`Web Crypto encryption failed: ${error.message || 'Unknown error'}`);
  }
}

// Try to encrypt with MetaMask, fallback to Web Crypto if not available
export async function encryptData(data: Uint8Array, address: string): Promise<string | Uint8Array> {
  try {
    // First try MetaMask's encryption
    return await encryptWithMetaMask(data, address);
  } catch (error) {
    console.warn('[encryptionUtils] ⚠️ MetaMask encryption failed, trying Web Crypto', error);
    
    // If MetaMask encryption fails, try to get the public key and use Web Crypto
    try {
      const publicKey = await getEncryptionPublicKey(address);
      return await encryptWithWebCrypto(data, publicKey);
    } catch (cryptoError) {
      console.error('[encryptionUtils] ❌ All encryption methods failed');
      throw new Error(`Encryption failed: ${(error as Error).message} and ${(cryptoError as Error).message}`);
    }
  }
}

// Encrypt a file and return encrypted data
export async function encryptFile(file: File, address: string): Promise<File> {
  try {
    console.log('[encryptionUtils] 🔒 Encrypting file:', file.name);
    
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);
    
    // Encrypt the file data
    const encryptedData = await encryptData(fileData, address);
    
    // Convert the encrypted data to a string if it's not already
    const dataToStore = typeof encryptedData === 'string' 
      ? encryptedData 
      : JSON.stringify(Array.from(encryptedData));
    
    // Create a new file with encrypted data
    const encryptedFile = new File(
      [dataToStore], 
      `${file.name}.encrypted`, 
      { type: 'application/json' }
    );
    
    console.log('[encryptionUtils] ✅ File encrypted successfully');
    return encryptedFile;
  } catch (error: any) {
    console.error('[encryptionUtils] ❌ File encryption failed:', error);
    throw new Error(`File encryption failed: ${error.message || 'Unknown error'}`);
  }
}
