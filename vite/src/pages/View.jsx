import React, { useState, useEffect, useContext } from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  TextField
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import KeyIcon from '@mui/icons-material/Key';

import { usePublicContract } from '../hooks/contractHook/usePublicContractHook';
import { usePrivateContract } from '../hooks/contractHook/usePrivateContractHook';
import { useBroadcastContract } from '../hooks/contractHook/useBroadcastContractHook';
import { usePublicSubContract } from '../hooks/contractHook/usePublicSubContractHook';
import { usePrivateSubContract } from '../hooks/contractHook/usePrivateSubContractHook';
import { useBroadcastSubContract } from '../hooks/contractHook/useBroadcastSubContractHook';
import { useEventHistory } from '../hooks/contractHook/helpers/useEventHistory';
import { ethers } from 'ethers';
import { DataContext } from '../provider/dataProvider';
import { useHomeService } from '../services/homeService';
import { downloadAndDecryptFile } from '../utils/encryptionUtils';

export default function ContractViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const homeService = useHomeService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractType, setContractType] = useState(null);
  
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
  const [versions, setVersions] = useState([]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied:', text);
      })
      .catch(err => console.error('Copy failed:', err));
  };

  // Add new state variables for decryption
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isDecryptionDialogOpen, setIsDecryptionDialogOpen] = useState(false);
  const [fileToDecrypt, setFileToDecrypt] = useState<{ id: string, type: 'json' | 'document', name: string } | null>(null);
  
  // Add a check for whether the current wallet is the contract user
  const [isUser, setIsUser] = useState(false);

  // Add a ref to track initial load
  const initialLoadRef = React.useRef(false);

  // Add state for storage link loading/validation
  const [storageLinksValid, setStorageLinksValid] = useState(true);
  const [storageLinksError, setStorageLinksError] = useState<string | null>(null);

  // Add state for private key input
  const [privateKey, setPrivateKey] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Detect contract type - modified to prevent looping
  useEffect(() => {
    const detectType = async () => {
      // Skip if we've already loaded or don't have necessary data
      if (!id || !data.ethProvider || initialLoadRef.current) return; 
      
      try {
        console.log('[View] 🔍 Starting contract type detection for:', id);
        setLoading(true);
        
        // Use only event-based detection
        const type = await homeService.getContractTypeFromAddress(id);
        console.log('[View] ✅ Contract type detected via events:', type);
        
        if (type) {
          setContractType(type);
          // Mark initial load complete to prevent future reruns
          initialLoadRef.current = true;
        } else {
          throw new Error('Unable to determine contract type');
        }
      } catch (err) {
        console.error('[View] ❌ Error detecting contract type:', err);
        setError(`Failed to detect contract type: ${(err).message}`);
        setLoading(false);
      }
      // Don't set loading to false here to allow the next useEffect to run with the contract type
    };

    detectType();
  }, [id, data.ethProvider]);  // Remove homeService from dependencies to prevent reruns

  // Load contract data - modified to improve storage link handling
  useEffect(() => {
    // Skip if we don't have the necessary information yet
    if (!id || !contractType) return;
    
    let mounted = true;
    let abortController = new AbortController();
    console.log('[View] 🔄 Loading contract data for type:', contractType);

    const loadContractData = async () => {
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
        console.log("[View] ✅ Contract details loaded:", details);

        if (!mounted) return;

        // Reset versions before loading new ones
        setVersions([]);
        
        if (details.totalVerNo > 0) {
          try {
            // Get all version addresses
            const versionAddresses = await mainContract.getAllVersions(id);
            console.log("[View] ✅ Version addresses loaded:", versionAddresses);
            
            if (!mounted) return;

            // Process all versions at once
            const versionDetailsPromises = versionAddresses.map(async (addr) => {
              try {
                const subDetails = await subContract.getSubContractDetails(addr);
                
                // Check if storage links are available for private contracts
                let storageLink = '';
                
                if (subDetails.storageLink) {
                  storageLink = subDetails.storageLink;
                  console.log(`[View] ✅ Found combined storage link for version ${subDetails.version}:`, 
                    storageLink.substring(0, 20) + '...');
                } else if (subDetails.jsonLink && subDetails.softCopyLink) {
                  storageLink = `${subDetails.jsonLink},${subDetails.softCopyLink}`;
                  console.log(`[View] ✅ Created storage link from separate links for version ${subDetails.version}`);
                } else if (contractType === 'private') {
                  console.warn(`[View] ⚠️ No storage links found for private contract version ${subDetails.version}`);
                }
                
                return {
                  version: Number(subDetails.version),
                  fileType: 'Contract Document',
                  status: subDetails.status === 0 ? 'Active' : 'Disabled',
                  size: 'N/A',
                  timestamp: new Date(Number(subDetails.deployTime) * 1000).toLocaleString(),
                  hash: subDetails.jsonHash || 'N/A',
                  storageLink,
                  hasValidLinks: !!storageLink && storageLink.includes(','),
                };
              } catch (subError) {
                console.error(`[View] ❌ Error loading sub-contract ${addr}:`, subError);
                return null;
              }
            });

            const versionDetails = await Promise.all(versionDetailsPromises);
            
            if (mounted) {
              const validVersions = versionDetails.filter(v => v !== null);
              setVersions(validVersions.sort((a, b) => b.version - a.version));
              
              // Check if any private contract versions are missing storage links
              if (contractType === 'private') {
                const linksValid = validVersions.every(v => v.hasValidLinks);
                setStorageLinksValid(linksValid);
                
                if (!linksValid) {
                  setStorageLinksError(
                    "Some contract versions are missing storage links. The contract may not have been fully activated."
                  );
                }
              }
              
              setContractDetails({
                id,
                title: details.title || 'Untitled',
                owner: details.owner || 'Unknown',
                recipient: details.user || 'None',
                status: 'Active',
                type: contractType,
                created: validVersions[0]?.timestamp || 'Not available',
                currentVersion: Number(details.activeVer || 0),
                description: `${contractType.charAt(0).toUpperCase() + contractType.slice(1)} Contract Document`,
              });
            }
          } catch (versionsError) {
            console.error("[View] ❌ Error loading versions:", versionsError);
            if (mounted) {
              setError("Failed to load contract versions");
            }
          }
        }

      } catch (err) {
        console.error('[View] ❌ Error loading contract data:', err);
        if (mounted) {
          setError(`Failed to load contract: ${(err).message}`);
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
  }, [id, contractType]); // Remove contract hooks from dependencies

  // Check if user - optimize to run only when contractDetails changes
  useEffect(() => {
    if (!contractDetails || !data.ethProvider) return;
    
    let mounted = true;
    
    const checkIfUser = async () => {
      try {
        const signer = await data.ethProvider.getSigner();
        const userAddress = await signer.getAddress();
        
        // Compare case-insensitive to handle potential formatting differences
        if (mounted) {
          const isCurrentUser = userAddress.toLowerCase() === contractDetails.recipient.toLowerCase();
          console.log('[View] 👤 User check:', isCurrentUser ? 'Is recipient' : 'Not recipient');
          setIsUser(isCurrentUser);
        }
      } catch (error) {
        console.error('[View] ❌ Error checking if user is recipient:', error);
        if (mounted) setIsUser(false);
      }
    };
    
    checkIfUser();
    
    return () => { mounted = false; };
  }, [contractDetails?.recipient, data.ethProvider]);

  const handleDownloadJson = (jsonId) => {
    if (jsonId) {
      window.open(`https://gateway.irys.xyz/${jsonId}`, '_blank');
    }
  };

  const handleDownloadDoc = (documentId) => {
    if (documentId) {
      window.open(`https://gateway.irys.xyz/${documentId}`, '_blank');
    }
  };

  // Add new function to handle private file decryption with better link validation
  const handleDecryptFile = async (fileId, fileType) => {
    if (!fileId) {
      setError(`No storage link found for the ${fileType} file. The contract might not be fully activated.`);
      return;
    }
    
    setFileToDecrypt({
      id: fileId,
      type: fileType,
      name: fileType === 'json' ? 'metadata.json' : 'document'
    });
    setIsDecryptionDialogOpen(true);
  };

  // Function to execute decryption
  const executeDecryption = async () => {
    if (!fileToDecrypt || !data.ethProvider) return;
    
    setIsDecrypting(true);
    setDecryptionError(null);
    
    try {
      const signer = await data.ethProvider.getSigner();
      const address = await signer.getAddress();
      
      // Use the entered private key if provided
      if (privateKey.trim()) {
        await downloadAndDecryptFile(
          fileToDecrypt.id, 
          address, 
          fileToDecrypt.type === 'json' ? 'metadata.json' : `document-${contractDetails.title}.pdf`,
          privateKey.trim()  // Pass the private key
        );
      } else {
        // Fall back to downloading encrypted file without decryption
        await downloadAndDecryptFile(
          fileToDecrypt.id, 
          address, 
          fileToDecrypt.type === 'json' ? 'metadata.json' : `document-${contractDetails.title}.pdf`
        );
      }
      
      setIsDecryptionDialogOpen(false);
      setFileToDecrypt(null);
      setPrivateKey(''); // Clear private key from memory
    } catch (error) {
      console.error('[View] Download/decrypt error:', error);
      setDecryptionError((error ).message);
    } finally {
      setIsDecrypting(false);
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

  // Add check for showing activation status
  const renderActivationStatus = () => {
    if (contractDetails?.type === 'broadcast') {
      return null;
    }

    const isWaitingForActivation = contractDetails?.recipient === '0x0000000000000000000000000000000000000000';
    const isActivated = contractDetails?.recipient && !isWaitingForActivation;

    return (
      <Chip 
        label={isWaitingForActivation ? 'Waiting for Activation' : isActivated ? 'Activated' : 'Not Activated'} 
        color={isActivated ? 'success' : 'warning'}
        sx={{ ml: 2 }}
      />
    );
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
            label={contractDetails.type.toUpperCase()} 
            color="info"
            sx={{ ml: 2 }}
          />
          {renderActivationStatus()}
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {contractDetails.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Contract ID:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">{contractDetails.id}</Typography>
              <IconButton size="small" onClick={() => handleCopy(contractDetails.id)} title="Copy Contract ID" sx={{ color: '#fff' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Owner:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">{contractDetails.owner}</Typography>
              <IconButton size="small" onClick={() => handleCopy(contractDetails.owner)} title="Copy Owner Address" sx={{ color: '#fff' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Recipient:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">{contractDetails.recipient}</Typography>
              <IconButton size="small" onClick={() => handleCopy(contractDetails.recipient)} title="Copy Recipient Address" sx={{ color: '#fff' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
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

      {/* Show storage link error if present */}
      {contractDetails?.type === 'private' && !storageLinksValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {storageLinksError}
        </Alert>
      )}

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
                <TableCell>Timestamp</TableCell>
                <TableCell>{contractDetails?.type !== 'private' || isUser ? 'Download' : 'Access'}</TableCell>
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
                  <TableCell>{version.timestamp}</TableCell>
                  <TableCell>
                    {contractDetails.type !== 'private' ? (
                      // Public or Broadcast contracts - show download buttons
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          color="primary"
                          onClick={() => {
                            const [jsonId] = version.storageLink.split(',');
                            handleDownloadJson(jsonId);
                          }}
                          title="Download JSON"
                          disabled={!version.storageLink}
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
                          disabled={!version.storageLink || !version.storageLink.includes(',')}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    ) : isUser ? (
                      // Private contract where wallet is the recipient - show decrypt options
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={version.hasValidLinks ? 
                                 "Decrypt & Download JSON Metadata" : 
                                 "Storage link not available"}>
                          <span>
                            <IconButton 
                              color="primary"
                              onClick={() => {
                                const [jsonId] = version.storageLink.split(',');
                                handleDecryptFile(jsonId, 'json');
                              }}
                              disabled={!version.hasValidLinks}
                            >
                              <DataObjectIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={version.hasValidLinks ? 
                                 "Decrypt & Download Document" : 
                                 "Storage link not available"}>
                          <span>
                            <IconButton 
                              color="primary"
                              onClick={() => {
                                const [, documentId] = version.storageLink.split(',');
                                handleDecryptFile(documentId, 'document');
                              }}
                              disabled={!version.hasValidLinks}
                            >
                              <LockOpenIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    ) : (
                      // Private contract where user is not recipient - show private message
                      <Chip 
                        icon={<LockIcon fontSize="small" />} 
                        label="Private Document" 
                        color="secondary"
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Decryption Dialog */}
      <Dialog 
        open={isDecryptionDialogOpen} 
        onClose={() => {
          if (!isDecrypting) {
            setIsDecryptionDialogOpen(false);
            setPrivateKey(''); // Clear private key when closing
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <KeyIcon sx={{ mr: 1 }} />
            Download Encrypted File
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            This file is encrypted and can only be decrypted with your private key.
          </Typography>
          
          {/* Private key input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              SECURITY WARNING: Enter your private key at your own risk. Never share it with anyone.
            </Typography>
            
            <TextField
              fullWidth
              label="Your Private Key (optional)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              type={showPrivateKey ? 'text' : 'password'}
              margin="normal"
              helperText="If provided, we'll attempt to decrypt the file. Otherwise, you'll get the encrypted file."
              InputProps={{
                endAdornment: (
                  <Button 
                    size="small" 
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? 'Hide' : 'Show'}
                  </Button>
                )
              }}
            />
            <Alert severity="warning" sx={{ mt: 1 }}>
              For maximum security, consider using a disconnected system to decrypt your files.
            </Alert>
          </Box>
          
          {fileToDecrypt && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
                File: {fileToDecrypt.type === 'json' ? 'JSON Metadata' : 'Document'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
                Storage ID: {fileToDecrypt.id.substring(0, 16)}...
              </Typography>
            </>
          )}
          
          {isDecrypting && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {privateKey ? 'Decrypting file...' : 'Downloading encrypted file...'}
              </Typography>
            </Box>
          )}
          
          {decryptionError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {decryptionError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDecryptionDialogOpen(false);
              setPrivateKey(''); // Clear private key when canceling
            }}
            disabled={isDecrypting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={executeDecryption} 
            disabled={isDecrypting}
            startIcon={privateKey ? <LockOpenIcon /> : <DownloadIcon />}
          >
            {privateKey ? 'Decrypt & Download' : 'Download Encrypted File'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
