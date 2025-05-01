import React, { useContext } from 'react';
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

const ConnectionPopup = ({ open, onClose }) => {
  // Get wallet context with fallbacks for each value
  const walletContext = useContext(WalletContext);
  
  // Destructure with default values to prevent errors
  const { 
    connectWallet = async () => {}, 
    walletInfo = {
      isConnected: false,
      address: null,
      providerName: 'N/A',
      network: 'N/A',
      ethBalance: 'N/A'
    },
    irysBalance = 'N/A',
    loading = false, 
    snackbar = { open: false, message: '', severity: 'success' },
    closeSnackbar = () => {},
    fundAccount = async () => {},
    withdrawAccount = async () => {}
  } = walletContext || {};

  const { isConnected, address, providerName, network, ethBalance } = walletInfo;

  // Handler for fund
  const handleFund = async () => {
    await fundAccount("0.01");
  };

  // Handler for withdraw
  const handleWithdraw = async () => {
    await withdrawAccount();
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
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={closeSnackbar}
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