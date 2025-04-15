import Sidebar from "../components/Sidebar";
import Update from "../components/Update";
import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import NavBar from '../components/NavBar';
const Popup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="popup-overlay" style={{

            position: 'fixed',/* Covers the viewport and stays in place when scrolling */
            top: '50%',
            left: '50%',
            background: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            zIndex: '1000', /* Ensures the popup appears above other content */
        }}>
            <h3>BroadCast Certificate</h3>
            <p>This is the type of certificate that can be seen by everyone.
                And it is activated immediately after its creation.
            </p>
            <h3>Public Certificate</h3>
            <p>This is the type of certificate that can be seen by the owner, the user and the verifiers.
                It should not contain any sensitive information.
            </p>
            <h3>Private Certificate</h3>
            <p>This is the type of certificate that can be seen by the owner, the user and the verifiers.
                It should be used when uploading files that contains sensitive information.
            </p>
            <button onClick={onClose}> Close</button>
        </div>
    )
}


export const Create = () => {
    const [value, setValue] = React.useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    //info for types
    const [isOpen, setIsOpen] = useState(false);


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
                        Create New Certificate
                    </h1>
                </div>

                <div className='card' style={{ padding: '30px', marginTop: '50px', borderRadius: '20px', width: "100%" }}>
                    <Box sx={{ width: "100%", }}>
                        <div style={{ textAlign: "right", width: "100%" }}>
                            <button style={{ fontSize: "20px", background: "transparent", color: "#1976d2", padding: "0px", margin: "0px" }}
                                onClick={() => setIsOpen(true)}
                            >
                                Which type should I choose?
                            </button>
                        </div>
                        <Popup
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        />

                        <Box sx={{ padding: 2, borderBottom: 1, borderColor: "transparent", width: "100%", justifyItems: "left" }}>
                            <Tabs
                                value={value} onChange={handleChange}
                                sx={{ width: "100%", justifyItems: "center", borderRadius: "10px" }}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab
                                    sx={{ fontSize: "20px", color: "black" }}
                                    label="Broadcast Certificate" {...a11yProps(0)}
                                />

                                <Tab
                                    sx={{ fontSize: "20px", color: "black" }}
                                    label="Public Certificate" {...a11yProps(1)}
                                />

                                <Tab
                                    sx={{ fontSize: "20px", color: "black" }}
                                    label="Private Certificate" {...a11yProps(2)}
                                />

                            </Tabs>


                        </Box>

                    </Box>

                    <CustomTabPanel value={value} index={0}>
                       <Update type = 'Broadcast'>
                       </Update>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                    <Update type = 'Public'>
                    </Update>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2}>
                    <Update type = 'Private'>
                    </Update>
                    </CustomTabPanel>

                </div>

            </div>
        </div>

    )


}
export default Create;
