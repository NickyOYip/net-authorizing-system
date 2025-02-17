import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { MetaMaskContext } from '../MetaMaskProvider';
import { DataContext } from '../store/dataStore';
import { activateCertificate } from '../services/certificateService';
import '../styles/ActivateCertificate.css';

function ActivateCertificate() {
    const { account } = useContext(MetaMaskContext);
    const { data } = useContext(DataContext);
    const [formData, setFormData] = useState({
        certificateAddress: '',
        activationCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Starting activation process...');
        setLoading(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            console.log('Activation parameters:', {
                certificateAddress: formData.certificateAddress,
                userContractAddress: data.userContractAddress,
                activationCode: formData.activationCode,
                userAddress: account
            });

            await activateCertificate(
                formData.certificateAddress,
                data.userContractAddress,
                formData.activationCode,
                account,
                signer
            );

            setResult({
                success: true,
                message: 'Certificate activated and added to your list successfully!'
            });
        } catch (err) {
            console.error('Activation error:', err);
            setResult({
                success: false,
                error: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="activate-certificate">
            <h3>Activate Certificate</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Certificate Address</label>
                    <input
                        type="text"
                        value={formData.certificateAddress}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            certificateAddress: e.target.value
                        }))}
                        placeholder="0x..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Activation Code</label>
                    <input
                        type="text"
                        value={formData.activationCode}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            activationCode: e.target.value
                        }))}
                        placeholder="Enter activation code"
                        required
                    />
                </div>

                <button type="submit" disabled={loading || !data.account}>
                    {loading ? 'Activating...' : 'Activate Certificate'}
                </button>
            </form>

            {result && (
                <div className={`result ${result.success ? 'success' : 'error'}`}>
                    {result.success ? (
                        <p>{result.message}</p>
                    ) : (
                        <p>Error: {result.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ActivateCertificate;
