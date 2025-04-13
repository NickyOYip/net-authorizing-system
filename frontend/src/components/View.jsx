import React, { useState } from 'react';
import Sidebar from './Sidebar';
export const View = (address) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    return (
        <div
            className="container"
            style={{
                paddingLeft: '60px',
                justifyContent: 'center', // Center content vertically
                height: '100vh', // Full viewport height
                width: '120vw',
                textAlign: 'center', // Ensure text is centered
                background:'whitesmoke',

            }}
        >
            <Sidebar />
            <div className='card'>
                <h1>View Document</h1>
                <p><strong>Document Name:</strong> Sample Document 1</p>
                <p><strong>Version:</strong> v1.0</p>
                <p><strong>Status:</strong> ✅ Certified</p>
                <p><strong>Upload Date:</strong> 2024-01-01</p>

                <div className="document-content">
                    <p>This is the content of the document...</p>
                </div>

                <a href="/" className="button back-button">Back</a>
            </div>
        </div>
    );
};

export default View;