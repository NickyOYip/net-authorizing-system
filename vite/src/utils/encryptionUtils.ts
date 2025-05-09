import { encrypt, decrypt } from '@metamask/eth-sig-util';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';

/**
 * Get encryption public key from MetaMask
 */
export async function getEncryptionPublicKey(address: string): Promise<string> {
  try {
    console.log('[encryptionUtils] 🔑 Requesting encryption public key from MetaMask...');
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    // This method is supported in all MetaMask versions
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address]
    });
    
    console.log('[encryptionUtils] ✅ Public key obtained:', publicKey);
    return publicKey;
  } catch (error: any) {
    console.error('[encryptionUtils] ❌ Failed to get encryption public key:', error);
    
    if (error.code === 4001) {
      throw new Error('User denied access to their encryption public key');
    }
    
    throw new Error(`Failed to get encryption public key: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Encrypt data using eth-sig-util library
 */
export async function encryptWithMetaMask(data: string, address: string) {
  try {
    console.log('[encryptionUtils] 🔐 Requesting public key from MetaMask...');
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address]
    });

    console.log('[encryptionUtils] ✅ Public key obtained:', publicKey);

    const encryptedData = encrypt({
      publicKey: publicKey,
      data: data,
      version: 'x25519-xsalsa20-poly1305'
    });

    console.log('[encryptionUtils] ✅ Data encrypted:', encryptedData);
    return encryptedData;
  } catch (error) {
    console.error('[encryptionUtils] ❌ MetaMask encryption failed:', error);
    throw new Error(`MetaMask encryption failed: ${error.message}`);
  }
}

/**
 * Encrypt a file
 */
export async function encryptFile(file: File, address: string): Promise<File> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = Buffer.from(arrayBuffer).toString('base64');
    
    // Include file metadata in the encrypted package
    const fileData = {
      name: file.name,
      type: file.type,
      data: data
    };
    
    const encryptedData = await encryptWithMetaMask(JSON.stringify(fileData), address);
    const encryptedString = JSON.stringify(encryptedData);
    
    // Create a new file with encrypted data
    const encryptedFile = new File(
      [encryptedString], 
      `${file.name}.encrypted`, 
      { type: 'application/json' }
    );
    
    console.log('[encryptionUtils] ✅ File encrypted successfully');
    return encryptedFile;
  } catch (error) {
    console.error('[encryptionUtils] ❌ File encryption failed:', error);
    throw new Error(`File encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt data using private key
 */
export async function decryptWithPrivateKey(encryptedData: string, privateKey: string): Promise<string> {
  try {
    console.log('[encryptionUtils] 🔑 Attempting decryption with private key');
    
    // Make sure privateKey is in the right format (strip '0x' prefix if present)
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Parse the encrypted data - handle both string and object formats
    let encryptedDataObj;
    try {
      // If encryptedData is already a string representation of JSON, parse it
      encryptedDataObj = JSON.parse(encryptedData);
      console.log('[encryptionUtils] ✅ Successfully parsed encrypted data as JSON');
    } catch (parseError) {
      console.error('[encryptionUtils] ❌ Error parsing encrypted data:', parseError);
      throw new Error('Invalid encrypted data format');
    }
    
    // Attempt decryption using eth-sig-util
    try {
      console.log('[encryptionUtils] 🔄 Calling decrypt function...');
      const decryptedData = decrypt({
        encryptedData: encryptedDataObj,
        privateKey: formattedPrivateKey
      });
      
      console.log('[encryptionUtils] ✅ Decryption successful');
      return decryptedData;
    } catch (decryptError) {
      console.error('[encryptionUtils] ❌ Decryption function failed:', decryptError);
      throw new Error(`Decryption failed: ${decryptError.message || 'Invalid key or corrupted data'}`);
    }
  } catch (error) {
    console.error('[encryptionUtils] ❌ Client decryption failed:', error);
    throw new Error(`Client decryption failed: ${error.message}`);
  }
}

/**
 * Decrypt a file using private key
 */
export async function decryptFileWithPrivateKey(encryptedData: string, privateKey: string): Promise<File> {
  try {
    const decryptedData = await decryptWithPrivateKey(encryptedData, privateKey);
    const buffer = Buffer.from(decryptedData, 'base64');
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    return new File([arrayBuffer], 'decrypted_file', { type: 'application/octet-stream' });
  } catch (error) {
    console.error('[encryptionUtils] ❌ File decryption failed:', error);
    throw new Error(`File decryption failed: ${error.message}`);
  }
}

/**
 * Download and decrypt a file from Irys
 */
export async function downloadAndDecryptFile(
  fileId: string,
  userAddress: string,
  fileName: string = 'document',
  privateKey?: string
): Promise<void> {
  try {
    console.log('[encryptionUtils] 🔍 Downloading encrypted file from Irys:', fileId);
    
    // Fetch the file from Irys
    const response = await fetch(`https://gateway.irys.xyz/${fileId}`);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    // Log response details
    console.log('[encryptionUtils] 📄 Response headers:', {
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length'),
      status: response.status
    });
    
    // Get the encrypted data
    const encryptedData = await response.text();
    console.log('[encryptionUtils] ✅ File downloaded, size:', encryptedData.length, 'bytes');
    
    // If no private key provided, just download the encrypted file
    if (!privateKey) {
      console.log('[encryptionUtils] ℹ️ No private key provided, downloading encrypted file');
      downloadAsFile(encryptedData, `${fileName}.encrypted.json`, 'application/json');
      return;
    }
    
    // Try to parse the encrypted data as JSON
    let parsedEncryptedData;
    try {
      parsedEncryptedData = JSON.parse(encryptedData);
      console.log('[encryptionUtils] ✅ Successfully parsed encrypted data as JSON');
    } catch (jsonError) {
      console.error('[encryptionUtils] ❌ Error parsing encrypted data:', jsonError);
      downloadAsFile(encryptedData, fileName, 'application/octet-stream');
      throw new Error('Invalid encrypted data format - not valid JSON');
    }
    
    // Attempt decryption
    try {
      console.log('[encryptionUtils] 🔄 Attempting to decrypt data with private key');
      const decryptedData = await decryptWithPrivateKey(encryptedData, privateKey);
      
      // Try to handle the decrypted data in different ways
      await handleDecryptedData(decryptedData, fileName);
    } catch (decryptError) {
      console.error('[encryptionUtils] ❌ Decryption failed:', decryptError);
      downloadAsFile(encryptedData, `${fileName}.encrypted`, 'application/json');
      throw new Error(`Decryption failed: ${decryptError.message}`);
    }
  } catch (error) {
    console.error('[encryptionUtils] ❌ Download and decrypt failed:', error);
    throw new Error(`Download and decrypt failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Handle decrypted data and determine how to process it
 */
async function handleDecryptedData(decryptedData: string, fileName: string): Promise<void> {
  console.log('[encryptionUtils] 🔍 Analyzing decrypted data structure');
  
  // First try to parse as JSON with metadata
  try {
    // Check if decrypted data looks like JSON
    if (decryptedData.trim().startsWith('{') && decryptedData.trim().endsWith('}')) {
      const fileData = JSON.parse(decryptedData);
      console.log('[encryptionUtils] ✅ Successfully parsed decrypted data as JSON');
      
      // Check if this JSON contains metadata about a file
      if (fileData.name && (fileData.data || fileData.content)) {
        await handleJsonWithFileMetadata(fileData, fileName);
        return;
      } else {
        // Regular JSON data - download as JSON
        console.log('[encryptionUtils] ✅ Data appears to be a regular JSON document');
        const prettyJson = JSON.stringify(fileData, null, 2);
        downloadAsFile(prettyJson, fileName.endsWith('.json') ? fileName : `${fileName}.json`, 'application/json');
        return;
      }
    }
  } catch (jsonError) {
    console.log('[encryptionUtils] ℹ️ Decrypted data is not valid JSON, trying alternative formats');
  }
  
  // If not JSON, try handling as base64 or raw content
  await handleNonJsonData(decryptedData, fileName);
}

/**
 * Handle decrypted JSON data with file metadata
 */
async function handleJsonWithFileMetadata(
  fileData: any, 
  defaultFileName: string
): Promise<void> {
  console.log('[encryptionUtils] ✅ File metadata found in decrypted data');
  
  // Extract file content and metadata
  const outputFilename = fileData.name || defaultFileName;
  const fileType = fileData.type || getMimeTypeFromFileName(outputFilename);
  let fileContent = fileData.data || fileData.content;
  
  // Check if content is base64 encoded
  if (typeof fileContent === 'string' && isBase64(fileContent)) {
    try {
      console.log('[encryptionUtils] 🔄 Converting base64 content to binary');
      fileContent = Buffer.from(fileContent, 'base64');
      console.log('[encryptionUtils] ✅ Successfully decoded base64 data');
    } catch (e) {
      console.error('[encryptionUtils] ⚠️ Failed to convert from base64, using as-is:', e);
    }
  }
  
  console.log('[encryptionUtils] 📦 File information:', {
    name: outputFilename,
    type: fileType,
    contentLength: typeof fileContent === 'string' ? fileContent.length : fileContent.byteLength
  });
  
  // Download the file
  downloadAsFile(fileContent, outputFilename, fileType);
  console.log('[encryptionUtils] ✅ File downloaded successfully');
}

/**
 * Handle decrypted data that isn't JSON
 */
async function handleNonJsonData(data: string, fileName: string): Promise<void> {
  // Check if it's base64 encoded
  if (isBase64(data)) {
    try {
      console.log('[encryptionUtils] 🔍 Detected base64 encoded data, trying to decode');
      const binaryData = Buffer.from(data, 'base64');
      
      // Try to detect file type
      const fileExt = detectBinaryFileType(binaryData);
      const outputName = fileExt ? `${fileName.split('.')[0]}.${fileExt}` : fileName;
      const mimeType = getMimeTypeFromFileName(outputName);
      
      console.log('[encryptionUtils] ✅ Successfully decoded base64 data as binary');
      downloadAsFile(binaryData, outputName, mimeType);
      return;
    } catch (e) {
      console.error('[encryptionUtils] ⚠️ Error processing base64 data:', e);
    }
  }
  
  // If all else fails, treat as plain text
  console.log('[encryptionUtils] 📄 Processing as plain text');
  downloadAsFile(data, fileName, 'text/plain');
}

/**
 * Check if a string is likely base64 encoded
 */
function isBase64(str: string): boolean {
  // Base64 pattern check (not perfect but good enough for most cases)
  if (str.length % 4 !== 0) {
    return false;
  }
  
  // More strict check for base64 format
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  const isPattern = base64Regex.test(str);
  
  // Check for common base64 binary content indicators
  const hasCommonPrefixes = 
    str.startsWith('JVBERi0') || // PDF
    str.startsWith('R0lGODlh') || // GIF
    str.startsWith('iVBORw0') || // PNG
    str.startsWith('/9j/4AA') || // JPEG
    str.startsWith('UEsDBB'); // ZIP/Office
  
  return isPattern || hasCommonPrefixes;
}

/**
 * Try to detect file type from binary data
 */
function detectBinaryFileType(data: Buffer | Uint8Array): string | null {
  // Simple file type detection based on magic numbers
  const bytes = new Uint8Array(data instanceof Buffer ? data.buffer : data);
  
  // PDF: %PDF (hex: 25 50 44 46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'pdf';
  }
  
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'png';
  }
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'jpg';
  }
  
  // More file types can be added here
  
  return null;
}

// Helper function to download data as a file
function downloadAsFile(data: string | ArrayBuffer | Uint8Array, fileName: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  
  console.log('[encryptionUtils] ✅ File download initiated:', fileName);
}

// Helper function to determine MIME type from filename
function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'zip': 'application/zip',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}
