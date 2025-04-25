import React from 'react';
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
import { Link } from 'react-router-dom';
import WifiIcon from '@mui/icons-material/Wifi';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/Verified';

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
  const stats = {
    broadcast: 0,
    public: 0,
    private: 0,
    verified: 0
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          Connect your wallet to view your contract dashboard.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<WifiIcon fontSize="large" />}
            title="Broadcast Contracts"
            value={stats.broadcast}
            color="#4e73df"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<PublicIcon fontSize="large" />}
            title="Public Contracts"
            value={stats.public}
            color="#1cc88a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<LockIcon fontSize="large" />}
            title="Private Contracts"
            value={stats.private}
            color="#36b9cc"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<VerifiedIcon fontSize="large" />}
            title="Documents Verified"
            value={stats.verified}
            color="#f6c23e"
          />
        </Grid>
      </Grid>


      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/broadcast/create"
          sx={{ minWidth: 200 }}
        >
          NEW BROADCAST CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/public/create"
          sx={{ minWidth: 200 }}
        >
          NEW PUBLIC CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/private/create"
          sx={{ minWidth: 200 }}
        >
          NEW PRIVATE CONTRACT
        </Button>
        <Button 
          variant="contained" 
          component={Link} 
          to="/verify"
          sx={{ minWidth: 200 }}
        >
          VERIFY DOCUMENT
        </Button>
      </Stack>
    </Box>
  );
};

export default Dashboard;