/*
=========================================================
* Material Dashboard 3 - v3.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://www.creative-tim.com/license)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import Sidebar from "../components/Sidebar";
import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';

const Profile = () => {
  const { data } = useContext(DataContext);
  const { refetchUserProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /*useEffect(() => {
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
  */

  return (
    <div className="g-sidenav-show bg-gray-100">
      <Sidebar />
      {/* Main Content */}
      <div className="main-content position-relative max-height-vh-100 h-100" style={{ marginLeft: '50px', maxHeight: "100vh", height: "100", width :"98vw" ,position: "relative" }}>
        {/* Navbar */}
        <nav className="navbar navbar-main navbar-expand-lg px-0 mx-3 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
          <div className="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
              </ol>
            </nav>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container-fluid px-2 px-md-4">
          <div className="page-header min-height-300 border-radius-xl mt-4" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}>
            <span className="mask bg-gradient-dark opacity-6"></span>
          </div>
          <div className="card card-body mx-2 mx-md-2 mt-n6">
            <div className="row gx-4 mb-2">
              <div className="col-auto my-auto">
                <div className="h-100">
                  <h5 className="mb-1">Hong Kong Metropolitian University</h5>
                  <p className="mb-0 font-weight-normal text-sm">Organisation</p>
                </div>
              </div>

              <h5>Your Certificates</h5>
              <div className="certificate-section">
                <h6>Active Certificates ({data.userProfile.certificatesList.length})</h6>
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
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Profile;
