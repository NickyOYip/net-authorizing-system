import React, { useState } from 'react';
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
import { mockEthBalance, mockIrysBalance, mockProvider } from '../mockHelpers';

const ConnectionPopup = ({ open, onClose, isConnected, connectionDetails, mockConnected = false }) => {

  // MOCK DATA: always set isConnected to true for demo
  isConnected = true //should be set by your logic or passed by navbar 
  const effectiveIsConnected = mockConnected ? true : isConnected;

  // Use mock data from helper
  const [ethBalance, setEthBalance] = useState(mockEthBalance);
  const [irysBalance, setIrysBalance] = useState(mockIrysBalance);
  const [provider, setProvider] = useState(mockProvider);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1, fontSize: 30 }} />
        {effectiveIsConnected ? connectionDetails.address : 'Connection Status'}
      </DialogTitle>

      <DialogContent>
        {effectiveIsConnected ? (
          <>
            {/** 
            <Box sx={{ mb: 2 }}>
              <Chip
                label="PRO"
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
            </Box>
            */}
            {/* Portfolio + Profile */}
            <Box sx={{ display: "flex", p: 2, border: '1px solid #ccc', borderRadius: 2, justifyContent: "space-between", marginBottom: "10px" }}>
              <Typography variant="subtitle2">Provider </Typography>
              <Typography variant="body2" color="success.main">
                {provider}
              </Typography>
            </Box>

            
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2">Wallet Status</Typography>
                    <Typography variant="body2" color="success.main">
                      Connected
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2">ETH Balance</Typography>
                    <Typography variant="body2" color="success.main">
                      {ethBalance} ETH</Typography>
                  </Box>
                </Grid>
              </Grid>
            


            {/* Irys Status + Balances */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">Irys Status</Typography>
                  <Typography variant="body2" color="success.main">
                    {connectionDetails.irysStatus || "Connected"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2">IRYS Balance</Typography>
                  <Typography variant="body2" color="success.main">
                    {irysBalance} ETH</Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Buy Crypto / Swap */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" size="small">Fund[ 0.01 ETH to IRYS wallet]</Button>
              <Button variant="outlined" size="small">Withdraw from Irys wallet</Button>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', color: "white" }}>
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