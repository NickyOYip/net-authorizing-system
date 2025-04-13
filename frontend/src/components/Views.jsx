import React, { useState, useEffect,useContext } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { DataContext } from '../store/dataStore';
import Sidebar from "./Sidebar";

const View = () => {
    const { data } = useContext(DataContext);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const { refetchUserProfile } = useUserProfile();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!data.account || !data.userContractAddress) return;

            setLoading(true);
            setError(null);
            try {
                await refetchUserProfile();
            } catch (err) {
                console.error('Error loading user profile:', err);
                setError('Failed to load certificates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [data.account, data.userContractAddress]);

    //date
    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
      };
    
      if (loading) return <div>Loading certificates...</div>;
      if (error) return <div className="error">{error}</div>;
      if (!data.userProfile) return <div>No profile data available</div>;
    const toDashboard = () => {
        window.location.href = "/";
    };

    const toDM = () => {
        window.location.href = "/DocumentManagement";
    };
      

    const Show = ({ cert }) => {
        return (
            <div className='card' style={{ width: '50%', height: '50%', padding: '30px', marginTop: '50px', borderRadius: '20px', justifyContent: 'left' }}>
                <h1 style={{ alignSelf: 'center' }}>View Document</h1>
                <p><strong>Document Name:</strong> {data.owner}</p>
                <p><strong>Address:</strong>{data.userContractAddress}</p>
                <p><strong>Version:</strong>{cert.version}</p>
                <p><strong>Disable time:</strong> {cert.disableTime}</p>
                <p><strong>Status:</strong> {cert.state}</p>
                <p><strong>Upload Date:</strong> {cert.deployTime}</p>

                <div className="document-content">
                    <p>This is the content of the document...</p>
                </div>

                <button className="button" onClick={toDM}>Back</button>
            </div>
        );
    }

    return (
        <div>
            {/* Sidebar */}
            <Sidebar />
            <div
                className="container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',  // Center content horizontally
                    justifyContent: 'top', // put content on top section
                    height:'150vh', // Full viewport height
                    textAlign: 'left' // Ensure text is centered
                }}
            >
                <Show cert={data} />
            </div>
        </div >
    );
};

export default View;