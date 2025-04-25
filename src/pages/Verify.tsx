import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function VerifyDocument() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [contractType, setContractType] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState<null | {
    verified: boolean;
    message: string;
  }>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const steps = ['Select Document', 'Enter Contract Information', 'Verify Document'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
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
    setFileName('');
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
        Net Authorizing System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Verify Document
      </Typography>
      <Typography variant="body1" paragraph>
        Verify the authenticity of documents stored on the blockchain. Upload a document and provide the contract address to check if it matches the stored hash.
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

        {/* Step 1: Select Document */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
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
            
            {fileName && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {fileName}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveStep(1)}
                  sx={{ mt: 3 }}
                >
                  CONTINUE
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Step 2: Enter Contract Information */}
        {activeStep === 1 && (
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
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter the contract address (0x...)"
              helperText="Enter the blockchain address of the contract to verify against"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleReset}>
                START OVER
              </Button>
              <Button
                variant="contained"
                onClick={handleProceedToVerification}
                disabled={!contractType || !contractAddress}
              >
                PROCEED TO VERIFICATION
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Verify Document */}
        {activeStep === 2 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Information:
            </Typography>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2">
                <strong>File Name:</strong> {fileName || 'No file selected'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Contract Type:</strong> {contractType.toUpperCase() || 'Not selected'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Contract Address:</strong> {contractAddress || 'Not provided'}
              </Typography>
            </Paper>

            <Typography variant="h6" gutterBottom>
              Verification Status:
            </Typography>
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
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}