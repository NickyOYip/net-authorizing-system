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
import NavBar from "../components/NavBar.jsx";
import { useState, useEffect, useContext } from 'react';
import { DataContext } from '../store/dataStore';
import { MetaMaskContext } from '../MetaMaskProvider.jsx';
import { useUserProfile } from '../hooks/useUserProfile';
import SearchCard from "../components/SearchCard.jsx";

import "../styles/material-dashboard.css";
import "../styles/material-dashboard.min.css";
import "../styles/nucleo-icons.css";
import "../styles/nucleo-svg.css";
import { MyCert } from "../components/MyCert.jsx";
import VerifyCard from "../components/VerifyCard.jsx";

const Dashboard = () => {
  //get data
  const { data } = useContext(DataContext);
  const { refetchUserProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!data.exampleUserProfile1.account || !data.exampleUserProfile1.userContractAddress) return;

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
  }, [data.exampleUserProfile1.account, data.exampleUserProfile1.userContractAddress]);

  const { account } = useContext(MetaMaskContext);

  //my data

  const toVerify = () => {
    window.location.href = "/verify";
  };
  const toView = () => {
    window.location.href = "/view";
  };
  const toDM = () => {
    window.location.href = "/DocumentManagement";
  };

  const certificate = data.exampleUserProfile1.certificatesList.slice(0, 4);


  return (

    <div className="g-sidenav-show bg-gray" style={{ backgroundColor: "whitesmoke", width: "100vw" }}>
      <Sidebar />
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg" style={{ marginLeft: '50px' }}>
      <NavBar/>
        <div className="container-fluid py-2">
          <div className="row"style={{ display: "flex", width: "95vw" }}>
            <div className="col-lg-8">
              <div className="row" style={{ display: "flex", width: "95vw" }}>
                <div className="col-xl-6 mb-xl-0 mb-4">
                  <div className="card bg-transparent shadow-xl">
                    <div className="overflow-hidden position-relative border-radius-xl">
                      <span className="mask bg-gradient-dark opacity-10"></span>
                      {/*----------Usercard--------------------------------------------------------------------------------------------------*/}
                      <div className="card-body position-relative z-index-1 p-3">
                        <h4 id="address" className="text-white mt-4 mb-5 pb-2">
                          {account}
                        </h4>
                        <div className="d-flex">
                          <div className="d-flex">
                            <div className="me-4">
                              <h5 className="text-white sopacity-8 mb-0" style={{ height: "60px" }}>Address</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6" >
                  <div className="row" >
                    <div className="col-md-6 col-6">
                      <div className="card" onClick={toDM}>
                        <div className="card-header mx-4 p-3 text-center">
                          <div className="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg"
                            style={{ width: "80px", height: "80px" }}>
                            <span
                              style={{ marginTop: '0px', fontSize: '55px' }}>
                              &#128203;
                            </span>
                          </div>
                        </div>
                        <div className="card-body pt-0 p-3 text-center" >
                          <h4 className="text-center mt-0" >Active</h4>
                          <hr className="horizontal dark my-3" />
                          <h5 className="mb-0 color-black">{data.exampleUserProfile1.certificatesList.length}</h5>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-6">
                      <div className="card" onClick={toDM}>
                        <div className="card-header mx-4 p-3 text-center">
                          <div className="icon icon-shape icon-lg bg-gradient-dark shadow text-center border-radius-lg"
                            style={{ width: "80px", height: "80px" }}>
                            <span
                              style={{ paddingTop: '10px', fontSize: '55px' }}>
                              &#128195;
                            </span>
                          </div>
                        </div>
                        <div className="card-body pt-0 p-3 text-center" >
                          <h4 className="text-center mb-0">Inactive</h4>
                          <hr className="horizontal dark my-3" />
                          <h5 className="mb-0 color-black">{data.exampleUserProfile1.certifiedCertificates.length - data.userProfile.certificatesList.length}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/** Search card */}
                <div className="col-md-6 mt-4">
                    <SearchCard/>
                </div>
                 <div className="col-md-6 mt-4">
                    <div className="card h-100 mb-4">
                      <VerifyCard/>
                    </div>
                  </div>
              </div>
            </div>
            <div className="col-lg-12" style={{ marginTop: "10px" }}>
            <div className="card h-100">
              <h4 style={{ margin: "15px", marginBottom: "0px" }}>Recent Certificates</h4>
              <div style={{ margin: "20px", marginTop: "0px" }}>
                {MyCert('all')}
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
