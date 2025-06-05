import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/all.css'
import {
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  TextField,
  Grid,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useVerifyService } from '../services/verifyService';

export default function VerifyDocument() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [contractType, setContractType] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const navigate = useNavigate();
  const verifyService = useVerifyService();

  const [verificationResult, setVerificationResult] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [isDetectingType, setIsDetectingType] = useState(false);

  const steps = ['Enter Contract Information', 'Verify Document'];

  // Auto-detect contract type when address changes - fixed infinite loop issue
  useEffect(() => {
    const detectType = async () => {
      // Only run detection if address is valid and no detection is currently in progress
      if (!contractAddress || contractAddress.length < 40 || isDetectingType) return;
      
      // Set detection flag
      setIsDetectingType(true);
      setError(null);
      
      try {
        // Check if we already have a type detected (avoid unnecessary API calls)
        if (contractType && contractAddress) return;
        
        const detectedType = await verifyService.detectContractType(contractAddress);
        console.log(`[Verify] Contract type detected: ${detectedType}`);
        
        if (detectedType === 'unknown') {
          setError("This address doesn't appear to be a valid contract. Please verify the address and try again.");
          setContractType(null);
        } else {
          setContractType(detectedType);
        }
      } catch (err) {
        console.error('[Verify] Error detecting contract type:', err);
        setError(`Invalid contract address: ${err.message}`);
        setContractType(null);
      } finally {
        setIsDetectingType(false);
      }
    };
    
    detectType();
  }, [contractAddress, verifyService.detectContractType]);  // Only depend on the specific method

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
      
      if (contractType === 'unknown') {
        setError("This doesn't appear to be a valid contract. Please verify the address.");
        return;
      }
      
      if (contractType === 'private') {
        if (!selectedFile || !fileHash) {
          setError("Please select a document file");
          return;
        }
        if (!selectedJson || !jsonHash) {
          setError("Please select a metadata file");
          return;
        }
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[Verify] 📄 File selected:', { name: file.name, size: file.size });
    setSelectedFile(file);

    try {
      console.log('[Verify] 🔐 Calculating file hash...');
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[Verify] ✅ File hash calculated:', { 
        hash: `${hashHex.substring(0, 10)}...${hashHex.substring(hashHex.length - 8)}`
      });
      setFileHash(hashHex);
    } catch (err) {
      console.error("[Verify] ❌ Error calculating file hash:", err);
    }
  };

  const handleJsonChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[Verify] 📄 JSON file selected:', { name: file.name, size: file.size });
    setSelectedJson(file);

    try {
      console.log('[Verify] 🔐 Calculating JSON hash...');
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      console.log('[Verify] ✅ JSON hash calculated:', { 
        hash: `${hashHex.substring(0, 10)}...${hashHex.substring(hashHex.length - 8)}`
      });
      setJsonHash(hashHex);
    } catch (err) {
      console.error("[Verify] ❌ Error calculating JSON hash:", err);
    }
  };

  const handleVerify = async () => {
    console.log('[Verify] ▶️ handleVerify() called');
    setIsVerifying(true);
    setError('');
    
    try {
      const params = {
        contractAddress,
        contractType,
        ...(contractType === 'private' && { fileHash, jsonHash })
      };
      
      console.log('[Verify] 📤 Verification parameters:', {
        contractAddress,
        contractType,
        fileHash: contractType === 'private' ? `${fileHash.substring(0, 10)}...${fileHash.substring(fileHash.length - 8)}` : 'N/A',
        jsonHash: contractType === 'private' ? `${jsonHash.substring(0, 10)}...${jsonHash.substring(jsonHash.length - 8)}` : 'N/A'
      });
      
      console.log('[Verify] 🔄 Calling verifyService.verifyDocument()...');
      const result = await verifyService.verifyDocument(params);
      console.log('[Verify] ✅ Verification complete, result:', {
        verified: result.verified,
        contractType: result.contractType,
        hasDetails: !!result.details
      });
      
      setVerificationResult(result);
    } catch (err) {
      console.error("[Verify] ❌ Verification error:", err);
      setVerificationResult({
        verified: false,
        message: `Verification failed: ${err.message}`,
      });
    } finally {
      console.log('[Verify] 🏁 Verification process finished');
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setSelectedJson(null);
    setContractType(null);
    setContractAddress('');
    setFileHash('');
    setJsonHash('');
    setVerificationResult(null);
    setError('');
  };

  const handleVerifyAnother = () => {
    handleReset();
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
        Verify Document
      </Typography>

      <Typography variant="body1" paragraph>
        Verify the authenticity of documents stored on the blockchain. Provide the contract address to check if it matches the stored hash.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Paper sx={{ p: 3, mb: 4 }}>
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

        {/* Step 1: Input contract address */}
        {activeStep === 0 && (
          <Box sx={{ py: 2 }}>
            <TextField
              fullWidth
              label="Contract Address*"
              variant="outlined"
              color="primary"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter the contract address (0x...)"
              helperText={
                isDetectingType ? "Detecting contract type..." : 
                contractType === 'unknown' ? "Not a valid contract" :
                contractType ? `Contract type detected: ${getContractTypeLabel()}` : 
                "Enter the contract address of the document to verify"
              }
              disabled={isDetectingType}
              error={contractType === 'unknown'}
              sx={{
                mb: 3, 
                color: "white !important", 
                '& .MuiOutlinedInput-root': {
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                }
              }}
            />
            
            {contractType === 'private' && (
              <>
                <Typography sx={{marginBottom:"10px"}}>
                  This is a Private Contract. Please provide the document files for verification.
                </Typography>

                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="verify-document-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="verify-document-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                    size="large"
                  >
                    SELECT DOCUMENT
                  </Button>
                </label>

                <input
                  id="jsonfile"
                  hidden
                  accept="*/*"
                  type="file"
                  onChange={handleJsonChange}
                />

                <label htmlFor="jsonfile">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, ml: "10px" }}
                    size="large"
                  >
                    SELECT METADATA FILE
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1, margin: "15px" }}>
                    Selected File: {selectedFile.name}
                  </Typography>
                )}
                {selectedJson && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1, margin: "15px" }}>
                      Selected Metadata File : {selectedJson.name}
                    </Typography>
                    <Button sx={{ mt: 1, margin: "15px" }} onClick={handleReset}>
                      START OVER
                    </Button>
                  </>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ mt: 3 }}
                disabled={isDetectingType || !contractType || contractType === 'unknown'}
              >
                CONTINUE
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Verify Document */}
        {activeStep === 1 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Information:
            </Typography>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              {contractType === 'private' && (
                <>
                  <Typography variant="body2">
                    <strong>File Name:</strong> {selectedFile.name || 'No file selected'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Metadata file Name:</strong> {selectedJson.name || 'No file selected'}
                  </Typography>
                </>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Contract Type:</strong> {getContractTypeLabel() || 'Not detected'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Contract Address:</strong> {contractAddress || 'Not provided'}
              </Typography>
            </Paper>
            <Paper sx={{
              p: 3,
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              bgcolor: verificationResult ?
                (verificationResult.verified ? '#e8f5e9' : '#ffebee') :
                '#ffffff'
            }}>
              {isVerifying ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography>Verifying document...</Typography>
                </>
              ) : verificationResult ? (
                <>
                  {verificationResult.verified ? (
                    <>
                      <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="h6" color="success.main" gutterBottom>
                        {verificationResult.message}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ErrorIcon color="error" sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="h6" color="error" gutterBottom>
                        {verificationResult.message}
                      </Typography>
                    </>
                  )}
                </>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VerifiedIcon />}
                  onClick={handleVerify}
                >
                  VERIFY NOW
                </Button>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleVerifyAnother}
                sx={{ mt: 2 }}
              >
                VERIFY ANOTHER DOCUMENT
              </Button>

              {verificationResult?.verified === true && (
                <Button
                  variant="outlined"
                  sx={{ mt: 2, ml: "10px" }}
                  onClick={() => navigate(`/contracts/${contractAddress}`)}
                >
                  View Contract Details
                </Button>
              )}
            </Box>
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