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
import {MyCert} from '../components/MyCert';
import NavBar from '../components/NavBar';

const Profile = () => {
  const { data } = useContext(DataContext);
  const { refetchUserProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const address = '0x385847c71ae992d004cbef79e9ca02b9c9674172';
  return (
    <div className="g-sidenav-show bg-gray-100">
      <Sidebar />
      <NavBar/>
      {/* Main Content */}
      <div className="main-content position-relative max-height-vh-100 h-100" style={{ marginLeft: '50px', maxHeight: "100vh", height: "100", width: "98vw", position: "relative" }}>
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

                  <h4 className="mb-1">Current Address : {address} {/** User address */} </h4>
                  <p className="mb-0 font-weight-normal text-sm"></p>
                </div>
              </div>
              <div className="card" style={{border:"none",boxShadow:"none",paddingTop:"30px"}}>
              <h5 style={{textAlign:"left"}}>My contracts ({"num of contract"})</h5> {/** shows user's contracts where contract user = current User */}
              <div className="">
                {/*show all contract that match contract address 
                  * should change to pass array, not tag
                  */}{MyCert('Active')}
                  
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
