import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from "./Sidebar";
import Record from './Record';
import { calculateHash} from '../services/certificateService';

function Verify() {
    const location = useLocation();
    const address = location.state || {};
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState(null);

    const [formData, setFormData] = useState({
        contractAddress: "",
        jsonFile: null,
        documentFile: null,
    });

    useEffect(() => {
        if (address.address) {
            setType(address.address.contractAddress.trim());
        }
    }, [address]);



    const handleJsonChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const hash = await calculateHash(arrayBuffer);
            setFormData(prev => ({
                ...prev,
                jsonFile: file,
                jsonHash: hash
            }));
        }
    };

    const handleDocumentChange = async (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            const documentHash = await calculateHash(formData.documentHash);
            console.log('Calculated Document hash:', documentHash);

            const jsonHash = await calculateHash(formData.jsonFile);
            console.log('Calculated JSON hash:', jsonHash);

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
        } finally {
            setLoading(false);
        }
        
        setFormData(
        {
            contractAddress: "",
            jsonFile: null,
            documentFile: null,
        });
    }



    //address type is private
    return (
        <div style={{ width: "100vw", paddingLeft: "60px", paddingTop: "60px" }}>
            <Sidebar />
            <div className="row" style={{ display: 'flex', justifyContent: "center" }}>
                <div className="col-lg-12" style={{ width: '80vw', height: '80vh', marginTrim: 'all', justifyContent: "center" }}>
                    <h1 style={{ textAlign: "center", padding: "10px" }}>Verify Contract</h1>
                    {((type == 'broadcast') || type == 'public') && (
                        <Record />
                    )}

                    {type == "private" && (
                        <div>
                            <h4>This contract is private!</h4>
                            <p>Please provide us with the JSON file and the contract file of the contract.</p>
                        </div>
                    )}
                    {!(type == 'broadcast' || type == 'public') && (
                        <div className="card" style={{ justifyContent: "center", padding: "30px" }}>
                            <div className="form">
                                <div className="form-group">
                                    <h4>Please input your contract address here</h4>
                                    <input
                                        type="text"
                                        value={formData.certificateName}
                                        onChange={e => setFormData(prev => ({
                                            ...prev,
                                            contractAddress: e.target.value
                                        }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <h4>Please upload your JSON file here(Private Contract Only)</h4>

                                    <input
                                        type="file"
                                        onChange={handleJsonChange}
                                        required
                                    />
                                </div>

                                <div style={{ alignItems: 'center', paddingTop: '30px' }}>
                                    <div className="form-group">
                                        <h4>And Upload your Document here (Private Contract Only)</h4>
                                        <input
                                            type="file"
                                            onChange={handleDocumentChange}
                                            required
                                        />
                                    </div>
                                    <br />
                                    <button className='btn btn-lg bg-gradient-dark'
                                        style={{ fontSize: "20px" }}
                                        onClick={handleSubmit}
                                    >Verify Now !</button>
                                </div>
                            </div>
                        </div>

                    )}
                </div>

            </div>


            {/*Here for the input*/}
            { /*<Record cert={data} />*/}

        </div>

    );



};

export default Verify;
