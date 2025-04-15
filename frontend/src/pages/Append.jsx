import Sidebar from "../components/Sidebar";
import Update from "../components/Update";
import React, { useEffect, useContext, useState } from 'react';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import NavBar from '../components/NavBar';


export const Append = () => {
    const [value, setValue] = React.useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contractAddress,setAddress] = useState();

    return (
        <div style={{ width: "100vw", }}>
            {/* Sidebar */}
            <Sidebar />
            <NavBar/>
            <div
                className="container-lg"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',  // Center content horizontally
                    justifyContent: 'left', // Center content vertically
                    height: '100vh', // Full viewport height
                    textAlign: 'left', // Ensure text is centered
                    width: '100vw'
                }}
            >
                <div style={{ justifyItems: "center", alignItems: "center" }}>
                    <h1 style={{ marginTop: '30px', justifyItems: "center" }}>
                        Update Contract
                    </h1>
                </div>

                <div className='card' style={{ padding: '30px', marginTop: '50px', borderRadius: '20px', width: "100%" }}>
                    
                    <Update 
                    type = "null"
                    address = {contractAddress}
                    >
                    </Update>

                </div>

            </div>
        </div>

    )


}
export default Append;
