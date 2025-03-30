import React, { useState } from 'react';
import Sidebar from "../Sidebar_shison";
const Certify = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const toUpload = () => {
        window.location.href = "/upload";
    };

    const toVerify = () => {
        window.location.href = "/vertify";
    };

    const toView = () => {
        window.location.href = "/view";
    };

    const toSettings = () => {
        window.location.href = "/settings";
    };
    
    const toDM = () => {
        window.location.href = "/DocumentManagement";
    };

    const toDashboard = () => {
        window.location.href = "/";
    };

     

    return (
        <div>
            <Sidebar/>
            <div
            className="container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',  // Center content horizontally
                justifyContent: 'center', // Center content vertically
                height: '100vh', // Full viewport height
                textAlign: 'center', // Ensure text is centered
            }}
            >   
                <h1>Certify Document</h1>
                <p>Are you sure you want to certify this document?</p>
                
                <a href="/" className="button certify-button">Certify</a><br/>
                <a href="/" className="button back-button">Cancel</a>
            </div>
        </div>
    );
};

export default Certify;