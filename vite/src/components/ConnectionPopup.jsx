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
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { WalletContext } from '../provider/walletProvider';
import { DataContext } from '../provider/dataProvider';
import { fundAccount, withdrawAccount } from '../hooks/irysHook/irysAction';

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

  // Loading and feedback state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Helper to refresh wallet balance
  const refreshWalletInfo = async () => {
    if (data.ethProvider) {
      try {
        const signer = await data.ethProvider.getSigner();
        const addr = await signer.getAddress();
        setAddress(addr);
        setProviderName(window.ethereum?.isMetaMask ? 'MetaMask' : 'Injected');
        const networkObj = await data.ethProvider.getNetwork();
        setNetwork(networkObj.name || networkObj.chainId);
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

  // Helper to refresh irys balance
  const refreshIrysBalance = async () => {
    if (data.irysUploader && address) {
      try {
        const bal = await data.irysUploader.getBalance();
        setIrysBalance(Number(bal) / 1e18 + ' ETH');
      } catch {
        setIrysBalance('N/A');
      }
    } else {
      setIrysBalance('N/A');
    }
  };

  useEffect(() => {
    refreshWalletInfo();
    // eslint-disable-next-line
  }, [data.ethProvider]);

  useEffect(() => {
    refreshIrysBalance();
    // eslint-disable-next-line
  }, [data.irysUploader, address]);

  const isConnected = !!address;

  // Handler for fund
  const handleFund = async () => {
    setLoading(true);
    try {
      if (data.irysUploader) {
        await fundAccount(data.irysUploader, "0.01");
        setSnackbar({ open: true, message: "Funded 0.01 ETH to Irys wallet!", severity: "success" });
        await refreshIrysBalance();
        await refreshWalletInfo();
      } else {
        setSnackbar({ open: true, message: "Irys uploader not connected.", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to fund Irys wallet: " + (e?.message || e), severity: "error" });
    }
    setLoading(false);
  };

  // Handler for withdraw
  const handleWithdraw = async () => {
    setLoading(true);
    try {
      if (data.irysUploader) {
        await withdrawAccount(data.irysUploader);
        setSnackbar({ open: true, message: "Withdrawn from Irys wallet!", severity: "success" });
        await refreshIrysBalance();
        await refreshWalletInfo();
      } else {
        setSnackbar({ open: true, message: "Irys uploader not connected.", severity: "error" });
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to withdraw from Irys: " + (e?.message || e), severity: "error" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1, fontSize: 30 }} />
        Connection Status
      </DialogTitle>

      <DialogContent>
        {/* Always show the same layout, just change values/colors */}
        <Typography variant="h6" sx={{ mb: 1 }}>Wallet Status</Typography>
        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography variant="body2" sx={{ color: isConnected ? 'green' : 'red', fontWeight: 600 }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Provider</Typography>
              <Typography variant="body2" sx={{ color: isConnected && providerName !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                {isConnected ? providerName : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Network</Typography>
              <Typography variant="body2" sx={{ color: isConnected && network !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                {isConnected ? network : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Balance</Typography>
              <Typography variant="body2" sx={{ color: isConnected && ethBalance !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                {isConnected ? ethBalance : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>Irys Status</Typography>
        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography variant="body2" sx={{ color: isConnected ? 'green' : 'red', fontWeight: 600 }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Balance</Typography>
              <Typography variant="body2" sx={{ color: isConnected && irysBalance !== 'N/A' ? 'green' : 'inherit', fontWeight: 600 }}>
                {isConnected ? irysBalance : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          {/* Fund and Withdraw Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleFund}
              disabled={loading || !isConnected}
              startIcon={loading && isConnected ? <CircularProgress size={16} /> : <PowerSettingsNewIcon />}
            >
              Fund 0.01 ETH to Irys wallet
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={handleWithdraw}
              disabled={loading || !isConnected}
              startIcon={loading && isConnected ? <CircularProgress size={16} /> : <PowerSettingsNewIcon />}
            >
              Withdraw from Irys wallet
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!isConnected && (
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
            disabled={loading}
            startIcon={<LinkOffIcon />}
          >
            {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Connect Wallet
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionPopup;