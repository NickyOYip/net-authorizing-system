import React from "react";
import { useNavigate } from "react-router-dom";

export const NavBar = () => {
    const navigate = useNavigate();
    return (
        <div className="row col-md-12" style={{ paddingLeft: "0px",justifyItems:"right",display: "flex",background: "whitesmoke"}}>
            <div style={{textAlign:"right",paddingRight:"30px"}}>
                <button style={{background: "whitesmoke"}} onClick={() => navigate("/profile")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>Profile</h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>Dashboard</h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/documentmanagement")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>Document Management</h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/upload")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>Upload Certificate</h6>
                </button>
                <button style={{background: "whitesmoke"}}onClick={() => navigate("/verify")}>
                    <h6 style={{ textAlign: 'center', paddingTop: '5px', color: "black"}}>Verify Certificate</h6>
                </button>
            </div>
        </div>
    );
}
export default NavBar;