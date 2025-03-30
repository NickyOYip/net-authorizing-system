import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchOutline } from "react-icons/io5";
import Sidebar from "../Sidebar_shison";

const Verify = () => {
    const navigate = useNavigate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const toUpload = () => {
        window.location.href = "/upload";
    };

    const toVerify = () => {
        window.location.href = "/verify";
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

    {/* put your input like this, or change the name*/}
    const data ={
        cert_name:'Chan Tai Man',
        title:'Batchelor of Science in Biology',
        version:'1.1',
        content:'Graduated in 2023,CGPA 4.0......'}

    const Record =({cert})=>{
        return(
            <div className="col-lg-6">
                    <div className="card" style={{ width: '450px', height: '560px',padding: '30px'}}>
                     <label>Document Name:</label>
                     <p>{cert.title}</p>
                     <br />
                     <label>Name:<p>{cert.cert_name}</p></label>
                     <br />
                    <label>Version: <p>{cert.version}</p></label>
                    <br />
                    <label>Status:</label>
                    <label>✅ Certified</label>
                    <br />
                    <label>Content:</label>
                    <p>{cert.content}</p>
                </div>
            </div>
            
        );
    }

  return (
    <div>
      {/* Main Content */}
        <div className="container" style={{padding:'40px',backgroundColor:"whitesmoke"}}>
        <header id="header" className="header">
                <div className="row" style={{ justifyContent: 'space-between', width: '98%', alignItems: 'center' }}>
                    <div style={{ display: 'flex'}}>
                        <h1 className="pageName" style={{ color:'black', alignSelf: 'center', paddingTop: '16px',paddingLeft:'30px'}}>Verification Page</h1>
                    </div>
                    
                </div>
            </header>
            <Sidebar/>
            <div className="container">
                <div className="row" style={{ display: 'flex'}}>
                    <div className="col-lg-6" style={{ width: '450 px', height: '300px', marginTrim:'all'}}>
                        <div className="card" style={{ width: '450', height: '560px',padding: '30px'}}>
                            <div>
                                <label>Input your verification code here</label>
                                <br />
                                <br />
                                <input type="text"/>
                            </div>

                            <div style={{ alignItems: 'center', paddingTop:'30px'}}>
                            <div>
                                <p>Or upload your PDF here</p>
                                <input type="file" />
                            </div>
                            <br />
                            <button style={{background:"white",borderRadius:"5px",borderColor:"#0000",boxShadow:"2px 2px 5px grey"}}>Verify</button>
                            
                        </div>
                    </div>
                </div>
                {/*Here for the input*/}
                <Record cert={data}/>
          </div>
        </div>
      </div>
    </div>
  );


  
};

export default Verify;