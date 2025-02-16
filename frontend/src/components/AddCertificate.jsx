import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { generateActivationCode, calculateHash, deployCertificate, addCertificateToUser } from '../services/certificateService';

/**
 * @title AddCertificate Component
 * @notice Provides form interface for creating new certificates
 */
function AddCertificate() {
    const { data } = useContext(DataContext);
    const [formData, setFormData] = useState({
        certificateName: '',
        orgName: '',
        data: '',
        documentFile: null,
        disableTime: 30, // Default 30 days
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    /**
     * @notice Handles file input changes and calculates document hash
     * @param {Event} e - The file input change event
     */
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const hash = await calculateHash(content);
                setFormData(prev => ({
                    ...prev,
                    documentFile: file,
                    documentHash: hash
                }));
            };
            reader.readAsText(file);
        }
    };

    /**
     * @notice Handles form submission and certificate deployment
     * @param {Event} e - The form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Starting certificate creation...');
            
            const activeCode = generateActivationCode();
            console.log('Generated activation code:', activeCode);
            
            const jsonHash = await calculateHash(formData.data);
            console.log('Calculated JSON hash:', jsonHash);
            
            const certificateData = {
                ...formData,
                activeCode,
                jsonHash,
                owner: data.account
            };
            console.log('Prepared certificate data:', certificateData);

            const provider = new ethers.BrowserProvider(window.ethereum);
            
            // Deploy certificate
            const certificateAddress = await deployCertificate(provider, certificateData);
            console.log('Certificate deployed at:', certificateAddress);

            // Add certificate to user contract
            await addCertificateToUser(provider, data.userContractAddress, certificateAddress);
            console.log('Certificate added to user contract');

            setResult({
                success: true,
                address: certificateAddress,
                activeCode
            });
        } catch (error) {
            console.error('Detailed error in handleSubmit:', {
                error,
                errorMessage: error.message,
                errorStack: error.stack,
                formData: formData
            });
            setResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-certificate">
            <h3>Create New Certificate</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Certificate Name</label>
                    <input
                        type="text"
                        value={formData.certificateName}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            certificateName: e.target.value
                        }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Organization Name</label>
                    <input
                        type="text"
                        value={formData.orgName}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            orgName: e.target.value
                        }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Certificate Data</label>
                    <textarea
                        value={formData.data}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            data: e.target.value
                        }))}
                        placeholder="Enter certificate data here..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Document File</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Disable Time (days)</label>
                    <input
                        type="number"
                        value={formData.disableTime}
                        onChange={e => setFormData(prev => ({
                            ...prev,
                            disableTime: e.target.value
                        }))}
                        min="1"
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Certificate'}
                </button>
            </form>

            {result && (
                <div className={`result ${result.success ? 'success' : 'error'}`}>
                    {result.success ? (
                        <>
                            <p>Certificate created successfully!</p>
                            <p>Address: {result.address}</p>
                            <p>Activation Code: {result.activeCode}</p>
                        </>
                    ) : (
                        <p>Error: {result.error}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default AddCertificate;
