import React, { useContext, useState } from 'react';
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
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { WalletContext } from '../provider/walletProvider';

const ConnectionPopup = ({ open, onClose }) => {
  const { connectWallet, walletInfo, irysBalance, loading, error, fundIrys, withdrawIrys } = useContext(WalletContext);
  const [localLoading, setLocalLoading] = useState(false);

  const handleFund = async () => {
    try {
      setLocalLoading(true);
      await fundIrys("0.01");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setLocalLoading(true);
      await withdrawIrys();
    } finally {
      setLocalLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLocalLoading(true);
      await connectWallet();
    } finally {
      setLocalLoading(false);
    }
  };

  const isDisabled = loading || localLoading;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#242424',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1, fontSize: 30 }} />
        Connection Status
      </DialogTitle>

      <DialogContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Wallet Status</Typography>
        <Box sx={{ p: 2, border: '1px solid #444', borderRadius: 2, mb: 2, bgcolor: '#1a1a1a' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Typography variant="body2" sx={{ color: walletInfo.isConnected ? '#4caf50' : '#f44336', fontWeight: 600 }}>
                {walletInfo.isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Network</Typography>
              <Typography variant="body2" sx={{ color: walletInfo.network !== 'N/A' ? '#4caf50' : 'inherit' }}>
                {walletInfo.network}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {walletInfo.address || 'Not connected'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Hoodi Balance</Typography>
              <Typography variant="body2">
                {walletInfo.ethBalance}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Sepolia Balance</Typography>
              <Typography variant="body2">
                {walletInfo.sepoliaBalance}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" sx={{ mb: 1 }}>Irys Status</Typography>
        <Box sx={{ p: 2, border: '1px solid #444', borderRadius: 2, mb: 2, bgcolor: '#1a1a1a' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Balance</Typography>
              <Typography variant="body2">
                {irysBalance}
              </Typography>
            </Grid>
          </Grid>
          
          {walletInfo.isConnected && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleFund}
                disabled={isDisabled}
              >
                {isDisabled ? <CircularProgress size={20} /> : 'Fund 0.01 ETH'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleWithdraw}
                disabled={isDisabled}
              >
                {isDisabled ? <CircularProgress size={20} /> : 'Withdraw'}
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
        {!walletInfo.isConnected && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnect}
            disabled={isDisabled}
            startIcon={isDisabled ? <CircularProgress size={20} /> : <LinkOffIcon />}
          >
            Connect Wallet
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionPopup;