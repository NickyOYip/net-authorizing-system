import Sidebar from "../Sidebar_shison";
import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { ethers } from 'ethers'; 


const DocumentManagement = () => {

    const [certificates, setCertificates] = useState([
        { id: 1, name: "Sample Certificate 1", version: "v1.0", status: "✅ Certified", uploadDate: "2024-01-01" },
        { id: 2, name: "Sample Certificate 2", version: "v2.1", status: "⏳ Pending", uploadDate: "2024-02-01" },
    ]);

    const [newCertificate, setNewCertificate] = useState({ name: "", version: "", status: "⏳ Pending" });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCertificate({ ...newCertificate, [name]: value });
    };

    const toView = () => {
        window.location.href = "/view";
      };
      const toUpload= () => {
        window.location.href = "/upload";
      };

    return (
        <div>
            <Sidebar />

            <div className="container" style={{ textAlign: 'center', padding: '20px' }}>
                <h1>Document Management</h1>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Certificate Name</th>
                            <th>Version</th>
                            <th>Status</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates.map(cert => (
                            <tr key={cert.id}>
                                <td>{cert.name}</td>
                                <td>{cert.version}</td>
                                <td>{cert.status}</td>
                                <td>{cert.uploadDate}</td>
                                <td>
                                    <button className="button blue-button" onClick={toView}>View</button>
                                    <button className="button gray-button" onClick={toUpload}>Update</button>
                                    {/*<button className="button red-button" onClick={() => disableCertificate(cert.id)}>Delete</button>*/}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="upload-section" style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                    <h3>Add New Certificate</h3>
                    <row style={{justifyContent:"space-between", padding:"10px"}}>
                        <input type="text" name="name" placeholder="Certificate Name" value={newCertificate.name} onChange={handleInputChange} style={{margin:"10px"}}/>
                        <input type="text" name="version" placeholder="Version" value={newCertificate.version} onChange={handleInputChange} style={{margin:"10px"}}/>
                    </row>
                    {/*<button className="button green-button" onClick={addCertificate}>Add Certificate</button>*/}
                </div>
            </div>
        </div>
    );
};

export default DocumentManagement;
