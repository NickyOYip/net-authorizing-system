import React, { useContext, useState } from 'react';
import { WalletContext } from '../provider/walletProvider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const ConnectButton = () => {
  const { walletStatus, irysStatus, connectWallet } = useContext(WalletContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const isConnected = walletStatus.startsWith('Connected:');
  
  // Parse the wallet address from the status string if connected
  const walletAddress = isConnected 
    ? walletStatus.split('Connected: ')[1]?.split(',')[0] || ''
    : '';
    
  // Extract the network name if connected
  const networkName = isConnected && walletStatus.includes('Network:')
    ? walletStatus.split('Network: ')[1] || ''
    : '';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  console.log('ConnectButton rendering, wallet status:', walletStatus);

  // If not connected, show the connect button
  if (!isConnected) {
    return (
      <Button 
        variant="contained" 
        color="primary" 
        onClick={connectWallet}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ 
          fontWeight: 'bold', 
          padding: '8px 16px',
          zIndex: 9999,
          minWidth: '160px'
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  // If connected, show wallet info with dropdown
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 9999 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ 
          fontWeight: 'medium',
          padding: '6px 12px',
          minWidth: '140px'
        }}
      >
        {shortenAddress(walletAddress)}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '220px' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Connected Wallet
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2">
                {walletAddress}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy address"}>
                <IconButton size="small" onClick={handleCopyAddress} sx={{ ml: 1 }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Network
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {networkName || 'Unknown'}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Irys Status
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {irysStatus.startsWith('Connected') ? 'Connected' : 'Not Connected'}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleClose}>Disconnect</MenuItem>
      </Menu>
    </Box>
  );
};

export default ConnectButton;