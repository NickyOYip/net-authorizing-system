import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '../styles/all.css'

export default function DashboardCard({ title, info, type, number }) {

    function icon() {
        switch (title) {
            case 'Broadcast Contracts':
                return <PodcastsIcon style={{ fontSize: '40px', color: '#5cacfd' }} />
            case 'Private Contracts':
                return <LockIcon sx={{ fontSize: '40px', color: '#5cacfd' }} />
            case 'Public Contracts':
                return <PublicIcon sx={{ fontSize: '40px', color: '#5cacfd' }} />
            case 'Verify Documents':
                return <VerifiedUserIcon sx={{ fontSize: '40px', color: '#f48cff' }} />
        }
    }

    const navigate = useNavigate();

    const handleView = () => {
        navigate('/'); // Navigate programmatically
    };

    const handleCreate = () => {
        navigate('/create_' + { type }); // Navigate programmatically
    };

    return (

        <Card
            sx={{
                padding: "10px",
                margin: "20px"
            }}
        >
            <React.Fragment>
                <CardContent>
                    {icon()}
                    <Typography variant="h5" component="div">
                        {title}
                    </Typography>
                    <Typography variant="body2">
                        {info}
                    </Typography>
                </CardContent>
                {type != null && (
                    <CardActions>
                        {type == 'contract' ? (
                            <div>
                                <Button size="small" sx={{ color: '#5cacfd', marginRight: '20px' }}
                                >View All({number})</Button>

                                <Button size="small"
                                    sx={{
                                        background: '#5cacfd',
                                        color: '#242424',
                                    }}
                                    onClick={() => {
                                        if (title == 'Broadcast Contracts') { navigate('/create_broadcast'); }
                                        if (title == 'Public Contracts') { navigate('/create_public'); }
                                        if (title == 'Private Contracts') { navigate('/create_private'); }
                                    }}
                                >Create New
                                </Button>
                            </div>
                        )
                            : (
                                <div>
                                    <Button size="small"
                                        sx={{
                                            background: '#f48cff',
                                            color: '#242424',
                                            padding: "5px"
                                        }}
                                    /*
                                    onClick={()=>{
                                        if(title == 'Broadcast Contracts'){navigate('/view_broadcast');}
                                        if(title == 'Public Contracts'){navigate('/view_public');}
                                        if(title == 'Private Contracts'){navigate('/view_private');}
                                        }}
                                    */

                                    >Verify Now
                                    </Button>
                                </div>
                            )

                        }
                    </CardActions>
                )}


            </React.Fragment>
        </Card>
    )



}