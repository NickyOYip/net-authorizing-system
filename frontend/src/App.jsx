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

import { BrowserRouter, Routes, Route } from "react-router-dom";
//import DocumentManagement from './jsx/DocumentManagement';
import Certify from './components/Certify';
import Update from './components/Update';
import Create from './pages/Create';
import View from './components/View';
import Verify from './components/Verify';
import Dashboard from './pages/Dashboard';
import Activate from './components/Activate';
import Profile from './pages/Profile';
import SearchResult from './pages/SearchResult.jsx';
import Append from './pages/Append.jsx';
import DocumentManagement from './pages/DocumentManagement.jsx';
import "./styles/material-dashboard.css";
import "./styles/material-dashboard.min.css";
import "./styles/nucleo-icons.css";
import "./styles/nucleo-svg.css";

function App() {
    const { connect, account, network } = useContext(MetaMaskContext);

    return (
        <div className="App" style={{ backgroundColor: "whitesmoke", height: "200vh" }}>

            {/** <div style={{padding:"30px", display: "flex"}}>
                <h1 style={{paddingLeft:"60px", paddingTop:"0px"}}>Certificate Management System</h1>
                <button onClick={connect} style={{marginLeft:"60px",borderRadius:"10px"}}>Connect to MetaMask</button>
            </div>
            */}

            <BrowserRouter>

                {!account ? (
                    <div style={{ padding: "30px", display: "flex",width:"100vw"}}>
                        <h1 style={{ paddingLeft: "60px", paddingTop: "0px" }}>Certificate Management System</h1>
                        <button onClick={connect} style={{ marginLeft: "60px", borderRadius: "10px" }}>Connect to MetaMask</button>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload" element={<Create />} />
                        <Route path="/documentManagement" element={<DocumentManagement />}/>
                        <Route path="/view" element={<View />} />
                        <Route path="/Upload" element={<Update />} />
                        <Route path="/certify" element={<Certify />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/activate" element={<Activate />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/searchResult" element={<SearchResult/>} />
                        <Route path="/update" element={<Append />} />
                    </Routes>
                )}

            </BrowserRouter>





        </div>

    );
}

export default App;
