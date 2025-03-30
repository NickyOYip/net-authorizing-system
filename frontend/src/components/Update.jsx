import React, { useState, useContext } from 'react';
import Sidebar from "../Sidebar_shison";
import { data } from 'react-router-dom';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { generateActivationCode, calculateHash, deployCertificate, addCertificateToUser } from '../services/certificateService';

function Update() {

    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();
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
        <div>
            {/* Sidebar */}
            <Sidebar />
            <div
                className="container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',  // Center content horizontally
                    justifyContent: 'left', // Center content vertically
                    height: '100vh', // Full viewport height
                    textAlign: 'left', // Ensure text is centered
                }}
            >
                <div className='card' style={{ padding: '30px', marginTop: '50px', borderRadius: '20px' }}>
                    <h1>Upload/Update Document</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ fontSize: '20px' }}>Certificate Name</label>
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
                            <label style={{ fontSize: '20px' }}>Organization Name</label>
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


                        {/* <label style={{ fontSize: '20px', paddingRight: '30px' }}>
                            This is an
                            <select style={{ fontSize: '15px', marginLeft: '20px' }} name="action" value={formData.action} onChange={handleInputChange}>
                                <option>Update</option>
                                <option>Upload</option>
                            </select>
                        </label><br />*/}

                        <div className="form-group">
                            <label style={{ fontSize: '20px' }}>Certificate Data</label>
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
                            <label style={{ fontSize: '20px' }}>Document File</label>
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
                    {/*JSON of this page's input*/}

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