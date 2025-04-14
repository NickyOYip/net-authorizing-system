import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoSearchOutline } from "react-icons/io5";
import Sidebar from "./Sidebar";
import PdfViewer from './PdfViewer';
import { pdfjs } from 'react-pdf'

function Verify() {
    const location = useLocation();
    const address = location.state || {};
    const [loading,setLoading]= useState(false);

    const [formData,setFormData] = useState({
        jsonFile: null,
        documentFile: null,
    });

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.js",
        import.meta.url
    ).toString();

    //show record for broadcast/public contracts
    const Record = () => {

        return (
            //address type === broadcast/public
            <div className="col-lg-12">
                <div className="card" style={{ width: '450px', height: '560px', padding: '30px' }}>
                    <div className='row' style={{ diaplay: 'flex' }}>
                        <label>Document Title:</label>
                        <p>cert.title</p>
                        <br />
                        <label>Version:</label>
                        <p>cert.version</p>
                        <br />
                        <label>Type:</label>
                        <p>Broadcast</p>{/** should be the type of contract */}
                        <br />
                        <label>Status:</label>
                        <p>cert.status</p>{/**Active or Inactive */}
                        <br />
                        <label>Content:</label>
                    </div>
                    <div className='card'>
                        {/**pdf file*/}
                        <p>

                        </p>
                    </div>
                </div>
            </div>

        );
    }

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

        try{
            const documentHash = await calculateHash(formData.documentHash);
            console.log('Calculated Document hash:', documentHash);

            const jsonHash = await calculateHash(formData.jsonFile);
            console.log('Calculated JSON hash:', jsonHash);

            setResult({
                success: true,
                address: certificateAddress,
                activeCode
            });

        }catch (error) {
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
    }



    //address type is private
    return (
        <div style={{ width: "100vw", paddingLeft: "60px", paddingTop: "60px" }}>
            <Sidebar />
            <div className="row" style={{ display: 'flex' }}>
                <div className="col-lg-6" style={{ width: '50%', height: '300px', marginTrim: 'all' }}>
                    <div className="card" style={{ width: '95%', height: '560px', padding: '30px' }}>
                        {address == 'private' && (
                            <div>
                                <h2>This contract is private!</h2>
                                <p>Please provide us with the JSON file and the contract file of the contract.</p>
                            <div claddName="form">
                                 <div className="form-group">
                                 <label>Please input your contract address here</label>

                                 </div>
                                <div className="form-group">
                                    <label>Please upload your JSON file here</label>
                                    <br />
                                    <input
                                        type="file"
                                        onChange={handleJsonChange}
                                        required
                                    />
                                </div>

                                <div style={{ alignItems: 'center', paddingTop: '30px' }}>
                                    <div>
                                        <p>And Upload your Document here</p>
                                        <input
                                            type="file"
                                            onChange={handleDocumentChange}
                                            required
                                        />
                                    </div>
                                    <br />
                                    <button style={{
                                        background: "white",
                                        borderRadius: "5px",
                                        borderColor: "#0000",
                                        boxShadow: "2px 2px 5px grey"
                                    }}>Verify</button>
                                </div>
                            </div>
                            </div>
                        )}
                        {!(address == 'private') &&(
                            <Record/>
                        )}
                    </div>
                </div>
                <div className='card col-lg-6'>
                    <PdfViewer></PdfViewer>
                </div>
                {/*Here for the input*/}
                { /*<Record cert={data} />*/}

            </div>

        </div>
    );



};

export default Verify;
