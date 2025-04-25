import React, { useState} from 'react';
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
import { Typography, Box,useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar.jsx'
import "../styles/Navbar.css";

export default function LabelBottomNavigation() {
    const [value, setValue] = React.useState('recents');

    const isWideScreen = useMediaQuery('(min-width:900px)');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const { isconnected, setisConnected } = useState(false);

    return (
        <BottomNavigation className='Navbar' sx={{ justifyContent: "space-around" }} value={value} onChange={handleChange}>
            <div style={{ alignSelf: "center", justifySelf: "left" }}>
                {Sidebar()}
            </div>

            <Typography variant="h6" sx={{ flexGrow: 1, alignSelf: "center" }}>
                Net Authorizing System
            </Typography>
            <Box>
                <BottomNavigationAction
                    component={RouterLink}
                    to="/"
                    label="Dashboard"
                    sx={{ color: "white" }}
                    icon={<DashboardIcon className='icons' />}
                />
                <BottomNavigationAction
                    component={RouterLink}
                    to="/broadcast"
                    label="Broadcast"
                    sx={{ color: "white" }}
                    icon={<PodcastsIcon sx={{ height: '30px' }} className='icons' />}
                />
                <BottomNavigationAction
                    component={RouterLink}
                    to="/public"
                    label="Public"
                    sx={{ color: "white" }}
                    icon={<PublicIcon sx={{ height: '30px' }} className='icons' />}
                />
                <BottomNavigationAction
                    component={RouterLink}
                    to="/private"
                    label="Private"
                    sx={{ color: "white" }}
                    icon={<LockIcon sx={{ height: '30px' }} className='icons' />}
                />
                
                <BottomNavigationAction
                    component={RouterLink}
                    to="/verify"
                    label="Verify"
                    sx={{ color: "white" }}
                    icon={<VerifiedUserIcon sx={{ height: '30px' }} className='icons' />}
                />

                <Button
                //you can add the button here and logics 
                //onClick={connectMetamask}
                >
                    {isconnected ? (
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
            </Box >
        </BottomNavigation>

    );
}
