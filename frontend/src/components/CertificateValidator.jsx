import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { validateCertificate } from '../services/certificateValidationService';
import '../styles/CertificateValidator.css';

const CertificateValidator = () => {
    const { data } = useContext(DataContext);
    const [certificateAddress, setCertificateAddress] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [certificateData, setCertificateData] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setDocumentFile(event.target.files[0]);
    };

    const handleDataChange = (event) => {
        setCertificateData(event.target.value);
    };

    const handleValidation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setValidationResult(null);

        try {
            // Basic validation
            if (!certificateAddress || !documentFile || !certificateData) {
                throw new Error('Please provide all required information');
            }

            // Validate Ethereum address format
            if (!ethers.isAddress(certificateAddress)) {
                throw new Error('Invalid certificate address');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const result = await validateCertificate(
                provider,
                certificateAddress,
                certificateData, // Pass the raw input string
                documentFile
            );

            setValidationResult(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="validator-container">
            <h2>Certificate Validator</h2>
            
            <form onSubmit={handleValidation} className="validator-form">
                <div className="validator-input-group">
                    <label>Certificate Address</label>
                    <input
                        type="text"
                        value={certificateAddress}
                        onChange={(e) => setCertificateAddress(e.target.value)}
                        placeholder="0x..."
                    />
                </div>

                <div className="validator-input-group">
                    <label>Document File</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="validator-input-group">
                    <label>Certificate Data</label>
                    <textarea
                        value={certificateData}
                        onChange={handleDataChange}
                        rows="4"
                        placeholder="Enter certificate data..."
                    />
                </div>

                {error && (
                    <div className="validator-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="validator-button"
                >
                    {loading ? 'Validating...' : 'Validate Certificate'}
                </button>
            </form>

            {validationResult && (
                <div className="validation-results">
                    <h3>Validation Results</h3>
                    
                    <div className="validation-status">
                        <span className={`status-indicator ${validationResult.isValid ? 'status-valid' : 'status-invalid'}`}></span>
                        <span>Overall Validation: {validationResult.isValid ? 'Valid' : 'Invalid'}</span>
                    </div>
                    
                    <div className="details-grid">
                        <div className="details-label">Document Hash:</div>
                        <div className={validationResult.verification.documentHashMatch ? 'text-valid' : 'text-invalid'}>
                            {validationResult.verification.documentHashMatch ? 'Valid' : 'Invalid'}
                        </div>
                        
                        <div className="details-label">JSON Hash:</div>
                        <div className={validationResult.verification.jsonHashMatch ? 'text-valid' : 'text-invalid'}>
                            {validationResult.verification.jsonHashMatch ? 'Valid' : 'Invalid'}
                        </div>
                        
                        <div className="details-label">Name:</div>
                        <div>{validationResult.details.certificateName}</div>
                        
                        <div className="details-label">Organization:</div>
                        <div>{validationResult.details.orgName}</div>
                        
                        <div className="details-label">State:</div>
                        <div>{validationResult.details.state}</div>
                        
                        <div className="details-label">Deploy Time:</div>
                        <div>{validationResult.details.deployTime}</div>
                        
                        <div className="details-label">Disable Time:</div>
                        <div>{validationResult.details.disableTime}</div>
                        
                        <div className="details-label">Owner:</div>
                        <div className="truncate">{validationResult.details.owner}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateValidator;
