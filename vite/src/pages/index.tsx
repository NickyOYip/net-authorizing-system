import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BroadcastIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import PrivateIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { DataContext } from '../provider/dataProvider';
import { WalletContext } from '../provider/walletProvider';
import { 
  useMasterFactory, 
  useBroadcastFactory, 
  usePublicFactory, 
  usePrivateFactory 
} from '../hooks/contractHook';

export default function DashboardPage() {
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { getAllBroadcastContracts } = useBroadcastFactory();
  const { getAllPublicContracts } = usePublicFactory();
  const { getAllPrivateContracts } = usePrivateFactory();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractCounts, setContractCounts] = useState({
    broadcast: 0,
    public: 0,
    private: 0,
    total: 0
  });

  // Check if wallet is connected
  const isWalletConnected = walletStatus !== 'Not connected';

  // Fetch contract counts when wallet is connected
  useEffect(() => {
    const fetchContractCounts = async () => {
      if (!isWalletConnected || 
          !data.broadcastFactory?.address || 
          !data.publicFactory?.address || 
          !data.privateFactory?.address) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch all contract addresses for each type
        const broadcastAddresses = await getAllBroadcastContracts(data.broadcastFactory.address);
        const publicAddresses = await getAllPublicContracts(data.publicFactory.address);
        const privateAddresses = await getAllPrivateContracts(data.privateFactory.address);
        
        // Update the contract counts
        const counts = {
          broadcast: broadcastAddresses.length,
          public: publicAddresses.length,
          private: privateAddresses.length,
          total: broadcastAddresses.length + publicAddresses.length + privateAddresses.length
        };
        
        setContractCounts(counts);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch contract counts:", err);
        setError("Failed to fetch contract data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchContractCounts();
  }, [
    data.broadcastFactory?.address, 
    data.publicFactory?.address, 
    data.privateFactory?.address, 
    isWalletConnected, 
    getAllBroadcastContracts, 
    getAllPublicContracts, 
    getAllPrivateContracts
  ]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {!isWalletConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connect your wallet to view your contract dashboard.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Contract Type Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 180,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#f3f8ff',
              borderTop: '4px solid #1976d2',
            }}
          >
            <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, fontSize: 70 }}>
              <BroadcastIcon fontSize="inherit" color="primary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Broadcast Contracts
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" component="div" sx={{ my: 1, fontWeight: 'bold' }}>
                  {contractCounts.broadcast}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Public verification, no activation needed
                </Typography>
              </>
            )}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button
                component={Link}
                to="/broadcast"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 180,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#f7f7ff',
              borderTop: '4px solid #7B1FA2',
            }}
          >
            <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, fontSize: 70 }}>
              <PublicIcon fontSize="inherit" color="secondary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Public Contracts
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" component="div" sx={{ my: 1, fontWeight: 'bold' }}>
                  {contractCounts.public}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recipient-activated contracts
                </Typography>
              </>
            )}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button
                component={Link}
                to="/public"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 180,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#f3fff3',
              borderTop: '4px solid #2E7D32',
            }}
          >
            <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, fontSize: 70 }}>
              <PrivateIcon fontSize="inherit" color="success" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Private Contracts
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" component="div" sx={{ my: 1, fontWeight: 'bold' }}>
                  {contractCounts.private}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Encrypted, high-security contracts
                </Typography>
              </>
            )}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button
                component={Link}
                to="/private"
                color="success"
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 180,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#fff8f3',
              borderTop: '4px solid #ED6C02',
            }}
          >
            <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, fontSize: 70 }}>
              <VerifiedIcon fontSize="inherit" color="warning" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Total Documents
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" component="div" sx={{ my: 1, fontWeight: 'bold' }}>
                  {contractCounts.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified blockchain documents
                </Typography>
              </>
            )}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button
                component={Link}
                to="/verify"
                color="warning"
                endIcon={<ArrowForwardIcon />}
                size="small"
              >
                Verify Document
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  component={Link} 
                  to="/broadcast/create" 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<BroadcastIcon />}
                  fullWidth
                  sx={{ py: 1 }}
                  disabled={!isWalletConnected}
                >
                  New Broadcast Contract
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  component={Link} 
                  to="/public/create" 
                  variant="outlined" 
                  color="secondary" 
                  startIcon={<PublicIcon />}
                  fullWidth
                  sx={{ py: 1 }}
                  disabled={!isWalletConnected}
                >
                  New Public Contract
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  component={Link} 
                  to="/private/create" 
                  variant="outlined" 
                  color="success" 
                  startIcon={<PrivateIcon />}
                  fullWidth
                  sx={{ py: 1 }}
                  disabled={!isWalletConnected}
                >
                  New Private Contract
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  component={Link} 
                  to="/verify" 
                  variant="outlined" 
                  color="warning" 
                  startIcon={<VerifiedIcon />}
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Verify Document
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
