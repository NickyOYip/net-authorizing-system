import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Grid,
  CircularProgress
} from '@mui/material';

import { Link, useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import PublicIcon from '@mui/icons-material/Public';
import CampaignIcon from '@mui/icons-material/Campaign';
import LockIcon from '@mui/icons-material/Lock';
import DataObjectIcon from '@mui/icons-material/DataObject';

import { usePublicContract } from '../hooks/contractHook/usePublicContractHook';
import { usePrivateContract } from '../hooks/contractHook/usePrivateContractHook';
import { useBroadcastContract } from '../hooks/contractHook/useBroadcastContractHook';
import { usePublicSubContract } from '../hooks/contractHook/usePublicSubContractHook';
import { usePrivateSubContract } from '../hooks/contractHook/usePrivateSubContractHook';
import { useBroadcastSubContract } from '../hooks/contractHook/useBroadcastSubContractHook';
import { useEventHistory } from '../hooks/contractHook/helpers/useEventHistory';
import { ContractStatus, ContractType } from '../hooks/contractHook/types';
import { ethers } from 'ethers';

export default function ContractViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractType, setContractType] = useState<ContractType | null>(null);
  
  // Contract hooks
  const publicContract = usePublicContract();
  const privateContract = usePrivateContract();
  const broadcastContract = useBroadcastContract();
  const publicSubContract = usePublicSubContract();
  const privateSubContract = usePrivateSubContract();
  const broadcastSubContract = useBroadcastSubContract();
  const eventHistory = useEventHistory();

  // Contract state
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);

  // Detect contract type
  useEffect(() => {
    const detectContractType = async () => {
      if (!id) return;
      
      try {
        // Try each contract type until one works
        const contractTypes: [ContractType, any][] = [
          ['public', publicContract],
          ['private', privateContract],
          ['broadcast', broadcastContract]
        ];

        for (const [type, contract] of contractTypes) {
          try {
            await contract.getContractDetails(id);
            setContractType(type);
            return;
          } catch {
            continue;
          }
        }

        throw new Error('Unknown contract type');
      } catch (err) {
        console.error('Error detecting contract type:', err);
        setError(`Failed to detect contract type: ${(err as Error).message}`);
      }
    };

    detectContractType();
  }, [id]);

  // Load contract data
  useEffect(() => {
    let mounted = true;
    let abortController = new AbortController();

    const loadContractData = async () => {
      if (!id || !contractType) return;
      
      try {
        setLoading(true);
        setError(null);

        // Select appropriate contract hook
        const mainContract = {
          public: publicContract,
          private: privateContract,
          broadcast: broadcastContract
        }[contractType];

        const subContract = {
          public: publicSubContract,
          private: privateSubContract,
          broadcast: broadcastSubContract
        }[contractType];

        // Get main contract details
        const details = await mainContract.getContractDetails(id);
        console.log("Contract details:", details);

        if (!mounted) return;

        // Reset versions before loading new ones
        setVersions([]);
        
        if (details.totalVerNo > 0) {
          try {
            // Get all version addresses
            const versionAddresses = await mainContract.getAllVersions(id);
            console.log("Version addresses:", versionAddresses);
            
            if (!mounted) return;

            // Process all versions at once
            const versionDetailsPromises = versionAddresses.map(async (addr) => {
              try {
                const subDetails = await subContract.getSubContractDetails(addr);
                return {
                  version: Number(subDetails.version),
                  fileType: 'Contract Document',
                  status: subDetails.status === 0 ? 'Active' : 'Disabled',
                  size: 'N/A',
                  timestamp: new Date(Number(subDetails.deployTime) * 1000).toLocaleString(),
                  hash: subDetails.jsonHash || 'N/A',
                  storageLink: subDetails.storageLink || 
                             (subDetails.jsonLink && subDetails.softCopyLink ? 
                              `${subDetails.jsonLink},${subDetails.softCopyLink}` : ''),
                };
              } catch (subError) {
                console.error(`Error loading sub-contract ${addr}:`, subError);
                return null;
              }
            });

            const versionDetails = await Promise.all(versionDetailsPromises);
            
            if (mounted) {
              const validVersions = versionDetails.filter(v => v !== null);
              setVersions(validVersions.sort((a, b) => b.version - a.version));
              
              setContractDetails({
                id,
                title: details.title || 'Untitled',
                owner: details.owner || 'Unknown',
                recipient: details.user || 'None',
                status: 'Active',
                type: contractType,
                created: new Date(Number(validVersions[0]?.timestamp || Date.now())).toLocaleString(),
                currentVersion: Number(details.activeVer || 0),
                description: `${contractType.charAt(0).toUpperCase() + contractType.slice(1)} Contract Document`,
              });
            }
          } catch (versionsError) {
            console.error("Error loading versions:", versionsError);
            if (mounted) {
              setError("Failed to load contract versions");
            }
          }
        }

      } catch (err) {
        console.error('Error loading contract data:', err);
        if (mounted) {
          setError(`Failed to load contract: ${(err as Error).message}`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadContractData();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [id, contractType]);

  const handleDownloadJson = (jsonId: string) => {
    if (jsonId) {
      window.open(`https://gateway.irys.xyz/${jsonId}`, '_blank');
    }
  };

  const handleDownloadDoc = (documentId: string) => {
    if (documentId) {
      window.open(`https://gateway.irys.xyz/${documentId}`, '_blank');
    }
  };

  const getContractTypeIcon = () => {
    switch(contractDetails?.type) {
      case 'broadcast':
        return <CampaignIcon color="primary" sx={{ mr: 1 }} />;
      case 'public':
        return <PublicIcon color="primary" sx={{ mr: 1 }} />;
      case 'private':
        return <LockIcon color="primary" sx={{ mr: 1 }} />;
      default:
        return <DescriptionIcon color="primary" sx={{ mr: 1 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!contractDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Contract not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        RETURN TO CONTRACTS
      </Button>

      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Contract Details
      </Typography>

      {/* Contract Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getContractTypeIcon()}
          <DescriptionIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h6">{contractDetails.title}</Typography>
          <Chip 
            label={contractDetails.status} 
            color={contractDetails.status === 'Active' ? 'success' : 'warning'}
            sx={{ ml: 2 }}
          />
          <Chip 
            label={contractDetails.type.toUpperCase()} 
            color="info"
            sx={{ ml: 2 }}
          />
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {contractDetails.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Contract ID:</Typography>
            <Typography variant="body1">{contractDetails.id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Owner:</Typography>
            <Typography variant="body1">{contractDetails.owner}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Recipient:</Typography>
            <Typography variant="body1">{contractDetails.recipient}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Created Date:</Typography>
            <Typography variant="body1">{contractDetails.created}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Contract Type:</Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              {getContractTypeIcon()}
              {contractDetails.type.charAt(0).toUpperCase() + contractDetails.type.slice(1)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* File Versions Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h6">File Versions (Newest First)</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.version}>
                  <TableCell>
                    {version.version}
                    {version.version === contractDetails.currentVersion && (
                      <Chip label="Current" color="primary" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>{version.fileType}</TableCell>
                  <TableCell>{version.size}</TableCell>
                  <TableCell>{version.timestamp}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        color="primary"
                        onClick={() => {
                          const [jsonId] = version.storageLink.split(',');
                          handleDownloadJson(jsonId);
                        }}
                        title="Download JSON"
                      >
                        <DataObjectIcon />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        onClick={() => {
                          const [, documentId] = version.storageLink.split(',');
                          handleDownloadDoc(documentId);
                        }}
                        title="Download Document"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
