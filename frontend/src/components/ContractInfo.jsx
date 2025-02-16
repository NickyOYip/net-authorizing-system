import { useContext } from 'react';
import { DataContext } from '../store/dataStore';

export default function ContractInfo() {
    const { data } = useContext(DataContext);

    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Address copied to clipboard!');
    };

    return (
        <div className="contract-info">
            <h3>Contract Information</h3>
            <div className="address-container">
                <span>User Contract: </span>
                {data.userContractAddress ? (
                    <div className="address-display">
                        <span className="address">{shortenAddress(data.userContractAddress)}</span>
                        <button 
                            className="copy-button"
                            onClick={() => copyToClipboard(data.userContractAddress)}
                        >
                            Copy
                        </button>
                    </div>
                ) : (
                    <span className="no-contract">No contract deployed</span>
                )}
            </div>
        </div>
    );
}
