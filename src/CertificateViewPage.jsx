import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';

// ABI for BroadcastContract
const BROADCAST_CONTRACT_ABI = [
  "function currentVersion() view returns (uint256)",
  "function subContracts(uint256) view returns (address)"
];

// ABI for BroadcastSubContract
const BROADCAST_SUB_CONTRACT_ABI = [
  "function title() view returns (string)",
  "function jsonHash() view returns (bytes32)",
  "function softCopyHash() view returns (bytes32)",
  "function storageLink() view returns (string)",
  "function startDate() view returns (uint256)",
  "function endDate() view returns (uint256)"
];

const CertificateViewPage = () => {
  const { contractAddress } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!ethers.utils.isAddress(contractAddress)) {
        setError('Invalid contract address');
        return;
      }

      setError('');
      setLoading(true);

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const mainContract = new ethers.Contract(contractAddress, BROADCAST_CONTRACT_ABI, signer);
        const currentVersion = await mainContract.currentVersion();
        const subContractAddr = await mainContract.subContracts(currentVersion);

        const subContract = new ethers.Contract(subContractAddr, BROADCAST_SUB_CONTRACT_ABI, signer);
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
        console.error(err);
        setError('Error fetching certificate data');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [contractAddress]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Certificate Viewer</h1>
      <p className="mb-2 text-gray-700"><strong>Contract:</strong> {contractAddress}</p>

      {loading && <p className="text-blue-500">Loading certificate data...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {data && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <p><strong>Title:</strong> {data.title}</p>
          <p><strong>JSON Hash:</strong> {data.jsonHash}</p>
          <p><strong>Soft Copy Hash:</strong> {data.softCopyHash}</p>
          <p>
            <strong>Storage Link:</strong>{" "}
            <a
              href={`https://arweave.net/${data.storageLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {data.storageLink}
            </a>
          </p>
          <p><strong>Start Date:</strong> {data.startDate}</p>
          <p><strong>End Date:</strong> {data.endDate}</p>
        </div>
      )}
    </div>
  );
};

export default CertificateViewPage;
