import * as React from 'react';
import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { useBroadcastFactory } from '../../hooks/contractHook';

export default function CreateBroadcastPage() {
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { createBroadcastContract } = useBroadcastFactory();
  
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState('');
  const [error, setError] = useState(null);

  const isWalletConnected = walletStatus !== 'Not connected';

  // Handle file selection and hash calculation
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
    } catch (err) {
      console.error("Error calculating file hash:", err);
      setError("Failed to process the file. Please try again.");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle next step in form
  const handleNext = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError("Please enter a contract title");
        return;
      }
    } else if (activeStep === 1) {
      if (!selectedFile || !fileHash) {
        setError("Please select a file to verify");
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  // Handle back step in form
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  // Handle contract creation
  const handleCreateContract = useCallback(async () => {
    if (!isWalletConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!title.trim() || !fileHash) {
      setError("Contract title and document are required");
      return;
    }

    if (!data.broadcastFactory?.address) {
      setError("Factory contract address not found");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Call the hook to create a new broadcast contract
      const result = await createBroadcastContract(
        data.broadcastFactory.address,
        title,
        description,
        fileHash
      );
      
      console.log("Contract created:", result);
      setCreatedContractAddress(result.contractAddress);
      setActiveStep(3); // Move to success step
      
      // Optional: Upload the file to Irys storage
      // This would require additional implementation using the irys uploader from context
      
    } catch (err) {
      console.error("Contract creation failed:", err);
      setError(`Failed to create contract: ${err.message}`);
    } finally {
      setCreating(false);
    }
  }, [
    isWalletConnected, 
    title, 
    description, 
    fileHash, 
    data.broadcastFactory?.address, 
    createBroadcastContract
  ]);

  // Redirect to the new contract after creation
  const handleViewContract = () => {
    navigate(`/broadcast/${createdContractAddress}`);
  };

  // Navigate back to contracts list
  const handleBackToList = () => {
    navigate('/broadcast');
  };

  if (!isWalletConnected) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Broadcast Contract
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please connect your wallet to create a broadcast contract.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/broadcast')}
          sx={{ mt: 2 }}
        >
          Back to Contracts
        </Button>
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Create Broadcast Contract
      </Typography>
      
      <Typography variant="body1" paragraph>
        Broadcast contracts are publicly visible to everyone. No activation is required for verification.
      </Typography>
      
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Contract Information */}
          <Step>
            <StepLabel>Contract Information</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Contract Title"
                    value={title}
                    onChange={handleTitleChange}
                    helperText="Enter a title for your contract"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={handleDescriptionChange}
                    multiline
                    rows={4}
                    helperText="Provide a description of this document (optional)"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mb: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Continue
                </Button>
                <Button
                  onClick={handleBackToList}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 2: Document Upload */}
          <Step>
            <StepLabel>Document Upload</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  Upload the document to be verified by the contract.
                </Typography>
                
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="contained-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="contained-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Select File
                  </Button>
                </label>
                
                {selectedFile && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected File:</Typography>
                    <Typography variant="body2">{selectedFile.name}</Typography>
                    <Typography variant="caption" component="div" sx={{ wordBreak: 'break-all' }}>
                      Hash: {fileHash ? `${fileHash.substring(0, 20)}...${fileHash.substring(fileHash.length - 10)}` : 'Calculating...'}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={!selectedFile || !fileHash}
                >
                  Continue
                </Button>
                <Button
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 3: Review & Create */}
          <Step>
            <StepLabel>Review & Create</StepLabel>
            <StepContent>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contract Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {title}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {description || 'No description provided'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Document</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedFile?.name}
                  </Typography>
                </CardContent>
              </Card>
              
              <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                Once created, this broadcast contract will be publicly accessible to everyone on the blockchain. The document itself will not be stored on the blockchain, only its cryptographic hash.
              </Alert>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCreateContract}
                  sx={{ mt: 1, mr: 1 }}
                  startIcon={<SendIcon />}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Creating...
                    </>
                  ) : (
                    'Create Contract'
                  )}
                </Button>
                <Button
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={creating}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 4: Success */}
          <Step>
            <StepLabel>Contract Created</StepLabel>
            <StepContent>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom color="success.main">
                  Contract Created Successfully!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your broadcast contract has been created and is now publicly verifiable.
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Contract Address:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                  {createdContractAddress}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleViewContract}
                    sx={{ mr: 2 }}
                  >
                    View Contract
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleBackToList}
                  >
                    Back to List
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    </div>
  );
}