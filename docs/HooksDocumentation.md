# Contract Hooks Usage Guide

This document provides examples and use cases for all the contract hooks in the system.

## Table of Contents
- [Setup and Installation](#setup-and-installation)
- [Master Factory Hook](#master-factory-hook)
- [Factory Hooks](#factory-hooks)
  - [Broadcast Factory](#broadcast-factory)
  - [Public Factory](#public-factory)
  - [Private Factory](#private-factory)
- [Contract Hooks](#contract-hooks)
  - [Broadcast Contract](#broadcast-contract)
  - [Public Contract](#public-contract)
  - [Private Contract](#private-contract)
- [SubContract Hooks](#subcontract-hooks)
  - [Broadcast SubContract](#broadcast-subcontract)
  - [Public SubContract](#public-subcontract)
  - [Private SubContract](#private-subcontract)
- [Helper Hooks](#helper-hooks)
  - [File Verification](#file-verification)
  - [Irys Uploader](#irys-uploader)
- [Complete Flow Examples](#complete-flow-examples)

## Setup and Installation

Import hooks as needed in your React components:

```tsx
import { 
  useMasterFactory, 
  useBroadcastFactory,
  useBroadcastContract, 
  useBroadcastSubContract,
  useFileVerification 
} from '../hooks/contractHook';
```

Make sure the `DataProvider` is set up in your app to provide the required context:

```tsx
// Example of how your app structure should look
import { DataProvider } from './provider/dataProvider';

function App() {
  return (
    <DataProvider>
      <YourComponents />
    </DataProvider>
  );
}
```

## Master Factory Hook

The `useMasterFactory` hook is used to interact with the main factory contract that manages versions of other factories.

### Getting Current Factory Addresses

```tsx
import { useMasterFactory } from '../hooks/contractHook';

function FactoryManager() {
  const { 
    getCurrentFactories, 
    getCurrentVersionNumbers, 
    isLoading, 
    error 
  } = useMasterFactory();

  const [factories, setFactories] = useState({
    broadcastFactory: '',
    publicFactory: '',
    privateFactory: ''
  });
  
  const [versions, setVersions] = useState({
    broadcastVer: 0,
    publicVer: 0,
    privateVer: 0
  });

  useEffect(() => {
    async function fetchFactories() {
      try {
        const currentFactories = await getCurrentFactories();
        setFactories(currentFactories);
        
        const versionNumbers = await getCurrentVersionNumbers();
        setVersions(versionNumbers);
      } catch (err) {
        console.error("Failed to fetch factory addresses:", err);
      }
    }
    
    fetchFactories();
  }, [getCurrentFactories, getCurrentVersionNumbers]);

  if (isLoading) return <div>Loading factories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Factory Addresses</h2>
      <ul>
        <li>Broadcast Factory: {factories.broadcastFactory} (v{versions.broadcastVer})</li>
        <li>Public Factory: {factories.publicFactory} (v{versions.publicVer})</li>
        <li>Private Factory: {factories.privateFactory} (v{versions.privateVer})</li>
      </ul>
    </div>
  );
}
```

### Adding a New Factory Version (Admin Only)

```tsx
import { useMasterFactory } from '../hooks/contractHook';

function AdminFactoryManager() {
  const { addFactoryVersion, updateFactoryVersion, isLoading, error } = useMasterFactory();
  const [newFactoryAddress, setNewFactoryAddress] = useState('');
  const [factoryType, setFactoryType] = useState<'broadcast' | 'public' | 'private'>('broadcast');
  const [versionToUse, setVersionToUse] = useState(1);

  const handleAddFactory = async () => {
    try {
      const result = await addFactoryVersion(factoryType, newFactoryAddress);
      console.log(`New factory version added: ${result.verNo}`);
      setNewFactoryAddress('');
    } catch (err) {
      console.error("Failed to add factory version:", err);
    }
  };

  const handleUpdateVersion = async () => {
    try {
      const result = await updateFactoryVersion(factoryType, versionToUse);
      console.log(`Factory version updated to: ${result.verNo}`);
    } catch (err) {
      console.error("Failed to update factory version:", err);
    }
  };

  return (
    <div>
      <h2>Add New Factory Version</h2>
      <div>
        <select value={factoryType} onChange={e => setFactoryType(e.target.value as any)}>
          <option value="broadcast">Broadcast Factory</option>
          <option value="public">Public Factory</option>
          <option value="private">Private Factory</option>
        </select>
        <input
          value={newFactoryAddress}
          onChange={e => setNewFactoryAddress(e.target.value)}
          placeholder="New Factory Address"
        />
        <button onClick={handleAddFactory} disabled={isLoading}>Add Factory</button>
      </div>

      <h2>Update Current Factory Version</h2>
      <div>
        <select value={factoryType} onChange={e => setFactoryType(e.target.value as any)}>
          <option value="broadcast">Broadcast Factory</option>
          <option value="public">Public Factory</option>
          <option value="private">Private Factory</option>
        </select>
        <input
          type="number"
          value={versionToUse}
          onChange={e => setVersionToUse(Number(e.target.value))}
          placeholder="Version Number"
        />
        <button onClick={handleUpdateVersion} disabled={isLoading}>Update Version</button>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Factory Hooks

### Broadcast Factory

The `useBroadcastFactory` hook is used to create and manage broadcast contracts.

```tsx
import { useBroadcastFactory } from '../hooks/contractHook';

function BroadcastFactoryManager({ factoryAddress }: { factoryAddress: string }) {
  const { createBroadcastContract, getAllBroadcastContracts, isLoading, error } = useBroadcastFactory();
  const [contractTitle, setContractTitle] = useState('');
  const [contracts, setContracts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const allContracts = await getAllBroadcastContracts(factoryAddress);
        setContracts(allContracts);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
      }
    }
    
    if (factoryAddress) {
      fetchContracts();
    }
  }, [factoryAddress, getAllBroadcastContracts]);

  const handleCreateContract = async () => {
    try {
      const event = await createBroadcastContract(factoryAddress, { title: contractTitle });
      console.log(`New contract created: ${event.contractAddr}`);
      setContractTitle('');
      
      // Refresh contract list
      const allContracts = await getAllBroadcastContracts(factoryAddress);
      setContracts(allContracts);
    } catch (err) {
      console.error("Failed to create contract:", err);
    }
  };

  return (
    <div>
      <h2>Create Broadcast Contract</h2>
      <input
        value={contractTitle}
        onChange={e => setContractTitle(e.target.value)}
        placeholder="Contract Title"
      />
      <button onClick={handleCreateContract} disabled={isLoading}>Create Contract</button>
      
      <h3>Existing Contracts</h3>
      {contracts.length > 0 ? (
        <ul>
          {contracts.map((address, index) => (
            <li key={index}>{address}</li>
          ))}
        </ul>
      ) : (
        <p>No contracts found</p>
      )}
      
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Public Factory

The `usePublicFactory` hook is used to create and manage public contracts.

```tsx
import { usePublicFactory } from '../hooks/contractHook';

function PublicFactoryManager({ factoryAddress }: { factoryAddress: string }) {
  const { createPublicContract, getAllPublicContracts, isLoading, error } = usePublicFactory();
  const [contractTitle, setContractTitle] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [contracts, setContracts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const allContracts = await getAllPublicContracts(factoryAddress);
        setContracts(allContracts);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
      }
    }
    
    if (factoryAddress) {
      fetchContracts();
    }
  }, [factoryAddress, getAllPublicContracts]);

  const handleCreateContract = async () => {
    try {
      const event = await createPublicContract(factoryAddress, { 
        title: contractTitle,
        activationCode
      });
      console.log(`New contract created: ${event.contractAddr}`);
      setContractTitle('');
      setActivationCode('');
      
      // Refresh contract list
      const allContracts = await getAllPublicContracts(factoryAddress);
      setContracts(allContracts);
    } catch (err) {
      console.error("Failed to create contract:", err);
    }
  };

  return (
    <div>
      <h2>Create Public Contract</h2>
      <input
        value={contractTitle}
        onChange={e => setContractTitle(e.target.value)}
        placeholder="Contract Title"
      />
      <input
        value={activationCode}
        onChange={e => setActivationCode(e.target.value)}
        placeholder="Activation Code"
        type="password"
      />
      <button onClick={handleCreateContract} disabled={isLoading}>Create Contract</button>
      
      <h3>Existing Contracts</h3>
      {contracts.length > 0 ? (
        <ul>
          {contracts.map((address, index) => (
            <li key={index}>{address}</li>
          ))}
        </ul>
      ) : (
        <p>No contracts found</p>
      )}
      
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Private Factory

The `usePrivateFactory` hook is used to create and manage private contracts.

```tsx
import { usePrivateFactory } from '../hooks/contractHook';

function PrivateFactoryManager({ factoryAddress }: { factoryAddress: string }) {
  const { createPrivateContract, getAllPrivateContracts, isLoading, error } = usePrivateFactory();
  const [contractTitle, setContractTitle] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [contracts, setContracts] = useState<string[]>([]);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const allContracts = await getAllPrivateContracts(factoryAddress);
        setContracts(allContracts);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
      }
    }
    
    if (factoryAddress) {
      fetchContracts();
    }
  }, [factoryAddress, getAllPrivateContracts]);

  const handleCreateContract = async () => {
    try {
      const event = await createPrivateContract(factoryAddress, { 
        title: contractTitle,
        activationCode
      });
      console.log(`New contract created: ${event.contractAddr}`);
      setContractTitle('');
      setActivationCode('');
      
      // Refresh contract list
      const allContracts = await getAllPrivateContracts(factoryAddress);
      setContracts(allContracts);
    } catch (err) {
      console.error("Failed to create contract:", err);
    }
  };

  return (
    <div>
      <h2>Create Private Contract</h2>
      <input
        value={contractTitle}
        onChange={e => setContractTitle(e.target.value)}
        placeholder="Contract Title"
      />
      <input
        value={activationCode}
        onChange={e => setActivationCode(e.target.value)}
        placeholder="Activation Code"
        type="password"
      />
      <button onClick={handleCreateContract} disabled={isLoading}>Create Contract</button>
      
      <h3>Existing Contracts</h3>
      {contracts.length > 0 ? (
        <ul>
          {contracts.map((address, index) => (
            <li key={index}>{address}</li>
          ))}
        </ul>
      ) : (
        <p>No contracts found</p>
      )}
      
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

## Contract Hooks

### Broadcast Contract

The `useBroadcastContract` hook is used to manage broadcast contracts and their sub-contracts.

```tsx
import { useBroadcastContract } from '../hooks/contractHook';
import { useFileVerification, useIrysUploader } from '../hooks/contractHook/helpers';

function BroadcastContractManager({ contractAddress }: { contractAddress: string }) {
  const { 
    getContractDetails, 
    addNewBroadcastSubContract, 
    getCurrentVersion,
    isLoading, 
    error 
  } = useBroadcastContract();
  const { uploadFile } = useIrysUploader();
  
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [currentVersionAddr, setCurrentVersionAddr] = useState<string>('');
  
  // State for new version
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<number>(Math.floor(Date.now() / 1000));
  const [endDate, setEndDate] = useState<number>(Math.floor(Date.now() / 1000) + 31536000); // +1 year

  useEffect(() => {
    async function fetchDetails() {
      try {
        const details = await getContractDetails(contractAddress);
        setContractDetails(details);
        
        const currentVer = await getCurrentVersion(contractAddress);
        setCurrentVersionAddr(currentVer);
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
      }
    }
    
    if (contractAddress) {
      fetchDetails();
    }
  }, [contractAddress, getContractDetails, getCurrentVersion]);

  const handleAddNewVersion = async () => {
    if (!jsonFile || !softCopyFile) {
      alert('Please select both JSON and soft copy files');
      return;
    }
    
    try {
      // Upload files to Arweave via Irys
      const jsonUpload = await uploadFile(jsonFile);
      const softCopyUpload = await uploadFile(softCopyFile);
      
      // Create new sub-contract
      const event = await addNewBroadcastSubContract(contractAddress, {
        jsonHash: jsonUpload.fileHash,
        softCopyHash: softCopyUpload.fileHash,
        storageLink: `${jsonUpload.txId},${softCopyUpload.txId}`, // Combine TxIDs
        startDate,
        endDate
      });
      
      console.log(`New sub-contract created: ${event.subContractAddr}`);
      
      // Update current version
      const currentVer = await getCurrentVersion(contractAddress);
      setCurrentVersionAddr(currentVer);
    } catch (err) {
      console.error("Failed to add new version:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Broadcast Contract Details</h2>
      {contractDetails && (
        <div>
          <p>Owner: {contractDetails.owner}</p>
          <p>Title: {contractDetails.title}</p>
          <p>Total Versions: {contractDetails.totalVerNo}</p>
          <p>Active Version: {contractDetails.activeVer}</p>
          <p>Current Version Address: {currentVersionAddr}</p>
        </div>
      )}
      
      <h3>Add New Version</h3>
      <div>
        <div>
          <label>JSON File:</label>
          <input 
            type="file" 
            accept="application/json"
            onChange={e => e.target.files && setJsonFile(e.target.files[0])} 
          />
        </div>
        
        <div>
          <label>Soft Copy File:</label>
          <input 
            type="file" 
            onChange={e => e.target.files && setSoftCopyFile(e.target.files[0])} 
          />
        </div>
        
        <div>
          <label>Start Date:</label>
          <input 
            type="date"
            onChange={e => {
              const date = new Date(e.target.value);
              setStartDate(Math.floor(date.getTime() / 1000));
            }}
          />
        </div>
        
        <div>
          <label>End Date:</label>
          <input 
            type="date"
            onChange={e => {
              const date = new Date(e.target.value);
              setEndDate(Math.floor(date.getTime() / 1000));
            }}
          />
        </div>
        
        <button onClick={handleAddNewVersion} disabled={isLoading}>
          Add New Version
        </button>
      </div>
    </div>
  );
}
```

### Public Contract

The `usePublicContract` hook is used to manage public contracts and their sub-contracts.

```tsx
import { usePublicContract } from '../hooks/contractHook';
import { useIrysUploader } from '../hooks/contractHook/helpers';

function PublicContractManager({ contractAddress }: { contractAddress: string }) {
  const { 
    getContractDetails, 
    addNewPublicSubContract, 
    activate,
    getCurrentVersion,
    isLoading, 
    error 
  } = usePublicContract();
  const { uploadFile } = useIrysUploader();
  
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [currentVersionAddr, setCurrentVersionAddr] = useState<string>('');
  
  // State for new version
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<number>(Math.floor(Date.now() / 1000));
  const [endDate, setEndDate] = useState<number>(Math.floor(Date.now() / 1000) + 31536000); // +1 year
  
  // State for activation
  const [activationCode, setActivationCode] = useState<string>('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const details = await getContractDetails(contractAddress);
        setContractDetails(details);
        
        const currentVer = await getCurrentVersion(contractAddress);
        setCurrentVersionAddr(currentVer);
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
      }
    }
    
    if (contractAddress) {
      fetchDetails();
    }
  }, [contractAddress, getContractDetails, getCurrentVersion]);

  const handleAddNewVersion = async () => {
    if (!jsonFile || !softCopyFile) {
      alert('Please select both JSON and soft copy files');
      return;
    }
    
    try {
      // Upload files to Arweave via Irys
      const jsonUpload = await uploadFile(jsonFile);
      const softCopyUpload = await uploadFile(softCopyFile);
      
      // Create new sub-contract
      const event = await addNewPublicSubContract(contractAddress, {
        jsonHash: jsonUpload.fileHash,
        softCopyHash: softCopyUpload.fileHash,
        storageLink: `${jsonUpload.txId},${softCopyUpload.txId}`, // Combine TxIDs
        startDate,
        endDate
      });
      
      console.log(`New sub-contract created: ${event.subContractAddr}`);
      
      // Update current version
      const currentVer = await getCurrentVersion(contractAddress);
      setCurrentVersionAddr(currentVer);
    } catch (err) {
      console.error("Failed to add new version:", err);
    }
  };
  
  const handleActivate = async () => {
    if (!activationCode) {
      alert('Please enter activation code');
      return;
    }
    
    try {
      const event = await activate(contractAddress, activationCode);
      console.log(`Contract activated by user: ${event.userAddr}`);
      
      // Refresh contract details
      const details = await getContractDetails(contractAddress);
      setContractDetails(details);
    } catch (err) {
      console.error("Failed to activate contract:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Public Contract Details</h2>
      {contractDetails && (
        <div>
          <p>Owner: {contractDetails.owner}</p>
          <p>User: {contractDetails.user || 'Not activated yet'}</p>
          <p>Title: {contractDetails.title}</p>
          <p>Total Versions: {contractDetails.totalVerNo}</p>
          <p>Active Version: {contractDetails.activeVer}</p>
          <p>Current Version Address: {currentVersionAddr}</p>
        </div>
      )}
      
      {/* Activation section - only show if not activated yet */}
      {contractDetails && !contractDetails.user && (
        <div>
          <h3>Activate Contract</h3>
          <input
            type="password"
            value={activationCode}
            onChange={e => setActivationCode(e.target.value)}
            placeholder="Activation Code"
          />
          <button onClick={handleActivate}>Activate</button>
        </div>
      )}
      
      {/* New version section - only show for owner */}
      {contractDetails && window.ethereum && 
       window.ethereum.selectedAddress?.toLowerCase() === contractDetails.owner.toLowerCase() && (
        <>
          <h3>Add New Version</h3>
          <div>
            <div>
              <label>JSON File:</label>
              <input 
                type="file" 
                accept="application/json"
                onChange={e => e.target.files && setJsonFile(e.target.files[0])} 
              />
            </div>
            
            <div>
              <label>Soft Copy File:</label>
              <input 
                type="file" 
                onChange={e => e.target.files && setSoftCopyFile(e.target.files[0])} 
              />
            </div>
            
            <div>
              <label>Start Date:</label>
              <input 
                type="date"
                onChange={e => {
                  const date = new Date(e.target.value);
                  setStartDate(Math.floor(date.getTime() / 1000));
                }}
              />
            </div>
            
            <div>
              <label>End Date:</label>
              <input 
                type="date"
                onChange={e => {
                  const date = new Date(e.target.value);
                  setEndDate(Math.floor(date.getTime() / 1000));
                }}
              />
            </div>
            
            <button onClick={handleAddNewVersion} disabled={isLoading}>
              Add New Version
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Private Contract

The `usePrivateContract` hook is used to manage private contracts and their sub-contracts.

```tsx
import { usePrivateContract } from '../hooks/contractHook';
import { useFileVerification } from '../hooks/contractHook/helpers';

function PrivateContractManager({ contractAddress }: { contractAddress: string }) {
  const { 
    getContractDetails, 
    addNewPrivateSubContract, 
    activate,
    getCurrentVersion,
    isLoading, 
    error 
  } = usePrivateContract();
  const { generateFileHash } = useFileVerification();
  
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [currentVersionAddr, setCurrentVersionAddr] = useState<string>('');
  
  // State for new version
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState<number>(Math.floor(Date.now() / 1000));
  const [endDate, setEndDate] = useState<number>(Math.floor(Date.now() / 1000) + 31536000); // +1 year
  
  // State for activation
  const [activationCode, setActivationCode] = useState<string>('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const details = await getContractDetails(contractAddress);
        setContractDetails(details);
        
        const currentVer = await getCurrentVersion(contractAddress);
        setCurrentVersionAddr(currentVer);
      } catch (err) {
        console.error("Failed to fetch contract details:", err);
      }
    }
    
    if (contractAddress) {
      fetchDetails();
    }
  }, [contractAddress, getContractDetails, getCurrentVersion]);

  const handleAddNewVersion = async () => {
    if (!jsonFile || !softCopyFile) {
      alert('Please select both JSON and soft copy files');
      return;
    }
    
    try {
      // Generate file hashes
      const jsonHash = await generateFileHash(jsonFile);
      const softCopyHash = await generateFileHash(softCopyFile);
      
      // Create new sub-contract (note: no storageLink for private contracts)
      const event = await addNewPrivateSubContract(contractAddress, {
        jsonHash,
        softCopyHash,
        startDate,
        endDate
      });
      
      console.log(`New sub-contract created: ${event.subContractAddr}`);
      
      // Update current version
      const currentVer = await getCurrentVersion(contractAddress);
      setCurrentVersionAddr(currentVer);
    } catch (err) {
      console.error("Failed to add new version:", err);
    }
  };
  
  const handleActivate = async () => {
    if (!activationCode) {
      alert('Please enter activation code');
      return;
    }
    
    try {
      const event = await activate(contractAddress, activationCode);
      console.log(`Contract activated by user: ${event.userAddr}`);
      
      // Refresh contract details
      const details = await getContractDetails(contractAddress);
      setContractDetails(details);
    } catch (err) {
      console.error("Failed to activate contract:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Private Contract Details</h2>
      {contractDetails && (
        <div>
          <p>Owner: {contractDetails.owner}</p>
          <p>User: {contractDetails.user || 'Not activated yet'}</p>
          <p>Title: {contractDetails.title}</p>
          <p>Total Versions: {contractDetails.totalVerNo}</p>
          <p>Active Version: {contractDetails.activeVer}</p>
          <p>Current Version Address: {currentVersionAddr}</p>
        </div>
      )}
      
      {/* Activation section - only show if not activated yet */}
      {contractDetails && !contractDetails.user && (
        <div>
          <h3>Activate Contract</h3>
          <input
            type="password"
            value={activationCode}
            onChange={e => setActivationCode(e.target.value)}
            placeholder="Activation Code"
          />
          <button onClick={handleActivate}>Activate</button>
        </div>
      )}
      
      {/* New version section - only show for owner */}
      {contractDetails && window.ethereum && 
       window.ethereum.selectedAddress?.toLowerCase() === contractDetails.owner.toLowerCase() && (
        <>
          <h3>Add New Version</h3>
          <div>
            <div>
              <label>JSON File:</label>
              <input 
                type="file" 
                accept="application/json"
                onChange={e => e.target.files && setJsonFile(e.target.files[0])} 
              />
            </div>
            
            <div>
              <label>Soft Copy File:</label>
              <input 
                type="file" 
                onChange={e => e.target.files && setSoftCopyFile(e.target.files[0])} 
              />
            </div>
            
            <div>
              <label>Start Date:</label>
              <input 
                type="date"
                onChange={e => {
                  const date = new Date(e.target.value);
                  setStartDate(Math.floor(date.getTime() / 1000));
                }}
              />
            </div>
            
            <div>
              <label>End Date:</label>
              <input 
                type="date"
                onChange={e => {
                  const date = new Date(e.target.value);
                  setEndDate(Math.floor(date.getTime() / 1000));
                }}
              />
            </div>
            
            <button onClick={handleAddNewVersion} disabled={isLoading}>
              Add New Version
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

## SubContract Hooks

### Broadcast SubContract

The `useBroadcastSubContract` hook is used to interact with broadcast sub-contracts.

```tsx
import { useBroadcastSubContract } from '../hooks/contractHook';
import { useFileVerification } from '../hooks/contractHook/helpers';

function BroadcastSubContractViewer({ subContractAddress }: { subContractAddress: string }) {
  const { getSubContractDetails, updateStatus, isLoading, error } = useBroadcastSubContract();
  const { verifyFile, generateFileHash } = useFileVerification();
  
  const [details, setDetails] = useState<any>(null);
  const [fileToVerify, setFileToVerify] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'json' | 'softCopy'>('json');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const subContractDetails = await getSubContractDetails(subContractAddress);
        setDetails(subContractDetails);
      } catch (err) {
        console.error("Failed to fetch sub-contract details:", err);
      }
    }
    
    if (subContractAddress) {
      fetchDetails();
    }
  }, [subContractAddress, getSubContractDetails]);

  const handleVerifyFile = async () => {
    if (!fileToVerify) {
      alert('Please select a file to verify');
      return;
    }
    
    try {
      const fileHash = await generateFileHash(fileToVerify);
      const result = await verifyFile(subContractAddress, fileHash, fileType);
      setVerificationResult(result.isValid);
    } catch (err) {
      console.error("File verification failed:", err);
      setVerificationResult(false);
    }
  };
  
  const handleStatusUpdate = async (newStatus: number) => {
    try {
      await updateStatus(subContractAddress, newStatus);
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Broadcast Sub-Contract Details</h2>
      {details && (
        <div>
          <p>Owner: {details.owner}</p>
          <p>Parent Contract: {details.broadcastContractAddr}</p>
          <p>Status: {details.status === 0 ? 'Active' : 'Disabled'}</p>
          <p>Version: {details.version}</p>
          <p>JSON Hash: {details.jsonHash}</p>
          <p>Soft Copy Hash: {details.softCopyHash}</p>
          <p>Storage Link: {details.storageLink}</p>
          <p>Start Date: {new Date(details.startDate * 1000).toLocaleDateString()}</p>
          <p>End Date: {new Date(details.endDate * 1000).toLocaleDateString()}</p>
          <p>Deploy Time: {new Date(details.deployTime * 1000).toLocaleString()}</p>
        </div>
      )}
      
      <h3>Verify File</h3>
      <div>
        <select value={fileType} onChange={e => setFileType(e.target.value as 'json' | 'softCopy')}>
          <option value="json">JSON File</option>
          <option value="softCopy">Soft Copy File</option>
        </select>
        
        <input 
          type="file" 
          onChange={e => e.target.files && setFileToVerify(e.target.files[0])} 
        />
        
        <button onClick={handleVerifyFile}>Verify</button>
        
        {verificationResult !== null && (
          <p>
            Verification Result: 
            <strong style={{ color: verificationResult ? 'green' : 'red' }}>
              {verificationResult ? 'Valid' : 'Invalid'}
            </strong>
          </p>
        )}
      </div>
      
      {/* Status update buttons - only show for owner or parent */}
      {details && window.ethereum && (
        window.ethereum.selectedAddress?.toLowerCase() === details.owner.toLowerCase() ||
        window.ethereum.selectedAddress?.toLowerCase() === details.broadcastContractAddr.toLowerCase()
      ) && (
        <div>
          <h3>Update Status</h3>
          <button onClick={() => handleStatusUpdate(0)} disabled={details.status === 0}>
            Set Active
          </button>
          <button onClick={() => handleStatusUpdate(1)} disabled={details.status === 1}>
            Set Disabled
          </button>
        </div>
      )}
    </div>
  );
}
```

### Public SubContract

The `usePublicSubContract` hook is used to interact with public sub-contracts.

```tsx
import { usePublicSubContract } from '../hooks/contractHook';
import { useFileVerification } from '../hooks/contractHook/helpers';

function PublicSubContractViewer({ subContractAddress }: { subContractAddress: string }) {
  const { getSubContractDetails, updateStatus, setUser, isLoading, error } = usePublicSubContract();
  const { verifyFile, generateFileHash } = useFileVerification();
  
  const [details, setDetails] = useState<any>(null);
  const [fileToVerify, setFileToVerify] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'json' | 'softCopy'>('json');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [newUserAddress, setNewUserAddress] = useState<string>('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const subContractDetails = await getSubContractDetails(subContractAddress);
        setDetails(subContractDetails);
      } catch (err) {
        console.error("Failed to fetch sub-contract details:", err);
      }
    }
    
    if (subContractAddress) {
      fetchDetails();
    }
  }, [subContractAddress, getSubContractDetails]);

  const handleVerifyFile = async () => {
    if (!fileToVerify) {
      alert('Please select a file to verify');
      return;
    }
    
    try {
      const fileHash = await generateFileHash(fileToVerify);
      const result = await verifyFile(subContractAddress, fileHash, fileType);
      setVerificationResult(result.isValid);
    } catch (err) {
      console.error("File verification failed:", err);
      setVerificationResult(false);
    }
  };
  
  const handleStatusUpdate = async (newStatus: number) => {
    try {
      await updateStatus(subContractAddress, newStatus);
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };
  
  const handleSetUser = async () => {
    if (!newUserAddress) {
      alert('Please enter a user address');
      return;
    }
    
    try {
      await setUser(subContractAddress, newUserAddress);
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to set user:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Public Sub-Contract Details</h2>
      {details && (
        <div>
          <p>Owner: {details.owner}</p>
          <p>Parent Contract: {details.publicContractAddr}</p>
          <p>User: {details.user || 'Not assigned'}</p>
          <p>Status: {details.status === 0 ? 'Active' : 'Disabled'}</p>
          <p>Version: {details.version}</p>
          <p>JSON Hash: {details.jsonHash}</p>
          <p>Soft Copy Hash: {details.softCopyHash}</p>
          <p>Storage Link: {details.storageLink}</p>
          <p>Start Date: {new Date(details.startDate * 1000).toLocaleDateString()}</p>
          <p>End Date: {new Date(details.endDate * 1000).toLocaleDateString()}</p>
          <p>Deploy Time: {new Date(details.deployTime * 1000).toLocaleString()}</p>
        </div>
      )}
      
      <h3>Verify File</h3>
      <div>
        <select value={fileType} onChange={e => setFileType(e.target.value as 'json' | 'softCopy')}>
          <option value="json">JSON File</option>
          <option value="softCopy">Soft Copy File</option>
        </select>
        
        <input 
          type="file" 
          onChange={e => e.target.files && setFileToVerify(e.target.files[0])} 
        />
        
        <button onClick={handleVerifyFile}>Verify</button>
        
        {verificationResult !== null && (
          <p>
            Verification Result: 
            <strong style={{ color: verificationResult ? 'green' : 'red' }}>
              {verificationResult ? 'Valid' : 'Invalid'}
            </strong>
          </p>
        )}
      </div>
      
      {/* Owner/Parent controls */}
      {details && window.ethereum && (
        window.ethereum.selectedAddress?.toLowerCase() === details.owner.toLowerCase() ||
        window.ethereum.selectedAddress?.toLowerCase() === details.publicContractAddr.toLowerCase()
      ) && (
        <>
          <h3>Update Status</h3>
          <div>
            <button onClick={() => handleStatusUpdate(0)} disabled={details.status === 0}>
              Set Active
            </button>
            <button onClick={() => handleStatusUpdate(1)} disabled={details.status === 1}>
              Set Disabled
            </button>
          </div>
          
          <h3>Set User</h3>
          <div>
            <input
              value={newUserAddress}
              onChange={e => setNewUserAddress(e.target.value)}
              placeholder="User Address"
            />
            <button onClick={handleSetUser}>Set User</button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Private SubContract

The `usePrivateSubContract` hook is used to interact with private sub-contracts.

```tsx
import { usePrivateSubContract } from '../hooks/contractHook';
import { useFileVerification, useIrysUploader } from '../hooks/contractHook/helpers';

function PrivateSubContractViewer({ subContractAddress }: { subContractAddress: string }) {
  const { 
    getSubContractDetails, 
    updateStatus, 
    setUser,
    updateDataLinks,
    isLoading, 
    error 
  } = usePrivateSubContract();
  const { verifyFile, generateFileHash } = useFileVerification();
  const { uploadPrivateFile } = useIrysUploader();
  
  const [details, setDetails] = useState<any>(null);
  const [fileToVerify, setFileToVerify] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'json' | 'softCopy'>('json');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [newUserAddress, setNewUserAddress] = useState<string>('');
  
  // Files for uploading
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const subContractDetails = await getSubContractDetails(subContractAddress);
        setDetails(subContractDetails);
      } catch (err) {
        console.error("Failed to fetch sub-contract details:", err);
      }
    }
    
    if (subContractAddress) {
      fetchDetails();
    }
  }, [subContractAddress, getSubContractDetails]);

  const handleVerifyFile = async () => {
    if (!fileToVerify) {
      alert('Please select a file to verify');
      return;
    }
    
    try {
      const fileHash = await generateFileHash(fileToVerify);
      const result = await verifyFile(subContractAddress, fileHash, fileType);
      setVerificationResult(result.isValid);
    } catch (err) {
      console.error("File verification failed:", err);
      setVerificationResult(false);
    }
  };
  
  const handleStatusUpdate = async (newStatus: number) => {
    try {
      await updateStatus(subContractAddress, newStatus);
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };
  
  const handleSetUser = async () => {
    if (!newUserAddress) {
      alert('Please enter a user address');
      return;
    }
    
    try {
      await setUser(subContractAddress, newUserAddress);
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to set user:", err);
    }
  };
  
  const handleUploadFiles = async () => {
    if (!jsonFile || !softCopyFile) {
      alert('Please select both JSON and soft copy files');
      return;
    }
    
    try {
      // Generate encryption key (in a real app, this would come from a shared secret)
      const encryptionKey = "example-encryption-key";
      
      // Upload encrypted files
      const jsonUpload = await uploadPrivateFile(jsonFile, encryptionKey);
      const softCopyUpload = await uploadPrivateFile(softCopyFile, encryptionKey);
      
      // Update data links
      await updateDataLinks(subContractAddress, {
        jsonLink: jsonUpload.txId,
        softCopyLink: softCopyUpload.txId
      });
      
      // Refresh details
      const subContractDetails = await getSubContractDetails(subContractAddress);
      setDetails(subContractDetails);
    } catch (err) {
      console.error("Failed to upload files:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Private Sub-Contract Details</h2>
      {details && (
        <div>
          <p>Owner: {details.owner}</p>
          <p>Parent Contract: {details.privateContractAddr}</p>
          <p>User: {details.user || 'Not assigned'}</p>
          <p>Status: {details.status === 0 ? 'Active' : 'Disabled'}</p>
          <p>Version: {details.version}</p>
          <p>JSON Hash: {details.jsonHash}</p>
          <p>Soft Copy Hash: {details.softCopyHash}</p>
          <p>JSON Link: {details.jsonLink || 'Not uploaded yet'}</p>
          <p>Soft Copy Link: {details.softCopyLink || 'Not uploaded yet'}</p>
          <p>Start Date: {new Date(details.startDate * 1000).toLocaleDateString()}</p>
          <p>End Date: {new Date(details.endDate * 1000).toLocaleDateString()}</p>
          <p>Deploy Time: {new Date(details.deployTime * 1000).toLocaleString()}</p>
        </div>
      )}
      
      <h3>Verify File</h3>
      <div>
        <select value={fileType} onChange={e => setFileType(e.target.value as 'json' | 'softCopy')}>
          <option value="json">JSON File</option>
          <option value="softCopy">Soft Copy File</option>
        </select>
        
        <input 
          type="file" 
          onChange={e => e.target.files && setFileToVerify(e.target.files[0])} 
        />
        
        <button onClick={handleVerifyFile}>Verify</button>
        
        {verificationResult !== null && (
          <p>
            Verification Result: 
            <strong style={{ color: verificationResult ? 'green' : 'red' }}>
              {verificationResult ? 'Valid' : 'Invalid'}
            </strong>
          </p>
        )}
      </div>
      
      {/* Owner/Parent controls */}
      {details && window.ethereum && (
        window.ethereum.selectedAddress?.toLowerCase() === details.owner.toLowerCase() ||
        window.ethereum.selectedAddress?.toLowerCase() === details.privateContractAddr.toLowerCase()
      ) && (
        <>
          <h3>Update Status</h3>
          <div>
            <button onClick={() => handleStatusUpdate(0)} disabled={details.status === 0}>
              Set Active
            </button>
            <button onClick={() => handleStatusUpdate(1)} disabled={details.status === 1}>
              Set Disabled
            </button>
          </div>
          
          <h3>Set User</h3>
          <div>
            <input
              value={newUserAddress}
              onChange={e => setNewUserAddress(e.target.value)}
              placeholder="User Address"
            />
            <button onClick={handleSetUser}>Set User</button>
          </div>
        </>
      )}
      
      {/* User controls - only show for the assigned user */}
      {details && details.user && window.ethereum && 
       window.ethereum.selectedAddress?.toLowerCase() === details.user.toLowerCase() && (
        <>
          <h3>Upload Encrypted Files</h3>
          <div>
            <div>
              <label>JSON File:</label>
              <input 
                type="file" 
                accept="application/json"
                onChange={e => e.target.files && setJsonFile(e.target.files[0])} 
              />
            </div>
            
            <div>
              <label>Soft Copy File:</label>
              <input 
                type="file" 
                onChange={e => e.target.files && setSoftCopyFile(e.target.files[0])} 
              />
            </div>
            
            <button onClick={handleUploadFiles}>Upload Files</button>
          </div>
        </>
      )}
    </div>
  );
}
```

## Helper Hooks

### File Verification

The `useFileVerification` hook provides utility functions for verifying files against contract hashes.

```tsx
import { useFileVerification } from '../hooks/contractHook/helpers';

function FileVerifier() {
  const { generateFileHash, verifyFile, isLoading, error } = useFileVerification();
  
  const [file, setFile] = useState<File | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [fileType, setFileType] = useState<'json' | 'softCopy'>('json');
  const [fileHash, setFileHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleGenerateHash = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    try {
      const hash = await generateFileHash(file);
      setFileHash(hash);
    } catch (err) {
      console.error("Failed to generate hash:", err);
    }
  };
  
  const handleVerifyWithContract = async () => {
    if (!file || !contractAddress) {
      alert('Please select a file and enter a contract address');
      return;
    }
    
    try {
      const hash = await generateFileHash(file);
      const result = await verifyFile(contractAddress, hash, fileType);
      setVerificationResult(result);
    } catch (err) {
      console.error("Verification failed:", err);
      setVerificationResult({ isValid: false, contractType: 'unknown' });
    }
  };

  return (
    <div>
      <h2>File Verification</h2>
      
      <div>
        <input 
          type="file" 
          onChange={e => e.target.files && setFile(e.target.files[0])} 
        />
        
        <button onClick={handleGenerateHash} disabled={isLoading || !file}>
          Generate Hash
        </button>
        
        {fileHash && (
          <div>
            <h4>File Hash:</h4>
            <code>{fileHash}</code>
          </div>
        )}
      </div>
      
      <div>
        <h3>Verify with Contract</h3>
        <input 
          value={contractAddress}
          onChange={e => setContractAddress(e.target.value)}
          placeholder="SubContract Address"
        />
        
        <select value={fileType} onChange={e => setFileType(e.target.value as 'json' | 'softCopy')}>
          <option value="json">JSON File</option>
          <option value="softCopy">Soft Copy File</option>
        </select>
        
        <button onClick={handleVerifyWithContract} disabled={isLoading || !file || !contractAddress}>
          Verify
        </button>
        
        {verificationResult && (
          <div>
            <h4>Verification Result:</h4>
            <p>
              Valid: <strong>{verificationResult.isValid ? 'Yes' : 'No'}</strong>
            </p>
            <p>
              Contract Type: <strong>{verificationResult.contractType}</strong>
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

### Irys Uploader

The `useIrysUploader` hook provides functionality to upload files to Arweave via Irys.

```tsx
import { useIrysUploader } from '../hooks/contractHook/helpers';

function IrysFileUploader() {
  const { 
    connectToIrys, 
    checkIrysBalance, 
    fundIrysNode, 
    uploadFile,
    uploadPrivateFile,
    isLoading, 
    error 
  } = useIrysUploader();
  
  const [file, setFile] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [irysBalance, setIrysBalance] = useState<string>('0');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [irysInstance, setIrysInstance] = useState<any>(null);

  const handleConnect = async () => {
    try {
      // Connect to Ethereum provider
      const provider = window.ethereum;
      if (!provider) {
        alert('Please install MetaMask or another Ethereum provider');
        return;
      }
      
      // Request account access
      await provider.request({ method: 'eth_requestAccounts' });
      
      // Connect to Irys
      const irys = await connectToIrys(provider);
      setIrysInstance(irys);
      
      // Check balance
      const balance = await checkIrysBalance(irys);
      setIrysBalance(balance);
    } catch (err) {
      console.error("Failed to connect to Irys:", err);
    }
  };
  
  const handleFundIrys = async () => {
    if (!irysInstance) {
      alert('Please connect to Irys first');
      return;
    }
    
    try {
      // Fund with a small amount (0.01 ETH)
      await fundIrysNode(irysInstance, BigInt(10000000000000000n));
      
      // Update balance
      const balance = await checkIrysBalance(irysInstance);
      setIrysBalance(balance);
    } catch (err) {
      console.error("Failed to fund Irys node:", err);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    
    try {
      let result;
      
      if (isPrivate) {
        if (!encryptionKey) {
          alert('Please enter an encryption key for private upload');
          return;
        }
        result = await uploadPrivateFile(file, encryptionKey);
      } else {
        result = await uploadFile(file);
      }
      
      setUploadResult(result);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  return (
    <div>
      <h2>Irys File Uploader</h2>
      
      <div>
        <h3>Step 1: Connect to Irys</h3>
        <button onClick={handleConnect}>
          Connect to Irys
        </button>
        
        {irysInstance && (
          <p>Connected! Current balance: {irysBalance} Wei</p>
        )}
      </div>
      
      {irysInstance && (
        <div>
          <h3>Step 2: Fund Irys (if needed)</h3>
          <button onClick={handleFundIrys}>
            Fund 0.01 ETH
          </button>
        </div>
      )}
      
      <div>
        <h3>Step 3: Upload File</h3>
        <input 
          type="file" 
          onChange={e => e.target.files && setFile(e.target.files[0])} 
        />
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
            />
            Private Upload (encrypt file)
          </label>
        </div>
        
        {isPrivate && (
          <div>
            <input
              type="password"
              value={encryptionKey}
              onChange={e => setEncryptionKey(e.target.value)}
              placeholder="Encryption Key"
            />
          </div>
        )}
        
        <button onClick={handleUpload} disabled={isLoading || !file}>
          Upload File
        </button>
      </div>
      
      {uploadResult && (
        <div>
          <h4>Upload Result:</h4>
          <p>Transaction ID: {uploadResult.txId}</p>
          <p>File Hash: {uploadResult.fileHash}</p>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## Complete Flow Examples

### Broadcast Contract Flow

1. Create a broadcast contract using the broadcast factory
2. Add a new version of the contract with document files
3. Verify files against the contract

### Public Contract Flow

1. Create a public contract using the public factory
2. Add a new version of the contract with document files
3. User activates the contract using activation code
4. Verify files against the contract

### Private Contract Flow

1. Create a private contract using the private factory
2. Add a new version of the contract with document hashes
3. User activates the contract using activation code
4. User uploads encrypted files
5. Verify files against the contract
