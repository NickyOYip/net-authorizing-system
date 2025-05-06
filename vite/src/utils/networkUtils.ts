// Debug logging function
const debug = {
  log: (...args: any[]) => console.log('[Network]', ...args),
  error: (...args: any[]) => console.error('[Network Error]', ...args),
  warn: (...args: any[]) => console.warn('[Network Warning]', ...args),
  info: (...args: any[]) => console.info('[Network Info]', ...args),
};

export const NETWORKS = {
  SEPOLIA: {
    chainId: "0xaa36a7",
    chainName: "Sepolia",
    rpcUrls: ["https://0xrpc.io/sep"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  HOODI: {
    chainId: "0x88bb0",
    chainName: "Hoodi Testnet",
    rpcUrls: ["https://0xrpc.io/hoodi"],
    blockExplorerUrls: ["https://hoodi.etherscan.io/"]
  }
};

export const switchNetwork = async (networkConfig: typeof NETWORKS.HOODI) => {
  if (!window.ethereum) {
    debug.warn('No ethereum provider found');
    return false;
  }
  
  try {
    debug.log(`Switching to network: ${networkConfig.chainName}`);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });
    debug.info(`Successfully switched to ${networkConfig.chainName}`);
    return true;
  } catch (error) {
    debug.error("Network switch failed:", error);
    return false;
  }
};
