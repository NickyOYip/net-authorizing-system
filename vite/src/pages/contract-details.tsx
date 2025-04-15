import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataContext } from '../provider/dataProvider';
import { WalletContext } from '../provider/walletProvider';
import { 
  useBroadcastContract, 
  usePublicContract, 
  usePrivateContract 
} from '../hooks/contractHook';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ContractDetailsPage() {
  const { id } = useParams();
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { getContractDetails: getBroadcastDetails, getAllVersions: getAllBroadcastVersions } = useBroadcastContract();
  const { getContractDetails: getPublicDetails, getAllVersions: getAllPublicVersions } = usePublicContract();
  const { getContractDetails: getPrivateDetails, getAllVersions: getAllPrivateVersions } = usePrivateContract();

  const [contractType, setContractType] = useState('');
  const [contractDetails, setContractDetails] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  const isWalletConnected = walletStatus !== 'Not connected';

  // Determine contract type from URL path
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.includes('/broadcast/')) {
      setContractType('broadcast');
    } else if (path.includes('/public/')) {
      setContractType('public');
    } else if (path.includes('/private/')) {
      setContractType('private');
    } else {
      setError('Unknown contract type');
    }
  }, []);

  // Load contract details
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!id || !contractType || !isWalletConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let details;
        let versionList;
        
        // Get details based on contract type
        switch (contractType) {
          case 'broadcast':
            details = await getBroadcastDetails(id);
            versionList = await getAllBroadcastVersions(id);
            break;
          case 'public':
            details = await getPublicDetails(id);
            versionList = await getAllPublicVersions(id);
            break;
          case 'private':
            details = await getPrivateDetails(id);
            versionList = await getAllPrivateVersions(id);
            break;
          default:
            throw new Error(`Invalid contract type: ${contractType}`);
        }
        
        // Format the version data
        const formattedVersions = versionList.map((version, index) => ({
          versionNumber: index + 1,
          address: version,
          timestamp: new Date().toISOString(), // Will be replaced with actual timestamp from blockchain
          active: details.activeVer && details.activeVer.toString() === (index + 1).toString()
        }));
        
        setContractDetails({
          ...details,
          deployTime: details.deployTime ? new Date(Number(details.deployTime) * 1000).toLocaleString() : 'Unknown',
          type: contractType
        });
        setVersions(formattedVersions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load contract details:", err);
        setError(`Failed to load contract: ${err.message}`);
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [id, contractType, isWalletConnected, getBroadcastDetails, getPublicDetails, getPrivateDetails, getAllBroadcastVersions, getAllPublicVersions, getAllPrivateVersions]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getContractTypeColor = () => {
    switch (contractType) {
      case 'broadcast':
        return 'primary';
      case 'public':
        return 'secondary';
      case 'private':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!isWalletConnected) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Please connect your wallet to view contract details.
      </Alert>
    );
  }

  if (!contractDetails) {
    return (
      <Alert severity="warning">
        Contract details not found. This contract may not exist or you may not have permission to view it.
      </Alert>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            {contractDetails.title || 'Untitled Contract'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={contractType.charAt(0).toUpperCase() + contractType.slice(1)} 
              color={getContractTypeColor()} 
              size="small" 
            />
            
            {contractType === 'public' && (
              <Chip 
                label={contractDetails.user ? 'Active' : 'Pending Activation'} 
                color={contractDetails.user ? 'success' : 'warning'} 
                size="small" 
              />
            )}
            
            {contractType === 'private' && (
              <Chip 
                label="Encrypted" 
                variant="outlined" 
                color="success" 
                size="small" 
              />
            )}
          </Box>
        </div>
        
        {contractType !== 'broadcast' && !contractDetails.user && (
          <Button 
            variant="contained" 
            color="secondary"
          >
            Activate Contract
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="contract tabs">
            <Tab label="Contract Details" id="tab-0" aria-controls="tabpanel-0" icon={<DescriptionIcon />} iconPosition="start" />
            <Tab label="Version History" id="tab-1" aria-controls="tabpanel-1" icon={<HistoryIcon />} iconPosition="start" />
            {contractType !== 'private' && (
              <Tab label="Verification" id="tab-2" aria-controls="tabpanel-2" icon={<VerifiedUserIcon />} iconPosition="start" />
            )}
          </Tabs>
        </Box>

        {/* Contract Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contract Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">Contract Address</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {id}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(id)} sx={{ ml: 1 }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {copied && <Chip label="Copied!" size="small" color="success" variant="outlined" sx={{ ml: 1 }} />}
                  </Box>
                  
                  <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                  <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {contractDetails.owner || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {contractDetails.deployTime}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Current Version</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {contractDetails.activeVer?.toString() || '1'} of {contractDetails.totalVerNo?.toString() || '1'}
                  </Typography>
                  
                  {(contractType === 'public' || contractType === 'private') && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Recipient</Typography>
                      <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                        {contractDetails.user || 'Not activated yet'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Document Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {contractDetails.title || 'Untitled'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {contractDetails.description || 'No description provided'}
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    sx={{ mt: 2 }}
                  >
                    Download Document
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Versions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper variant="outlined">
            <List>
              {versions.map((version) => (
                <React.Fragment key={version.versionNumber}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                      >
                        Download
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            Version {version.versionNumber}
                          </Typography>
                          {version.active && <Chip label="Active" size="small" color="success" />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            Added: {version.timestamp}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span" sx={{ wordBreak: 'break-all' }}>
                            Address: {version.address}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {version.versionNumber < versions.length && <Divider component="li" />}
                </React.Fragment>
              ))}

              {versions.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No versions found"
                    secondary="This contract doesn't have any version history yet."
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </TabPanel>

        {/* Verification Tab */}
        {contractType !== 'private' && (
          <TabPanel value={tabValue} index={2}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VerifiedUserIcon color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">
                  Document Verification
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                To verify a document, upload it through the verification page and provide this contract's address.
              </Alert>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Contract Address:</Typography>
                <Typography variant="body1" sx={{ ml: 1, wordBreak: 'break-all' }}>
                  {id}
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(id)} sx={{ ml: 1 }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                color="warning"
                href="/verify"
              >
                Go to Verification Page
              </Button>
            </Paper>
          </TabPanel>
        )}
      </Paper>
    </div>
  );
}