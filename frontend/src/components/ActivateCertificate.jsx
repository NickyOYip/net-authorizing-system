import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { activateCertificate } from '../services/certificateService';
import { useUserProfile } from '../hooks/useUserProfile';
import '../styles/ActivateCertificate.css';

function ActivateCertificate() {
    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();
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
            const signer = await provider.getSigner();

            await activateCertificate(
                formData.certificateAddress,
                data.userContractAddress,
                formData.activationCode,
                data.account,
                signer,
                refetchUserProfile // Pass the refetch callback
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
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Activating...' : 'Activate Certificate'}
                </button>
            </form>

            {result && (
                <div className={`result ${result.success ? 'success' : 'error'}`}>
                    {result.success ? result.message : `Error: ${result.error}`}
                </div>
            )}
        </div>
    );
}

export default ActivateCertificate;
