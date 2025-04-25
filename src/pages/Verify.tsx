import React, { useState } from 'react';
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

export default function VerifyDocument() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [contractType, setContractType] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<null | {
    verified: boolean;
    message: string;
  }>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Enter Contract Information', 'Select Document', 'Verify Document'];

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);


    try {
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setFileHash(hashHex);
    } catch (err) {
      console.error("Error calculating file hash:", err);

    }
  };

  const handleJsonChange = async (event) => {

    const file = event.target.files[0];
    if (!file) return;

    setSelectedJson(file);

    try {
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setJsonHash(hashHex);
    } catch (err) {
      console.error("Error calculating file hash:", err);

    }
  };



  const handleContractTypeSelect = (type: string) => {
    setContractType(type);
  };

  const handleProceedToVerification = () => {
    if (!contractType) {
      setError('Please select a contract type');
      return;
    }
    if (!contractAddress) {
      setError('Please enter a contract address');
      return;
    }
    setActiveStep(2);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setError('');

    // Simulate verification process
    setTimeout(() => {
      const isVerified = Math.random() > 0.5; // Random success/failure for demo
      setVerificationResult({
        verified: isVerified,
        message: isVerified
          ? 'Document verified successfully!'
          : 'Document verification failed'
      });
      setIsVerifying(false);
    }, 1500);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setContractType('');
    setContractAddress('');
    setVerificationResult(null);
    setError('');
  };

  const handleVerifyAnother = () => {
    handleReset();
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
            <Typography variant="h6" gutterBottom>
              Select Contract Type:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={contractType === 'broadcast' ? 'contained' : 'outlined'}
                  onClick={() => handleContractTypeSelect('broadcast')}
                >
                  BROADCAST CONTRACT
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={contractType === 'public' ? 'contained' : 'outlined'}
                  onClick={() => handleContractTypeSelect('public')}
                >
                  PUBLIC CONTRACT
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant={contractType === 'private' ? 'contained' : 'outlined'}
                  onClick={() => handleContractTypeSelect('private')}
                >
                  PRIVATE CONTRACT
                </Button>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Contract Address"
              variant="outlined"
              color="primary"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter the contract address (0x...)"
              helperText="Enter the contract address of the contract to verify"
              sx={{
                mb: 3, color: "white !important", '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                  },
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveStep(1)}
                sx={{ mt: 3 }}
                disabled={contractAddress == ''}
              >
                CONTINUE
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Enter Contract Information */}

        {activeStep === 1 && (

          <Box sx={{ textAlign: 'center', py: 3 }}>
            {contractType == 'private' && (
              <>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="verify-document-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="verify-document-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                    size="large"
                  >
                    SELECT DOCUMENT TO VERIFY
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

                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, ml: "10px" }}
                    size="large"
                  >
                    SELECT METADATA FILE TO VERIFY
                  </Button>
                </label>
                {selectedFile && (
                   <Typography variant="body2" sx={{ mt: 1, margin: "15px" }}>
                   Selected files: {selectedFile.name}
                 </Typography>
                )}
                {selectedJson && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1, margin: "15px" }}>
                      Selected file: {selectedJson.name}
                    </Typography>
                    <Button sx={{ mt: 1, margin: "15px" }} onClick={handleReset}>
                      START OVER
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleProceedToVerification}
                      disabled={!contractType || !contractAddress}
                    >
                      PROCEED TO VERIFICATION
                    </Button>

                  </>
                )}
              </>
            )}

            {contractType != 'private' && (
              <>
                <Typography variant="body1" sx={{ mt: 1, margin: "15px" }}>
                  Broadcast / Public contracts do not need to upload any document.
                </Typography>

                <Button sx={{ mt: 1, margin: "15px" }} onClick={handleReset}>
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={handleProceedToVerification}
                  disabled={!contractType || !contractAddress}
                >
                  PROCEED TO VERIFICATION
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Step 3: Verify Document */}
        {activeStep === 2 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Information:
            </Typography>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              {contractType == 'private' && (
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
                <strong>Contract Type:</strong> {contractType.toUpperCase() || 'Not selected'}
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

              {/** Verifiers can download through this button */}
              {verificationResult?.verified == true && (
                <Button
                  variant="outlined"
                  sx={{ mt: 2, ml: "10px" }}
                >
                  Click here to view the contract
                </Button>
              )}

            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}