import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { ethers } from 'ethers';

export const CertificateList = () => {
  const { data } = useContext(DataContext);
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

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) return <div>Loading certificates...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data.userProfile) return <div>No profile data available</div>;

  return (
    <div className="certificate-list">
      <h2>Your Certificates</h2>
      
      <div className="certificate-section">
        <h3>Active Certificates ({data.userProfile.certificatesList.length})</h3>
        <div className="certificates-grid">
          {data.userProfile.certificatesList.map((cert, index) => (
            <div key={index} className="certificate-card">
              <h4>{cert.certificateName}</h4>
              <p><strong>Organization:</strong> {cert.orgName}</p>
              <p><strong>Status:</strong> <span className={`status-${cert.state.toLowerCase()}`}>{cert.state}</span></p>
              <p><strong>Deployed:</strong> {formatDate(cert.deployTime)}</p>
              {cert.disableTime > 0 && (
                <p><strong>Expires:</strong> {formatDate(cert.disableTime)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="certificate-section">
        <h3>Certified Certificates ({data.userProfile.certifiedCertificates.length})</h3>
        <div className="certificates-grid">
          {data.userProfile.certifiedCertificates.map((cert, index) => (
            <div key={index} className="certificate-card">
              <h4>{cert.certificateName}</h4>
              <p><strong>Organization:</strong> {cert.orgName}</p>
              <p><strong>Status:</strong> <span className={`status-${cert.state.toLowerCase()}`}>{cert.state}</span></p>
              <p><strong>Deployed:</strong> {formatDate(cert.deployTime)}</p>
              {cert.disableTime > 0 && (
                <p><strong>Expires:</strong> {formatDate(cert.disableTime)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateList;
