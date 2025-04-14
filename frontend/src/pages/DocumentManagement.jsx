import Sidebar from "../components/Sidebar";
import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { ethers } from 'ethers';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { MyCert } from "../components/MyCert";

const Docs = () => {
    const [value, setValue] = React.useState(0);
    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!data.account || !data.userContractAddress) return;

            setLoading(true);
            setError(null);

            try {
                await refetchUserProfile();
            } catch (err) {
                console.error('Error loading user profile:', err);
                setError('Failed to load certificates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [data.account, data.userContractAddress]);

    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;
        if (!loading) {
            return (
                <div
                    role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}
                    {...other}
                >
                    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
                </div>
            );
        }
        else {
            return (
                <div
                    role="tabpanel"
                    hidden={value !== index}
                    id={`simple-tabpanel-${index}`}
                    aria-labelledby={`simple-tab-${index}`}
                    {...other}
                >
                    {value === index &&
                        <Box sx={{ p: 3 }}>
                            <row>
                                <Button
                                    fullwidth
                                    loading
                                    loadingPosition="end"
                                    endIcon={<SaveIcon />}
                                    variant="outlined"
                                    style={{ color: "black" }}
                                >
                                    Loading
                                </Button>

                            </row>
                        </Box>}
                </div>
            )
        }

    }

    CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }



    //handles change of tab
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Sidebar></Sidebar>
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg " style={{ marginLeft: "30px", width: "98vw" }}>
                <div className="container-fluid py-1 px-3">
                    <div className="container-fluid py-2">
                        <div className="row">
                            <div className="col-12">
                                <div style={{ alignItems: "center", justifyItems: "center" }}>
                                    <h1 style={{ padding: "20px" }}>Document Management</h1>
                                </div>
                                <div className="card" style={{ alignItems: "center" }}>
                                    <Box sx={{ width: "85%", }}>
                                        <Box sx={{ padding: 2, borderBottom: 1, borderColor: 'divider', width: "100%", justifyItems: "left" }}>
                                            <Tabs className="border-radius-lg"
                                                value={value} onChange={handleChange}
                                                sx={{ width: "100%", justifyItems: "center" }}
                                                variant="scrollable" 
                                                scrollButtons="auto"
                                            >
                                                <Tab 
                                                    sx={{ width: "20%", color: "black",fontSize:"20px"}} label="Active" {...a11yProps(0)} />

                                                <Tab 
                                                    sx={{ width: "20%", color: "black",fontSize:"20px"}} label="Broadcast" {...a11yProps(1)} />

                                                <Tab 
                                                   sx={{ width: "20%", color: "black",fontSize:"20px"}} label="Public" {...a11yProps(2)} />

                                                <Tab
                                                    sx={{ width: "20%", color: "black",fontSize:"20px"}} label="Private" {...a11yProps(3)} />

                                                <Tab 
                                                    sx={{ width: "20%", color: "black",fontSize:"20px"}} label="Inactive" {...a11yProps(4)} />


                                            </Tabs>
                                        </Box>

                                        <CustomTabPanel value={value} index={4}>
                                            {MyCert('Inactive')}
                                        </CustomTabPanel>

                                        <CustomTabPanel value={value} index={1}>
                                            {MyCert('Active')}
                                        </CustomTabPanel>

                                        <CustomTabPanel value={value} index={2}>
                                            {MyCert('Active')}
                                        </CustomTabPanel>

                                        <CustomTabPanel value={value} index={3}>
                                            {MyCert('Active')}
                                        </CustomTabPanel>

                                        <CustomTabPanel value={value} index={0}>
                                            {MyCert('All')}
                                        </CustomTabPanel>

                                    </Box>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </main>
        </>)
}
export default Docs;
