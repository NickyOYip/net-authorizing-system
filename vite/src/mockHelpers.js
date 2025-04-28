// =====================
// 📡 1. Contract State/Getter Mocks (simulate reading from contract)
// =====================

// Dashboard stats (could be from a contract or backend)
export const mockStats = {
  broadcast: 0,
  public: 0,
  private: 0,
  verified: 0
};

// List of contracts (simulate getAllContracts or similar contract call)
export const mockContracts = [
  {
    id: '0xabc',
    title: 'Employment Certificate',
    recipient: 'john.doe@example.com',
    owner: '0x123...def',
    created: '2025-04-05',
    status: 'Pending Activation',
    activeVersion: '-'
  },
  {
    id: '0xdef',
    title: 'Course Completion Certificate',
    recipient: 'jane.smith@example.com',
    owner: '0x123...def',
    created: '2025-04-08',
    status: 'Active',
    activeVersion: '1'
  },
  {
    id: '0xghi',
    title: 'Property Lease Document',
    recipient: 'tenant@example.com',
    owner: '0xabc...def',
    created: '2025-04-10',
    status: 'Pending Activation',
    activeVersion: '-'
  }
];

// Contract detail (simulate getContractById or similar contract call)
export const mockContractDetail = (id) => ({
  id: id || '0xabc',
  title: 'Employment Certificate',
  description: 'Official employment certificate issued to employee',
  owner: '0x123...def',
  recipient: 'john.doe@example.com',
  created: '2025-04-05',
  status: 'Active',
  type: 'public',
  versions: [
    {
      version: 1,
      hash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      timestamp: '2025-04-05 14:30:22',
      size: '2.4 MB',
      fileType: 'PDF'
    },
    {
      version: 2,
      hash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
      timestamp: '2025-04-10 09:15:43',
      size: '2.5 MB',
      fileType: 'PDF'
    }
  ],
  currentVersion: 2
});

// =====================
// 📡 2. Event Query Mocks (simulate reading from blockchain events)
// =====================

// (No explicit event query mocks in current code, but if you had e.g. "get all contracts by event", you'd cluster here)

// =====================
// 📡 3. Contract Write/Call Mocks (simulate sending tx or calling contract function)
// =====================

// Download action (simulate download from contract/file storage)
export function mockDownload(versionHash) {
  console.log(`Downloading version: ${versionHash}`);
  alert(`Downloading file version: ${versionHash}`);
}

// Verification (simulate contract verification logic)
export function mockVerify(setVerificationResult, setIsVerifying) {
  setTimeout(() => {
    const isVerified = Math.random() > 0.5;
    setVerificationResult({
      verified: isVerified,
      message: isVerified
        ? 'Document verified successfully!'
        : 'Document verification failed'
    });
    setIsVerifying(false);
  }, 1500);
}

// Activation (simulate contract activation logic)
export function mockActivate({ address, id, activationCode, jsonHash, fileHash }, setActivated, setErrorMessage) {
  if (address !== id) {
    setActivated(false);
    setErrorMessage("Invalid contract address.");
    return;
  }
  if (activationCode !== mockActiveCode) {
    setActivated(false);
    setErrorMessage("Invalid Activation Code.");
    return;
  }
  if (jsonHash !== mockMetaHash) {
    setActivated(false);
    setErrorMessage("Invalid METADATA File.");
    return;
  }
  if (fileHash !== mockDocHash) {
    setActivated(false);
    setErrorMessage("Invalid Document Soft Copy.");
    return;
  }
  setActivated(true);
}

// =====================
// 📡 4. File Upload/Storage Mocks (simulate uploading to Arweave/Irys or similar)
// =====================

// (No explicit file upload mocks in current code, but if you had e.g. "uploadFile", you'd cluster here)

// =====================
// 📡 5. Hash Generation Mocks (simulate hashing files)
// =====================

// (Hashing is done inline in your components, but if you want to mock, you could add here)

// =====================
// 📡 6. Wallet/Connection State Mocks (simulate wallet connection, balances, etc.)
// =====================

export const mockEthBalance = "1.2345";
export const mockIrysBalance = "5678";
export const mockProvider = "MetaMask";

// =====================
// 📡 7. Miscellaneous/Constants
// =====================

export const mockMetaHash = "0510023a4953f2ee3f36a789812cd2b03cf01c241a24ff25fdfb7207584746e7";
export const mockDocHash = "72d57b40b79b75a4dff4aa939098c42a6ded03d77bf21b11e3b0b03564008299";
export const mockActiveCode = "8978398r7389";
