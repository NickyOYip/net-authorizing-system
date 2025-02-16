import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { activateCertificate } from '../services/certificateService';
import '../styles/ActivateCertificate.css';

function ActivateCertificate() {
    const { data } = useContext(DataContext);
    const [formData, setFormData] = useState({
        certificateAddress: '',
        activationCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await activateCertificate(
                provider,
                formData.certificateAddress,
                formData.activationCode,
                data.account // Current user's address
            );
            setResult({
                success: true,
                message: 'Certificate activated successfully!'
            });
        } catch (error) {
            console.error('Activation error:', error);
            setResult({
                success: false,
                error: error.message
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
