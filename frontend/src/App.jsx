import { useContext } from 'react';
import { MetaMaskContext } from './MetaMaskProvider.jsx';
import ContractInfo from './components/ContractInfo';
import AddCertificate from './components/AddCertificate';
import ActivateCertificate from './components/ActivateCertificate';
import CertificateValidator from './components/CertificateValidator';
import CertificateList from './components/CertificateList';
import './styles/ContractInfo.css';
import './styles/AddCertificate.css';
import './styles/CertificateValidator.css';
import React from "react";

//import Sidebar from './components/Sidebar.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocumentManagement from './jsx/DocumentManagement';
import Certify from './jsx/Certify';
import Update from './jsx/Update';
import View from './jsx/View';
import Verify from './jsx/Verify';
import Dashboard from './jsx/Dashboard';
import Activate from './jsx/Activate';
import Profile from './jsx/Profile';
import './css/nucleo-svg.css';
import './css/nucleo-icons.css';
import './css/material-dashboard.min.css';
import './css/material-dashboard.css';

function App() {
    const { connect, account, network } = useContext(MetaMaskContext);

    return (
        <div className="App" style={{backgroundColor:"whitesmoke",height:"200vh"}}>
            
            <div style={{padding:"30px", display: "flex"}}>
                <h1 style={{paddingLeft:"60px", paddingTop:"0px"}}>Certificate Management System</h1>
                <button onClick={connect} style={{marginLeft:"60px",borderRadius:"10px"}}>Connect to MetaMask</button>
            </div>
            
            
               <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload" element={<Update />} />
                        <Route path="/documentManagement" element={<DocumentManagement />} />
                        <Route path="/view" element={<View />} />
                        <Route path="/upload" element={<Update />} />
                        <Route path="/certify" element={<Certify />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/activate" element={<Activate />} />
                        <Route path="/verify" element={<Verify />} />
                    </Routes>
                </BrowserRouter>

        </div>

    );
}

export default App;