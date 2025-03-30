import React, { useState } from 'react';
import Sidebar from "../Sidebar_shison";
const Activate = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    var data = {
        owner: 'Wong Tai Man',
        userAddress: 'hislnmdns342hoehip',
        version: 'v1.1',
        disableTime: '09:00:23 5-3-2025',
        certificateName: 'Graduation Certificate',
        state: 'Active',
        deployTime: '09:00:23 5-3-2024'
    };

    const Show = ({ cert }) => {
        return (
            <div className='card' style={{ width: '50%', height: '50%', padding: '30px', marginTop: '50px', borderRadius: '20px', justifyContent: 'left' }}>
                <h2 style={{ alignSelf: 'center' }}>Activate Certificate</h2>
                <p><strong>Document Name:</strong> {cert.certificateName}</p>
                <p><strong>Version:</strong>{cert.version}</p>
                <p><strong>Disable time:</strong> {cert.disableTime}</p>
                <p><strong>Status:</strong> {cert.state}</p>
                <p><strong>Upload Date:</strong> {cert.deployTime}</p>

                <div className="document-content">
                    <p>This is the content of the document...</p>
                </div>

            </div>
        );
    }

    return (
        <div>

            <Sidebar />
            <div
                className="container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',  // Center content horizontally
                    justifyContent: 'top', // put content on top section
                    height: '100vh', // Full viewport height
                    textAlign: 'left' // Ensure text is centered
                }}
            >
                <Show cert={data} />
                <h5>Are you sure you want to activate this document?</h5>
                <row style={{ display:'flex', justifyContent:'space-between',width:'300px'}}>
                    <a href="/" className="button certify-button" style={{ backgroundColor: '#FFD700', borderRadius: '10px', padding: '5px' }} >Activate</a><br />
                    <a href="/" className="button back-button" style={{ backgroundColor: 'black', borderRadius: '10px', color: 'white', padding: '5px' }}>Cancel</a>
                </row>
            </div>
        </div >
    );
};

export default Activate;