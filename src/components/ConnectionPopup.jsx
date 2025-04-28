import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const handleConnectWallet = () => {
    console.log('Connect wallet clicked');
    //Put real connection logic here
  };
  

const ConnectionPopup = ({ open, onClose, isConnected, connectionDetails }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AccountCircleIcon />
        </Avatar>
        <Typography variant="h6" noWrap>
          {isConnected ? connectionDetails.address : 'Connection Status'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isConnected ? (
          <>
            {/* Level up Banner */}
            <Box
              sx={{
                border: '1px solid #8e24aa',
                borderRadius: 2,
                p: 2,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="PRO" color="secondary" size="small" />
                <Typography>Level up with Blockchain</Typography>
              </Box>
              <Button variant="outlined" size="small">
                Go PRO →
              </Button>
            </Box>

            {/* Portfolio / My Profile Cards */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Portfolio
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      My profile
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Level 1
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      100 XP to next level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Boosting Power */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2">My Boosting Power (BP)</Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                ⚡ 0
              </Typography>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3 }} />

            {/* Buy Crypto / Swap */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button variant="outlined" fullWidth>
                  Buy Crypto
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="outlined" fullWidth>
                  Swap & Bridge
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          // Unconnected State
          <Box>
            {['Provider', 'Address', 'Network', 'Irys Status'].map((label) => (
              <Box key={label} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{label}:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <CancelIcon color="error" />
                  <Typography variant="body2">Not Connected</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!isConnected && (
            <Button 
            variant="contained" 
            color="primary"
            onClick={handleConnectWallet}
            >
            Connect Wallet
            </Button>
        )}
        </DialogActions>

    </Dialog>
  );
};

export default ConnectionPopup;
