import * as React from 'react';
import { useState, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Divider from '@mui/material/Divider';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { 
  useBroadcastContract, 
  usePublicContract, 
  usePrivateContract 
} from '../../hooks/contractHook';

const steps = ['Select Document', 'Enter Contract Information', 'Verify Document'];

export default function VerifyDocumentPage() {
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { verifyDocument: verifyBroadcastDocument } = useBroadcastContract();
  const { verifyDocument: verifyPublicDocument } = usePublicContract();
  const { verifyDocument: verifyPrivateDocument } = usePrivateContract();
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [contractType, setContractType] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    try {
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setFileHash(hashHex);
      setActiveStep(1);
    } catch (err) {
      console.error("Error calculating file hash:", err);
      setError("Failed to process the file. Please try again.");
    }
  };

  // Handle contract type selection
  const handleContractTypeChange = (event) => {
    setContractType(event.target.value);
    setError(null);
  };

  // Handle contract address input
  const handleAddressChange = (event) => {
    setContractAddress(event.target.value);
    setError(null);
  };

  // Proceed to verification step
  const handleProceedToVerify = () => {
    if (!contractType) {
      setError("Please select a contract type.");
      return;
    }
    
    if (!contractAddress) {
      setError("Please enter a contract address.");
      return;
    }
    
    setActiveStep(2);
  };

  // Handle document verification
  const handleVerifyDocument = async () => {
    if (!contractAddress || !fileHash || !contractType) {
      setError("Missing required information for verification.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      let verifyResult;
      
      switch (contractType) {
        case 'broadcast':
          verifyResult = await verifyBroadcastDocument(contractAddress, fileHash);
          break;
        case 'public':
          verifyResult = await verifyPublicDocument(contractAddress, fileHash);
          break;
        case 'private':
          verifyResult = await verifyPrivateDocument(contractAddress, fileHash);
          break;
        default:
          throw new Error("Invalid contract type selected");
      }
      
      console.log("Verification result:", verifyResult);
      setVerificationResult({
        isVerified: verifyResult.verified,
        documentInfo: verifyResult.documentInfo || {},
        timestamp: verifyResult.timestamp ? new Date(Number(verifyResult.timestamp) * 1000).toLocaleString() : 'Unknown',
        version: verifyResult.version || 'Unknown'
      });
    } catch (err) {
      console.error("Document verification failed:", err);
      setError(`Verification failed: ${err.message}`);
      setVerificationResult(null);
    } finally {
      setVerifying(false);
    }
  };

  // Reset the verification process
  const handleReset = () => {
    setSelectedFile(null);
    setFileHash('');
    setContractType('');
    setContractAddress('');
    setActiveStep(0);
    setVerificationResult(null);
    setError(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Verify Document
      </Typography>
      
      <Typography variant="body1" paragraph>
        Verify the authenticity of documents stored on the blockchain. Upload a document and provide the contract address to check if it matches the stored hash.
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Step 1: Upload Document */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="contained-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Select Document to Verify
              </Button>
            </label>
            
            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>
        )}
        
        {/* Step 2: Contract Information */}
        {activeStep === 1 && (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Contract Type:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={contractType === 'broadcast' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setContractType('broadcast')}
                      sx={{ py: 1.5 }}
                    >
                      Broadcast Contract
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={contractType === 'public' ? 'contained' : 'outlined'}
                      color="secondary"
                      onClick={() => setContractType('public')}
                      sx={{ py: 1.5 }}
                    >
                      Public Contract
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={contractType === 'private' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => setContractType('private')}
                      sx={{ py: 1.5 }}
                    >
                      Private Contract
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contract Address"
                  variant="outlined"
                  value={contractAddress}
                  onChange={handleAddressChange}
                  placeholder="Enter the contract address (0x...)"
                  helperText="Enter the blockchain address of the contract to verify against"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProceedToVerify}
                  disabled={!contractAddress || !contractType}
                  startIcon={<SearchIcon />}
                >
                  Proceed to Verification
                </Button>
                <Button
                  sx={{ ml: 2 }}
                  onClick={handleReset}
                >
                  Start Over
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Step 3: Verification */}
        {activeStep === 2 && (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Document Information:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body2">
                    <strong>File Hash:</strong> {fileHash.substring(0, 20)}...{fileHash.substring(fileHash.length - 10)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Contract Type:</strong> {contractType.charAt(0).toUpperCase() + contractType.slice(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Contract Address:</strong> {contractAddress}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Verification Status:
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: verificationResult ? 
                      (verificationResult.isVerified ? '#e8f5e9' : '#ffebee') : 
                      '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '120px'
                  }}
                >
                  {verifying ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography>Verifying document...</Typography>
                    </Box>
                  ) : verificationResult ? (
                    <>
                      {verificationResult.isVerified ? (
                        <Box sx={{ textAlign: 'center' }}>
                          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                          <Typography variant="h6" color="success.main" gutterBottom>
                            Document Verified Successfully
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center' }}>
                          <VerifiedUserIcon color="error" sx={{ fontSize: 60, mb: 1 }} />
                          <Typography variant="h6" color="error" gutterBottom>
                            Document Verification Failed
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            The document does not match the recorded hash on the blockchain.
                          </Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVerifyDocument}
                      startIcon={<VerifiedUserIcon />}
                    >
                      Verify Now
                    </Button>
                  )}
                </Paper>
              </Grid>
              
              {verificationResult?.isVerified && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VerifiedUserIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Document Details
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Document Title:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.documentInfo.title || 'Untitled Document'}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Created By:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.documentInfo.owner || 'Unknown'}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Contract Version:
                        </Typography>
                        <Typography variant="body1">
                          {verificationResult.version}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Verification Timestamp:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.timestamp}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Description:
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {verificationResult.documentInfo.description || 'No description provided'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button onClick={handleReset}>
                  Verify Another Document
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </div>
  );
}