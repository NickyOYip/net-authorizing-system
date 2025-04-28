import { useEffect, useState } from 'react';
import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import DashboardCard from '../components/DashboardCard.jsx';
import CheckIcon from '@mui/icons-material/Check';
import CreateContract from '../components/Create';

export const NewContract = ({contractType}) => {

    const [type, setType] = useState(contractType);
    const [isOpen, setIsPopupOpen] = useState(false);

    useEffect(() => {
        if (type != null) {
            setIsPopupOpen(true);
        }
    }, [type]);

    return (
        <div>
            {isOpen == false && (
                <>
                    <h1>Create New Contract</h1>
                    <h3>Please Choose your contract type</h3>
                    <div className='row' style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <div id="private"
                            onClick={() => {
                                setIsPopupOpen(true);
                                setType('private');
                            }}>
                            <DashboardCard
                                title='Private Contracts'
                                info='Private data with targeted user and encrypted storage.'
                            />
                        </div>
                        <div id="public"
                            onClick={() => {
                                setIsPopupOpen(true);
                                setType('public');
                            }}>
                            <DashboardCard
                                title='Public Contracts'
                                info='Targeted to specific user with activation code required.'

                            />
                        </div>
                        <div id="broadcast"
                            onClick={() => {
                                setIsPopupOpen(true);
                                setType('broadcast');
                            }}>
                            <DashboardCard
                                title='Broadcast Contracts'
                                info='Public contracts visible to everyone. No activation required.'

                            />
                        </div>

                    </div>
                </>
            )}
            
            <CreateContract
                isOpen={isOpen}
                contractType={type}
                onClose={() => setIsPopupOpen(false)} />
        </div>
    )
}
export default NewContract;