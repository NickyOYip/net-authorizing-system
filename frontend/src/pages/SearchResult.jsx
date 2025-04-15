import Sidebar from "../components/Sidebar";
import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLocation } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import { MyCert } from "../components/MyCert";
import Record from "../components/Record";
import NavBar from '../components/NavBar';

const SearchResult = () => {
    //data fectching logic
    const [value, setValue] = React.useState(0);
    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();

    //loading + error handle
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //get address from Search Card
    const location = useLocation();
    const address = location.state || {};

    //old fetch logic
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

    //display
    return (
        <>
            <Sidebar></Sidebar>
            <NavBar/>
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg " style={{ marginLeft: "30px", width: "98vw" }}>
                <div className="container-fluid py-1 px-3">
                    <div className="container-fluid py-2">
                        <div className="row">
                            <div className="col-12">
                                <div style={{ alignItems: "center", justifyItems: "center" }}>
                                    <h1 style={{ padding: "20px" }}>Search Results</h1>
                                </div>
                                <div className="card" style={{ alignItems: "center" }}>
                                    {/*show all contract that match contract address 
                                     * should change to pass array, not tag
                                    */}
                                    {MyCert('Active')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>)
}
export default SearchResult;
