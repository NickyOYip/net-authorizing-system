import React, { useState } from 'react';
import { ethers } from 'ethers';

// ABI needed, please help to fill in the acutal ABI
const CONTRACT_ABI = [
  'function currentVersion() view returns (uint256)',
  'function subContracts(uint256) view returns (address)',
  'function title() view returns (string)',
  'function jsonHash() view returns (bytes32)',
  'function softCopyHash() view returns (bytes32)',
  'function storageLink() view returns (string)',
  'function startDate() view returns (uint256)',
  'function endDate() view returns (uint256)'
];

const CertificateViewPage = () => {
  const [address, setAddress] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!ethers.utils.isAddress(address)) {
      setError('Invalid address');
      return;
    }
    setError('');
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const mainContract = new ethers.Contract(address, CONTRACT_ABI, signer);
      const currentVersion = await mainContract.currentVersion();
      const subContractAddr = await mainContract.subContracts(currentVersion);

      const subContract = new ethers.Contract(subContractAddr, CONTRACT_ABI, signer);
      const title = await subContract.title();
      const jsonHash = await subContract.jsonHash();
      const softCopyHash = await subContract.softCopyHash();
      const storageLink = await subContract.storageLink();
      const startDate = await subContract.startDate();
      const endDate = await subContract.endDate();

      setData({
        title,
        jsonHash,
        softCopyHash,
        storageLink,
        startDate: new Date(startDate.toNumber() * 1000).toLocaleString(),
        endDate: new Date(endDate.toNumber() * 1000).toLocaleString()
      });
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Certificate Viewer</h1>
      <input
        className="border px-2 py-1 w-full mb-2"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter contract address"
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleFetch}>
        Fetch Certificate
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {data && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>JSON Hash:</strong> {data.jsonHash}</p>
          <p><strong>Soft Copy Hash:</strong> {data.softCopyHash}</p>
          <p><strong>Storage Link:</strong> <a href={`https://arweave.net/${data.storageLink}`} target="_blank" rel="noopener noreferrer">{data.storageLink}</a></p>
          <p><strong>Start Date:</strong> {data.startDate}</p>
          <p><strong>End Date:</strong> {data.endDate}</p>
        </div>
      )}
    </div>
  );
};

export default CertificateViewPage;
