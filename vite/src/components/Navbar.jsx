import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import Button from '@mui/material/Button';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import WifiTetheringErrorIcon from '@mui/icons-material/WifiTetheringError';
import { Typography, Box, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar.jsx';
import ConnectionPopup from './ConnectionPopup.jsx';
import "../styles/Navbar.css";

export default function LabelBottomNavigation() {
    const [value, setValue] = useState('recents');
    const [isConnected, setIsConnected] = useState(true);//should be set by your logic 
    const [popupOpen, setPopupOpen] = useState(false);
    const isWideScreen = useMediaQuery('(min-width:900px)');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const connectionDetails = {
        address: '0x742d...35f1',
        provider: 'MetaMask',
        network: 'Ethereum Mainnet',
        irysStatus: 'Connected'
    };

    return (
        <>
            <BottomNavigation className='Navbar' sx={{ justifyContent: "space-around" }} value={value} onChange={handleChange}>
                <div style={{ alignSelf: "center", justifySelf: "left" }}>
                    {Sidebar()}
                </div>

                <Typography variant="h6" sx={{ flexGrow: 1, alignSelf: "center" }}>
                    Net Authorizing System
                </Typography>
                <Box>
                    <Button onClick={() => setPopupOpen(true)}>
                        {isConnected ? (
                            <>
                                <WifiTetheringIcon className='icons' />
                                {isWideScreen && (
                                    <p style={{paddingLeft:"5px"}}>Connected</p>
                                )}
                            </>
                        ) : (
                            <>
                                <WifiTetheringErrorIcon className='icons' />
                                {isWideScreen && (
                                    <p style={{paddingLeft:"5px"}}>Disconnected</p>
                                )}
                            </>
                        )}
                    </Button>
                </Box>
            </BottomNavigation>

            <ConnectionPopup 
                open={popupOpen}
                onClose={() => setPopupOpen(false)}
                isConnected={isConnected}
                connectionDetails={connectionDetails}
            />
        </>
    );
}
