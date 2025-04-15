import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { useBroadcastFactory, useBroadcastContract } from '../../hooks/contractHook';

export default function BroadcastContractsPage() {
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { getAllBroadcastContracts } = useBroadcastFactory();
  const { getContractDetails, getCurrentVersion } = useBroadcastContract();
  
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractDetails, setContractDetails] = useState({});
  
  // Check if wallet is connected
  const isWalletConnected = walletStatus !== 'Not connected';
  
  // Fetch all broadcast contracts when the component mounts
  useEffect(() => {
    const fetchContracts = async () => {
      if (!isWalletConnected || !data.broadcastFactory?.address) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const factoryAddress = data.broadcastFactory.address;
        
        // Get all broadcast contract addresses
        const contractAddresses = await getAllBroadcastContracts(factoryAddress);
        console.log("Retrieved contract addresses:", contractAddresses);
        
        // Fetch details for each contract
        const contractsWithDetails = await Promise.all(contractAddresses.map(async (address) => {
          try {
            const details = await getContractDetails(address);
            const activeVersionAddr = await getCurrentVersion(address);
            
            return {
              id: address,
              title: details.title || 'Untitled Contract',
              owner: details.owner,
              created: new Date(Number(details.deployTime) * 1000).toLocaleDateString(),
              activeVersion: details.activeVer?.toString() || '0',
              totalVersions: details.totalVerNo?.toString() || '0',
              activeVersionAddr
            };
          } catch (err) {
            console.error(`Error fetching details for contract ${address}:`, err);
            return {
              id: address,
              title: 'Error fetching details',
              owner: 'Unknown',
              created: 'Unknown',
              activeVersion: 'Error',
              totalVersions: 'Error'
            };
          }
        }));
        
        setContracts(contractsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch broadcast contracts:", err);
        setError(`Failed to fetch contracts: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, [data.broadcastFactory?.address, getAllBroadcastContracts, getContractDetails, getCurrentVersion, isWalletConnected]);
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Broadcast Contracts
        </Typography>
        <Button 
          component={Link} 
          to="/broadcast/create" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          disabled={!isWalletConnected}
        >
          Create New Contract
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Broadcast contracts are publicly visible to everyone. No activation is required for verification.
      </Typography>
      
      {!isWalletConnected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect your wallet to view and manage your broadcast contracts.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Active Version</TableCell>
                <TableCell>Total Versions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.length > 0 ? (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contract.id}
                    </TableCell>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contract.owner}
                    </TableCell>
                    <TableCell>{contract.created}</TableCell>
                    <TableCell>{contract.activeVersion}</TableCell>
                    <TableCell>{contract.totalVersions}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/broadcast/${contract.id}`}
                        size="small"
                        startIcon={<VisibilityIcon />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {isWalletConnected 
                      ? "No broadcast contracts found. Create your first one!" 
                      : "Connect your wallet to view contracts."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}