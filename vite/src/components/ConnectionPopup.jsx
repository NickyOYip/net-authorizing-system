import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { WalletContext } from '../provider/walletProvider';
import { DataContext } from '../provider/dataProvider';

const ConnectionPopup = ({ open, onClose }) => {
  const { walletStatus, irysStatus, connectWallet } = useContext(WalletContext);
  const { data } = useContext(DataContext);

  // Wallet info
  const [address, setAddress] = useState(null);
  const [providerName, setProviderName] = useState('N/A');
  const [network, setNetwork] = useState('N/A');
  const [ethBalance, setEthBalance] = useState('N/A');
  // Irys info
  const [irysBalance, setIrysBalance] = useState('N/A');

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (data.ethProvider) {
        try {
          const signer = await data.ethProvider.getSigner();
          const addr = await signer.getAddress();
          setAddress(addr);
          // Provider name (MetaMask, etc)
          setProviderName(window.ethereum?.isMetaMask ? 'MetaMask' : 'Injected');
          // Network
          const networkObj = await data.ethProvider.getNetwork();
          setNetwork(networkObj.name || networkObj.chainId);
          // Balance
          const balance = await data.ethProvider.getBalance(addr);
          setEthBalance(Number(balance) / 1e18 + ' ETH');
        } catch {
          setAddress(null);
          setProviderName('N/A');
          setNetwork('N/A');
          setEthBalance('N/A');
        }
      } else {
        setAddress(null);
        setProviderName('N/A');
        setNetwork('N/A');
        setEthBalance('N/A');
      }
    };
    fetchWalletInfo();
  }, [data.ethProvider]);

  useEffect(() => {
    const fetchIrysBalance = async () => {
      if (data.irysUploader && address) {
        try {
          // Assume irysUploader has a getBalance method
          const bal = await data.irysUploader.getBalance();
          setIrysBalance(Number(bal) / 1e18 + ' ETH');
        } catch {
          setIrysBalance('N/A');
        }
      } else {
        setIrysBalance('N/A');
      }
    };
    fetchIrysBalance();
  }, [data.irysUploader, address]);

  const isConnected = !!address;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1, fontSize: 30 }} />
        Connection Status
      </DialogTitle>

      <DialogContent>
        {isConnected ? (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>Wallet Status</Typography>
            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body2" sx={{ color: 'green', fontWeight: 600 }}>
                    Connected
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Provider</Typography>
                  <Typography variant="body2" sx={{ color: providerName !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                    {providerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Network</Typography>
                  <Typography variant="body2" sx={{ color: network !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                    {network}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Balance</Typography>
                  <Typography variant="body2" sx={{ color: ethBalance !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                    {ethBalance}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Irys Status</Typography>
            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Typography variant="body2" sx={{ color: 'green', fontWeight: 600 }}>
                    Connected
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Balance</Typography>
                  <Typography variant="body2" sx={{ color: irysBalance !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                    {irysBalance}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 2 }} />
          </>
        ) : (
          // not connected popup
          <List>
            {["Provider", "Address", "Network", "ETH Balance", "Irys Status", "IRYS Balance"].map((item, index) => (
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
        {!isConnected && (
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionPopup;