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
  List,
  ListItem,
  ListItemText,
  Avatar,
  Grid
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ConnectionPopup = ({ open, onClose, isConnected, connectionDetails, mockConnected = false }) => {
  isConnected = true
  const effectiveIsConnected = mockConnected ? true : isConnected;

  // fake data
  const ethBalance = "1.2345 ETH";
  const irysBalance = "5678 IRYS";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1, fontSize: 30 }} />
        {effectiveIsConnected ? connectionDetails.address : 'Connection Status'}
      </DialogTitle>
      
      <DialogContent>
        {effectiveIsConnected ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label="PRO" 
                color="primary" 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Typography variant="body2" component="span">
                Level up with Blockchain
              </Typography>
            </Box>

            {/* Portfolio + Profile */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                  <Typography variant="subtitle2">Portfolio →</Typography>
                  <Typography variant="body2">-</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                  <Typography variant="subtitle2">My Profile →</Typography>
                  <Typography variant="body2" color="primary">
                    Level 1
                  </Typography>
                  <Typography variant="caption">100 XP to next level</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Irys Status + Balances */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">Irys Status</Typography>
                  <Typography variant="body2" color="success.main">
                    {connectionDetails.irysStatus || "Connected"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">ETH Balance</Typography>
                  <Typography variant="body2">{ethBalance}</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">IRYS Balance</Typography>
                  <Typography variant="body2">{irysBalance}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Buy Crypto / Swap */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" size="small">Buy Crypto</Button>
              <Button variant="outlined" size="small">VISA</Button>
              <Button variant="outlined" size="small">Swap & bridge</Button>
            </Box>
          </>
        ) : (
          // not connected popup
          <List>
            {["Provider", "Address", "Network", "Irys Status", "ETH Balance", "IRYS Balance"].map((item, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={item + ":"}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CancelIcon color="error" sx={{ mr: 1 }} />
                      N/A
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!effectiveIsConnected && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              console.log('Connect wallet clicked');
            }}
          >
            Connect Wallet
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionPopup;
