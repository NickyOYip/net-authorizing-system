import React, { useState } from 'react';
import ShowContracts from '../components/ShowContracts';
import '../styles/all.css';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import WifiIcon from '@mui/icons-material/Wifi';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';
import "../styles/all.css"
import { mockStats } from '../mockHelpers';
//dashboard => tab style 
//delete quick action
//


interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

const StatCard = ({ icon, title, value, color }: StatCardProps) => {

  return (
    <Card sx={{
      borderLeft: `4px solid ${color}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <CardContent>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1
        }}>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}
          >
            {title}
          </Typography>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {

  const navigate = useNavigate();
  // Use mockStats from helper
  const stats = mockStats;
  // MOCK DATA: connected is hardcoded
  const [connected,setConnected] = useState(false);
  const [type, setType] = useState('broadcast');

  const handleTypeChange = (changedType: string) => {
    setType(changedType);
  }

  return (
    <Box sx={{ p: 3 }}>
      {connected == false && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1">
            Connect your wallet to view your contract dashboard!
          </Typography>
        </Paper>
      )}


      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ marginBottom: "15px" }}
          onClick={() => { handleTypeChange('broadcast') }}
        >
          <StatCard
            icon={<WifiIcon fontSize="large" />}
            title="Broadcast Contracts"
            value={stats.broadcast}
            color="#4e73df"

          />

        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ marginBottom: "15px" }}
          onClick={() => { handleTypeChange('public') }}
        >
          <StatCard
            icon={<PublicIcon fontSize="large" />}
            title="Public Contracts"
            value={stats.public}
            color="#1cc88a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ marginBottom: "15px" }}
          onClick={() => { handleTypeChange('private') }}
        >
          <StatCard
            icon={<LockIcon fontSize="large" />}
            title="Private Contracts"
            value={stats.private}
            color="#36b9cc"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ marginBottom: "15px" }}

        >
          <StatCard
            icon={<VerifiedIcon fontSize="large" />}
            title="Documents Verified"
            value={stats.verified}
            color="#f6c23e"
          />
        </Grid>
      </Grid>


      <Divider sx={{ my: 3 }} />
      <ShowContracts type={type} />

      {/**
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/broadcast/create"
          style={{ minWidth: 200,background:"#4e73df",marginBottom:"10px" }}
        >
          NEW BROADCAST CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/public/create"
          style={{ minWidth: 200,background:"#1cc88a",marginBottom:"10px" }}
        >
          NEW PUBLIC CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/private/create"
          style={{ minWidth: 200,background:"#36b9cc" ,marginBottom:"10px"}}
        >
          NEW PRIVATE CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/verify"
          style={{ minWidth: 200,background:"#f6c23e",marginBottom:"10px"}}
        >
          VERIFY DOCUMENT
        </Button>
      </Stack>
       */}
    </Box>
  );
};

export default Dashboard;