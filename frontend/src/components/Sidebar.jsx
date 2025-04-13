import { width } from "@mui/system";
import React, { useState } from "react";
import { BiAlignJustify } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import NetworkSwitcher from "./NetworkSwitcher";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the sidebar open/close
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const list = {
    backgroundColor: 'whitesmoke',
    justifyContent: "center",
    alignItems: "centre",
    borderRadius: "10px",
    listStyleType: 'none',
    padding: '5px',
    margin: "10px",
  
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        style={styles.hamburger}
        aria-label="Toggle Sidebar"
      >
        &#9776; {/* Hamburger icon */}
      </button>

      {/* Sidebar */}
      <aside style={{ ...styles.sidenav, width: isOpen ? "230px" : "0px", paddingTop: '80px' }}>
        <div className="sidenav-header">
          <div className="row d-flex" style={{ alignItems: "center", paddingLeft: "10px", flexWrap: "nowrap" }}>
            <br />
            <h6>Hong Kong Metropolitan University</h6>
          </div>
        </div>

        <ul style={{ paddingLeft: "0px" }} className="sidebar-list">
          <li style={list } className="functions" onClick={() => navigate("/profile")}>
            <h6 style={{ textAlign: 'center', paddingTop: '5px' }}>Profile</h6>
          </li>
          <li style={list} className="functions"  onClick={() => navigate("/")}>
            <h6 style={{ textAlign: 'center', paddingTop: '5px' }}>Dashboard</h6>
          </li>
          <li style={list} className="functions" onClick={() => navigate("/documentmanagement")}>
            <h6 style={{ textAlign: 'center', paddingTop: '5px' }}>Document Management</h6>
          </li>
          <li style={list} className="functions" onClick={() => navigate("/upload")}>
            <h6 style={{ textAlign: 'center', paddingTop: '5px' }}>Upload Certificate</h6>
          </li>
          <li style={ list} className="functions"  onClick={() => navigate("/verify")}>
            <h6 style={{ textAlign: 'center', paddingTop: '5px' }}>Verify Certificate</h6>
          </li>
        </ul>

      </aside>

      {/* Optional overlay to prevent background clicks when sidebar is open */}
      {isOpen && <div onClick={toggleSidebar} style={styles.overlay}></div>}
    </>
  );
};

const styles = {

  hamburger: {
    color:"black",
    position: "fixed",
    padding:"0px",
    top: "5px",
    left: "10px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize:"40px",
    zIndex: 20001,  // Make sure it's above the sidebar
  },

  sidenav: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "white", // Yellow background
    overflowX: "hidden",
    transition: "0.3s", // Smooth toggle animation
    paddingTop: "20px",
    zIndex: 9999,
    fontSize: '10px',
    marginTop: '15px',
    borderRadius: '10px',
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Light black overlay for closing
    zIndex: 9998, // Overlay sits below the sidebar
  },
};





export default Sidebar;