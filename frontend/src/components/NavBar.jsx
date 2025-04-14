import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import Profile from '@mui/icons-material/AccountCircle';
import Folder from '@mui/icons-material/FolderCopy';
import Verify from '@mui/icons-material/Verified';
import UploadFileIcon from '@mui/icons-material/UploadFile';
export const NavBar = () => {
    const navigate = useNavigate();
    return (
        <div className="row col-md-12" style={{ paddingLeft: "0px",justifyItems:"right",display: "flex",background: "whitesmoke"}}>
            <div style={{textAlign:"right",paddingRight:"30px"}}>
                <button style={{background: "whitesmoke"}} onClick={() => navigate("/profile")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>
                       <Profile fontSize="large"/>
                    </h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>
                        <DashboardIcon fontSize="large"/>
                    </h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/documentmanagement")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>
                        <Folder fontSize="large"/></h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/upload")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>
                        <UploadFileIcon fontSize="large"/></h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/verify")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>
                        <Verify fontSize="large"/></h6>
                </button>
            </div>
        </div>
    );
}
export default NavBar;
