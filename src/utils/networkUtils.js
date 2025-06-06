// Debug logging function
const debug = {
  log: (...args) => console.log('[Network]', ...args),
  error: (...args) => console.error('[Network Error]', ...args),
  warn: (...args) => console.warn('[Network Warning]', ...args),
  info: (...args) => console.info('[Network Info]', ...args),
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
    rpcUrls: ["https://ethereum-hoodi-rpc.publicnode.com"],
    blockExplorerUrls: ["https://hoodi.etherscan.io/"]
  }
};

export const switchNetwork = async (networkConfig) => {
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
