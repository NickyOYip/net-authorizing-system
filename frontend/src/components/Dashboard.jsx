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
import Sidebar from "../Sidebar_shison";
import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { DataContext } from '../store/dataStore';
import { MetaMaskContext } from '../MetaMaskProvider.jsx';
import { activateCertificate } from '../services/certificateService';
import { useUserProfile } from '../hooks/useUserProfile';
import { Data } from '../dataStore2';
const Dashboard = () => {
  //get data
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

  const {account} = useContext(MetaMaskContext);

  //my data
  const { recentCertificates, recentVer, user, stat, search } = Data();
  const toVerify = () => {
    window.location.href = "/verify";
  };
  const toView = () => {
    window.location.href = "/view";
  };
  const toDM = () => {
    window.location.href = "/DocumentManagement";
  };
  const certificate = recentCertificates.slice(0, 4);
  const ver = recentVer.slice(0, 3);

  return (
    <div className="g-sidenav-show bg-gray" style={{backgroundColor:"whitesmoke",}}>
      <Sidebar />
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg" style={{ marginLeft: '50px' }}>
        <div className="container-fluid py-2">
          <div className="row">
            <div className="col-lg-8">
              <div className="row">
                <div className="col-xl-6 mb-xl-0 mb-4">
                  <div className="card bg-transparent shadow-xl">
                    <div className="overflow-hidden position-relative border-radius-xl">
                      <span className="mask bg-gradient-dark opacity-10"></span>
 {/*----------Usercard--------------------------------------------------------------------------------------------------*/}
                      <div className="card-body position-relative z-index-1 p-3">
                        <h6 id="address" className="text-white mt-4 mb-5 pb-2">
                         {account}
                        </h6>
                        <div className="d-flex">
                          <div className="d-flex">
                            <div className="me-4">
                              <p className="text-white text-sm opacity-8 mb-0">User Name</p>
                              <h6 className="text-white mb-0">{data.userProfile.owner}</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="row">
                    <div className="col-md-6 col-6">
                      <div className="card" onClick={toDM}>
                        <div className="card-header mx-4 p-3 text-center">
                          <div className="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg">
                            <span
                              style={{ paddingTop: '10px', fontSize: '40px' }}>
                              &#128203;
                            </span>
                          </div>
                        </div>
                        <div className="card-body pt-0 p-3 text-center" >
                          <h6 className="text-center mb-0">Active</h6>
                          <hr className="horizontal dark my-3" />
                          <h5 className="mb-0 color-black">{data.userProfile.certificatesList.length}</h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-6">
                      <div className="card" onClick={toDM}>
                        <div className="card-header mx-4 p-3 text-center">
                          <div className="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg">
                            <span
                              style={{ paddingTop: '10px', fontSize: '40px' }}>
                              &#128195;
                            </span>
                          </div>
                        </div>
                        <div className="card-body pt-0 p-3 text-center" >
                          <h6 className="text-center mb-0">Inactive</h6>
                          <hr className="horizontal dark my-3" />
                          <h5 className="mb-0 color-black">{data.userProfile.certifiedCertificates.length - data.userProfile.certificatesList.length}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 mb-lg-0 mb-4">
                  <div className="card mt-4">
                    <div className="card-header pb-0 p-3">
                      <div className="row">
                        <div className="col-6 d-flex align-items-center">
                          <h6 className="mb-0">Verify certificate</h6>
                        </div>
                        <div className="col-6 text-end">
                          <button className="btn bg-gradient-dark mb-0" onClick={toVerify}>Verify Now</button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-3">
                      <div className="row">
                        <div className="col-md-6 mb-md-0 mb-4">
                          <div style={{ display: 'flex' }}>
                            <input type="file" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100">
                <div className="card-header pb-0 p-3">
                  <div className="row">
                    <div className="col-6 d-flex align-items-center">
                      <h6 className="mb-0">Recent Certificates</h6>
                    </div>
                    <div className="col-6 text-end">
                      <button className="btn btn-outline-primary btn-sm mb-0" onClick={toDM}>View/Update</button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-3 pb-0">
                  <ul className="list-group">
                    {/*----------------------------Recent Certification------------------------------------------------------------------------------------*/}
                    {data.userProfile.certifiedCertificates.map(cert => (
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex flex-column" style={{ maxWidth: '50%' }}>
                          <h6 className="mb-1 text-dark font-weight-bold text-sm">{cert.owner}</h6>
                          <span className="text-xs">{cert.userAddress}</span>
                        </div>
                        <div className="d-flex align-items-center text-sm" >
                          {cert.state}
                          <h6 className="text-dark text-sm mb-0 px-0 ms-4">{cert.deployTime}</h6>
                        </div>
                      </li>
                    ))}
                    {/* Repeat similar list items for other entries */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-7 mt-4">
              <div className="card">
                <div className="card-header pb-0 px-3">
                  <h6 className="mb-0">Recent Verifications</h6>
                </div>
                <div className="card-body pt-4 p-3">
                  <ul className="list-group">
                    {/*--------------Recent Verfication--------------------------------------------------------------------------------------*/}
                    {ver.map(cert => (
                      <li className="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                        <div className="d-flex flex-column">
                          <h6 className="mb-3 text-sm">{cert.owner}</h6>
                          <div style={{ justifyContent: 'space-between' }}>
                            <div>
                              <span className="mb-2 text-xs">
                                Expire Time: <span className="text-dark ms-sm-2 font-weight-bold">{cert.disableTime}</span>
                              </span>
                            </div>
                            <div>
                              <span className="mb-2 text-xs">
                                Certified By: <span className="text-dark ms-sm-2 font-weight-bold">{cert.orgName}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-xs">
                                Description: <span className="text-dark ms-sm-2 font-weight-bold">{cert.certificateName}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ms-auto text-end">
                          <button className="btn btn-link text-dark px-3 mb-0" onClick={toView}>Details</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-5 mt-4">
              <div className="card h-100 mb-4">
                <div className="card-header pb-0 px-3">
                  <div className="row">
                    <div className="col-md-4">
                      <h6 className="mb-0">Find Certificate</h6>
                    </div>
                    <div className="col-md-8 d-flex justify-content-start justify-content-md-end align-items-center">
                      <input
                        type="text"
                        placeholder="Name"
                        style={{ borderRadius: '10px', color: 'black', padding: '5px', marginRight: '10px' }}
                      />
                      <button className="btn bg-gradient-dark mb-0">Search</button>
                    </div>
                  </div>
                </div>
                <div className="card-body pt-4 p-3">
                  <ul className="list-group">
                    {/* ------------SEARCH------------------------------------------------------------------------------------ */}
                    {search.map(cert => (
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">{cert.owner}</h6>
                            <span className="text-xs">{cert.userAddress}</span>
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1 text-dark text-sm">{cert.certificateName}</h6>
                        </div>
                        <div id="date">
                          <p>{cert.deployTime}</p>
                        </div>
                        <div className="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
                          <p onClick={toView}>Details</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;