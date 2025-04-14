import React, { useState, useContext } from 'react';
import Sidebar from "./Sidebar";
import { data } from 'react-router-dom';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { generateActivationCode, calculateHash, deployCertificate, addCertificateToUser } from '../services/certificateService';
import CreateCert from '../pages/Create';
function Update(type) {
    const certType = type.type;
    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();
    const [formData, setFormData] = useState({
        certificateTitle: '',
        startDate: '',
        endDate: '',
        jsonFile: null,
        documentFile: null
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleDateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      };
    

    /**
     * @notice Handles file input changes and calculates document hash
     * @param {Event} e - The file input change event
     */
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const hash = await calculateHash(arrayBuffer);
            setFormData(prev => ({
                ...prev,
                documentFile: file,
                documentHash: hash
            }));
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

            const jsonHash = await calculateHash(formData.jsonFile);
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

            // Add certificate to user contract with refetch callback
            await addCertificateToUser(
                provider,
                data.userContractAddress,
                certificateAddress,
                refetchUserProfile // Pass the refetch callback
            );
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

    const toDM = () => {
        window.location.href = "/DocumentManagement";
    };

    return (
        <div style={{ width: "100%", }}>
            <div
                className="container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',  // Center content horizontally
                    justifyContent: 'left', // Center content vertically
                    height: 'fit-content', // Full viewport height
                    textAlign: 'left', // Ensure text is centered
                }}
            >
                <div style={{ padding: '30px', marginTop: '5px', borderRadius: '20px' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ fontSize: '20px' }}>{certType} Certificate Title</label>
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
                            <label htmlFor="date" style={{ fontSize: '20px' }}>{certType} Select Start Date:</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={formData.date}
                                onChange={handleDateChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" style={{ fontSize: '20px' }}>{certType} Select End Date:</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                value={formData.date}
                                onChange={handleDateChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '20px' }}>{certType} Certificate JSON File</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '20px' }}>{certType} Certificate File</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
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
            </div>
        </div>
    );
}

export default Update;
