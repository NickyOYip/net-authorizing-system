import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Record from './Record';
import NavBar from './NavBar';
export const View = (address) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    return (
        <div style={{ width: "100vw", paddingLeft: "60px", justifyItems: "center" }}>
            <Sidebar />
            <NavBar/>
            <div  style={{}}>
                <h1 style={{padding:"30px",textAlign:"center"}}>View Document</h1>
                <div className='card' style={{ width: "90vw", }}>
                    <Record 
                    address = {address}/>
                </div>
            </div>
        </div>
    );
};

export default View;