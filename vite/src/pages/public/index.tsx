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
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { usePublicFactory, usePublicContract } from '../../hooks/contractHook';

// We'll keep the mock data as fallback
const mockContracts = [
  {
    id: '0xabc',
    title: 'Employment Certificate',
    recipient: 'john.doe@example.com',
    owner: '0xabc...def',
    created: '2025-04-05',
    status: 'Pending Activation',
    activeVersion: '-',
  },
  {
    id: '0xdef',
    title: 'Course Completion Certificate',
    recipient: 'jane.smith@example.com',
    owner: '0xabc...def',
    created: '2025-04-08',
    status: 'Active',
    activeVersion: '1',
  },
  {
    id: '0xghi',
    title: 'Property Lease Document',
    recipient: 'tenant@example.com',
    owner: '0xabc...def',
    created: '2025-04-10',
    status: 'Pending Activation',
    activeVersion: '-',
  },
];

export default function PublicContractsPage() {
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { getAllPublicContracts } = usePublicFactory();
  const { getContractDetails, getCurrentVersion } = usePublicContract();
  
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if wallet is connected
  const isWalletConnected = walletStatus !== 'Not connected';
  
  // Fetch all public contracts when the component mounts
  useEffect(() => {
    const fetchContracts = async () => {
      if (!isWalletConnected || !data.publicFactory?.address) {
        setLoading(false);
        // If wallet is not connected, show mock data
        if (!isWalletConnected) {
          setContracts(mockContracts);
        }
        return;
      }
      
      try {
        setLoading(true);
        const factoryAddress = data.publicFactory.address;
        
        // Get all public contract addresses
        const contractAddresses = await getAllPublicContracts(factoryAddress);
        console.log("Retrieved public contract addresses:", contractAddresses);
        
        // Fetch details for each contract
        const contractsWithDetails = await Promise.all(contractAddresses.map(async (address) => {
          try {
            const details = await getContractDetails(address);
            const activeVersionAddr = await getCurrentVersion(address);
            
            return {
              id: address,
              title: details.title || 'Untitled Contract',
              owner: details.owner,
              recipient: details.user || 'Not activated',
              created: new Date(Number(details.deployTime) * 1000).toLocaleDateString(),
              status: details.user ? 'Active' : 'Pending Activation',
              activeVersion: details.user ? details.activeVer?.toString() : '-',
              totalVersions: details.totalVerNo?.toString() || '0',
              activeVersionAddr
            };
          } catch (err) {
            console.error(`Error fetching details for contract ${address}:`, err);
            return {
              id: address,
              title: 'Error fetching details',
              owner: 'Unknown',
              recipient: 'Unknown',
              created: 'Unknown',
              status: 'Error',
              activeVersion: 'Error'
            };
          }
        }));
        
        setContracts(contractsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch public contracts:", err);
        setError(`Failed to fetch contracts: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, [data.publicFactory?.address, getAllPublicContracts, getContractDetails, getCurrentVersion, isWalletConnected]);
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Public Contracts
        </Typography>
        <Button 
          component={Link} 
          to="/public/create" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          disabled={!isWalletConnected}
        >
          Create New Contract
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Public contracts require activation by the recipient before they become accessible.
      </Typography>
      
      {!isWalletConnected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please connect your wallet to view and manage your public contracts.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && isWalletConnected ? (
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
                <TableCell>Recipient</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Active Version</TableCell>
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
                    <TableCell>{contract.recipient}</TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contract.owner}
                    </TableCell>
                    <TableCell>{contract.created}</TableCell>
                    <TableCell>
                      <Chip 
                        label={contract.status} 
                        color={contract.status === 'Active' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{contract.activeVersion}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          component={Link}
                          to={`/public/${contract.id}`}
                          size="small"
                          startIcon={<VisibilityIcon />}
                        >
                          View
                        </Button>
                        {contract.status === 'Pending Activation' && (
                          <Button
                            component={Link}
                            to={`/public/activate/${contract.id}`}
                            size="small"
                            color="secondary"
                            startIcon={<LockOpenIcon />}
                          >
                            Activate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {isWalletConnected 
                      ? "No public contracts found. Create your first one!" 
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