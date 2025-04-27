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

//skip step 2 , merge with step 1 with private contract 
//add back to all steppers 

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
  const [error, setError] = useState(null);

  const steps = ['Enter Contract Information', 'Verify Document'];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!contractAddress.trim()) {
        setError("Please enter a contract address");
        return;
      }
      if (contractType == '') {
        setError("Enter a valid contract!");
        return;
      }
      if (contractType == 'private') {

        if (!selectedFile || !fileHash) {
          setError("Please select a file !");
          return;
        }

        if (!selectedJson || !jsonHash) {
          setError("Please select a metadata file !");
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
    setSelectedJson(null);
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

            <TextField
              fullWidth
              label="Contract Address"
              variant="outlined"
              color="primary"
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setContractType(e.target.value); //delete this line when can fetch the contract type
              }}
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
            {contractType == 'private' && (
              <>
                <Typography sx={{marginBottom:"10px"}}>
                  This is a Private Contract. Please provide us  with the following data for verification.
                </Typography>

                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="verify-document-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="verify-document-upload">s
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
                disabled={contractAddress == '' || contractType == ''}
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