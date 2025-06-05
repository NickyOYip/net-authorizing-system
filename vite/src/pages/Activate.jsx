import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
  Step,
  Stepper,
  StepLabel,
  Grid,
  TextField,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DataContext } from '../provider/dataProvider';
import { useActivateService } from '../services/activateService';

export default function Activate() {
  // Get contract ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const activateService = useActivateService();
  const isWalletConnected = !!data?.ethProvider;

  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [contractAddress, setContractAddress] = useState(id || '');
  const [contractType, setContractType] = useState(null);
  const [activationCode, setActivationCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [error, setError] = useState(null);
  const [isDetectingType, setIsDetectingType] = useState(false);

  // Activation state
  const [isActivating, setIsActivating] = useState(false);
  const [activationComplete, setActivationComplete] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activationTxHash, setActivationTxHash] = useState(null);
  const [activationProgress, setActivationProgress] = useState({
    verifying: null,
    activating: null,
    uploading: null,
    encrypting: null, // Add encryption progress state
    success: null
  });

  // Auto-detect contract type when address changes
  useEffect(() => {
    const detectType = async () => {
      // Only run detection if address is valid and no detection is currently in progress
      if (!contractAddress || contractAddress.length < 40 || isDetectingType) return;
      
      // Set detection flag
      setIsDetectingType(true);
      setError(null);
      
      try {
        console.log('[Activate] 🔍 Detecting contract type for:', contractAddress);
        const detectedType = await activateService.detectContractType(contractAddress);
        console.log(`[Activate] ✅ Contract type detected: ${detectedType}`);
        
        if (detectedType === 'broadcast') {
          setError("Broadcast contracts do not require activation.");
          setContractType(null);
        } else if (detectedType === 'unknown') {
          setError("This doesn't appear to be a valid contract. Please verify the address.");
          setContractType(null);
        } else {
          setContractType(detectedType);
        }
      } catch (err) {
        console.error('[Activate] ❌ Error detecting contract type:', err);
        setError(`Invalid contract address: ${err.message}`);
        setContractType(null);
      } finally {
        setIsDetectingType(false);
      }
    };
    
    detectType();
  }, [contractAddress, activateService]);

  // Steps configuration based on contract type
  const steps = contractType === 'private' 
    ? ['Contract Address', 'Activation Code', 'Document Files'] 
    : ['Contract Address', 'Activation Code'];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!contractAddress.trim()) {
        setError("Please enter a contract address");
        return;
      }
      
      // Block proceeding if contract type is unknown or null
      if (!contractType) {
        setError("Please enter a valid contract address");
        return;
      }
      
      if (contractType === 'unknown' || contractType === 'broadcast') {
        setError("This contract type cannot be activated");
        return;
      }
    } else if (activeStep === 1) {
      if (!activationCode.trim()) {
        setError("Activation code is required");
        return;
      }
    } else if (activeStep === 2 && contractType === 'private') {
      if (!selectedFile || !fileHash) {
        setError("Please select a document file");
        return;
      }
      if (!selectedJson || !jsonHash) {
        setError("Please select a metadata file");
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // Handle address input change
  const handleAddressChange = (e) => {
    setContractAddress(e.target.value);
    // Reset contract type when address changes
    if (contractType) {
      setContractType(null);
    }
  };

  // Handle activation code input change
  const handleActivationChange = (e) => {
    setActivationCode(e.target.value);
  };

  // Calculate file hash when document file selected
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[Activate] 📄 Document file selected:', { name: file.name, size: file.size });
    setSelectedFile(file);

    try {
      console.log('[Activate] 🔐 Calculating document hash...');
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[Activate] ✅ Document hash calculated:', { 
        hash: `${hashHex.substring(0, 10)}...${hashHex.substring(hashHex.length - 8)}`
      });
      setFileHash(hashHex);
      setError(null);
    } catch (err) {
      console.error("[Activate] ❌ Error calculating document hash:", err);
      setError("Failed to process the file. Please try again.");
    }
  };

  // Calculate file hash when metadata/json file selected
  const handleJsonChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[Activate] 📄 Metadata file selected:', { name: file.name, size: file.size });
    setSelectedJson(file);

    try {
      console.log('[Activate] 🔐 Calculating metadata hash...');
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[Activate] ✅ Metadata hash calculated:', { 
        hash: `${hashHex.substring(0, 10)}...${hashHex.substring(hashHex.length - 8)}`
      });
      setJsonHash(hashHex);
      setError(null);
    } catch (err) {
      console.error("[Activate] ❌ Error calculating metadata hash:", err);
      setError("Failed to process the metadata file. Please try again.");
    }
  };

  // Handle activation process
  const handleActivate = async () => {
    console.log('[Activate] ▶️ handleActivate() called');
    
    if (!isWalletConnected) {
      setError("Please connect your wallet to activate this contract.");
      return;
    }
    
    if (!contractType || !contractAddress || !activationCode) {
      setError("Missing required information for activation.");
      return;
    }
    
    if (contractType === 'private' && (!selectedFile || !selectedJson || !fileHash || !jsonHash)) {
      setError("Document files are required for private contract activation.");
      return;
    }
    
    setIsActivating(true);
    setError(null);
    setActivationError(null);
    
    try {
      console.log('[Activate] 🔄 Starting contract activation process');
      
      const result = await activateService.activateContract({
        contractAddress,
        activationCode,
        documentFile: selectedFile ?? undefined,
        jsonFile: selectedJson ?? undefined,
        documentHash: fileHash,
        jsonHash,
        progressCallback: setActivationProgress
      });
      
      console.log('[Activate] ✅ Activation result:', result);
      
      if (result.success) {
        setActivationSuccess(true);
        setActivationTxHash(result.txHash || null);
      } else {
        setActivationSuccess(false);
        setActivationError(result.errorMessage || "Activation failed without a specific error message.");
      }
      
      setActivationComplete(true);
    } catch (err) {
      console.error("[Activate] ❌ Activation error:", err);
      setActivationSuccess(false);
      setActivationError(err.message || "An unexpected error occurred during activation.");
      setActivationComplete(true);
    } finally {
      setIsActivating(false);
    }
  };

  // Reset the form to start over
  const handleReset = () => {
    setActiveStep(0);
    setContractType(null);
    setContractAddress('');
    setActivationCode('');
    setSelectedFile(null);
    setSelectedJson(null);
    setFileHash('');
    setJsonHash('');
    setError(null);
    setActivationComplete(false);
    setActivationSuccess(false);
    setActivationError(null);
    setActivationTxHash(null);
    setActivationProgress({
      verifying: null,
      activating: null,
      uploading: null,
      encrypting: null, // Add reset for encryption progress
      success: null
    });
  };

  // Copy text to clipboard helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
        alert("Copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text to clipboard:', err);
      });
  };

  // Get contract type label for display
  const getContractTypeLabel = () => {
    if (!contractType) return 'Unknown';
    return contractType === 'unknown' 
      ? 'Not a valid contract' 
      : contractType.charAt(0).toUpperCase() + contractType.slice(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Activate Contract
      </Typography>

      <Typography variant="body1" paragraph>
        {contractType === 'public' 
          ? 'Activate your public contract with the provided activation code.'
          : contractType === 'private' 
          ? 'Activate your private contract and upload your documents securely.'
          : 'Enter your contract details to begin the activation process.'}
      </Typography>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success/failure message */}
      {activationComplete && (
        <Alert severity={activationSuccess ? "success" : "error"} sx={{ mb: 3 }}>
          {activationSuccess 
            ? "Contract activated successfully!" 
            : `Activation failed: ${activationError}`}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4, background: "#242424" }}>
        {!activationComplete ? (
          <>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Contract Address */}
            {activeStep === 0 && (
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Contract Address"
                  value={contractAddress}
                  onChange={handleAddressChange}
                  helperText={
                    isDetectingType ? "Detecting contract type..." : 
                    contractType ? `Contract type detected: ${getContractTypeLabel()}` : 
                    "Enter the contract address to activate"
                  }
                  disabled={isDetectingType}
                  error={!contractType && contractAddress.length >= 40}
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={isDetectingType || !contractType || contractType === 'broadcast' || contractType === 'unknown'}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Activation Code */}
            {activeStep === 1 && (
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Activation Code"
                  value={activationCode}
                  onChange={handleActivationChange}
                  helperText="Enter the activation code provided by the contract owner"
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={contractType === 'private' ? handleNext : handleActivate}
                    disabled={!activationCode.trim()}
                  >
                    {contractType === 'private' ? 'Continue' : 'Activate Contract'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 3: Document Files (Private contracts only) */}
            {activeStep === 2 && contractType === 'private' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Upload the document files matching this contract
                </Typography>
                <Typography variant="body2" paragraph sx={{ color: '#aaa' }}>
                  Files will be encrypted and securely stored. The document hashes must match those recorded in the contract.
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Document File
                  </Typography>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="document-file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="document-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Select Document
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                      {selectedFile.name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Metadata File
                  </Typography>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="json-file-upload"
                    type="file"
                    onChange={handleJsonChange}
                  />
                  <label htmlFor="json-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Select Metadata
                    </Button>
                  </label>
                  {selectedJson && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                      {selectedJson.name}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleActivate}
                    disabled={!selectedFile || !selectedJson}
                    startIcon={<SendIcon />}
                  >
                    Activate Contract
                  </Button>
                </Box>
              </Box>
            )}

            {/* Activation Progress */}
            {isActivating && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Activation Progress
                </Typography>
                
                {activationProgress.verifying !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ minWidth: 150 }}>Verifying Files:</Typography>
                    {activationProgress.verifying === true ? (
                      <LinearProgress sx={{ flexGrow: 1 }} />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </Box>
                )}
                
                {activationProgress.activating !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ minWidth: 150 }}>Activating Contract:</Typography>
                    {activationProgress.activating === true ? (
                      <LinearProgress sx={{ flexGrow: 1 }} />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </Box>
                )}
                
                {/* Add encryption progress indicator */}
                {activationProgress.encrypting !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ minWidth: 150 }}>Encrypting Files:</Typography>
                    {activationProgress.encrypting === true ? (
                      <LinearProgress sx={{ flexGrow: 1 }} />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </Box>
                )}
                
                {activationProgress.uploading !== null && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ minWidth: 150 }}>Uploading Files:</Typography>
                    {activationProgress.uploading === true ? (
                      <LinearProgress sx={{ flexGrow: 1 }} />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </>
        ) : (
          /* Activation Complete */
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {activationSuccess ? (
              <>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom color="success.main">
                  Contract Activated Successfully
                </Typography>
                
                <Typography variant="body1" paragraph>
                  The contract has been successfully activated and is now ready to use.
                </Typography>
                
                {activationTxHash && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Transaction Hash:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mx: 1 }}>
                        {activationTxHash}
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={() => handleCopy(activationTxHash)}
                        sx={{ minWidth: 'auto' }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/contracts/${contractAddress}`)}
                  >
                    View Contract
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                  >
                    Activate Another Contract
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom color="error">
                  Activation Failed
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {activationError || "There was an error activating the contract."}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleReset}
                  >
                    Try Again
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>

      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, mt: 2 }}
      >
        Back
      </Button>
    </Box>
  );
}
