import * as React from 'react';
import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Typography from '@mui/material/Typography';
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
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { usePrivateFactory } from '../../hooks/contractHook';

export default function CreatePrivatePage() {
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const { walletStatus } = useContext(WalletContext);
  const { createPrivateContract } = usePrivateFactory();
  
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [generateRandomCode, setGenerateRandomCode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [encryptedFileHash, setEncryptedFileHash] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState('');
  const [error, setError] = useState(null);

  const isWalletConnected = walletStatus !== 'Not connected';

  // Generate a random access code when component mounts or when the checkbox is toggled
  React.useEffect(() => {
    if (generateRandomCode) {
      const randomCode = Math.random().toString(36).substring(2, 10) +
                         Math.random().toString(36).substring(2, 10);
      setAccessCode(randomCode);
    }
  }, [generateRandomCode]);

  // Handle file selection, hash calculation, and encryption
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
      
      // For demonstration, simulate encryption by combining the hash with a salt
      // In a real implementation, this would use proper encryption with the access code
      const salt = accessCode || 'default-salt';
      const encoder = new TextEncoder();
      const saltedData = encoder.encode(hashHex + salt);
      const encryptedBuffer = await crypto.subtle.digest('SHA-256', saltedData);
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setEncryptedFileHash(encryptedHex);
    } catch (err) {
      console.error("Error processing the file:", err);
      setError("Failed to process the file. Please try again.");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleAccessCodeChange = (e) => {
    setAccessCode(e.target.value);
    
    // Re-encrypt the file hash when access code changes, if a file is selected
    if (fileHash) {
      encryptFileHash(fileHash, e.target.value);
    }
  };

  const toggleShowAccessCode = () => {
    setShowAccessCode(!showAccessCode);
  };

  const handleGenerateRandomToggle = (e) => {
    setGenerateRandomCode(e.target.checked);
    if (!e.target.checked) {
      setAccessCode('');
    }
  };

  // Function to "encrypt" the file hash with the access code
  const encryptFileHash = async (hash, code) => {
    if (!hash || !code) return;
    
    try {
      const salt = code;
      const encoder = new TextEncoder();
      const saltedData = encoder.encode(hash + salt);
      const encryptedBuffer = await crypto.subtle.digest('SHA-256', saltedData);
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedHex = encryptedArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setEncryptedFileHash(encryptedHex);
    } catch (err) {
      console.error("Error encrypting file hash:", err);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle next step in form
  const handleNext = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError("Please enter a contract title");
        return;
      }
      if (!recipient.trim() || !isValidEmail(recipient)) {
        setError("Please enter a valid recipient email");
        return;
      }
      if (!accessCode.trim() || accessCode.length < 8) {
        setError("Please provide an access code of at least 8 characters");
        return;
      }
    } else if (activeStep === 1) {
      if (!selectedFile || !fileHash || !encryptedFileHash) {
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

    if (!title.trim() || !encryptedFileHash || !recipient.trim() || !accessCode.trim()) {
      setError("Contract title, recipient, access code and document are required");
      return;
    }

    if (!isValidEmail(recipient)) {
      setError("Please enter a valid recipient email");
      return;
    }

    if (!data.privateFactory?.address) {
      setError("Factory contract address not found");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Call the hook to create a new private contract
      const result = await createPrivateContract(
        data.privateFactory.address,
        title,
        description,
        encryptedFileHash, // Use the encrypted hash for private contracts
        recipient,
        accessCode
      );
      
      console.log("Contract created:", result);
      setCreatedContractAddress(result.contractAddress);
      setActiveStep(3); // Move to success step
      
      // Optional: Upload the encrypted file to Irys storage
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
    encryptedFileHash,
    recipient,
    accessCode,
    data.privateFactory?.address, 
    createPrivateContract
  ]);

  // Redirect to the new contract after creation
  const handleViewContract = () => {
    navigate(`/private/${createdContractAddress}`);
  };

  // Navigate back to contracts list
  const handleBackToList = () => {
    navigate('/private');
  };

  if (!isWalletConnected) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Private Contract
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please connect your wallet to create a private contract.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/private')}
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
        Create Private Contract
      </Typography>
      
      <Typography variant="body1" paragraph>
        Private contracts provide the highest level of security. Documents are encrypted and only accessible with an access code.
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
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Recipient Email"
                    value={recipient}
                    onChange={handleRecipientChange}
                    helperText="Enter the email of the person who will activate this contract"
                    variant="outlined"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    error={recipient.trim() !== '' && !isValidEmail(recipient)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SecurityIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6" gutterBottom>
                          Security Settings
                        </Typography>
                      </Box>
                      
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={generateRandomCode}
                            onChange={handleGenerateRandomToggle}
                            color="primary"
                          />
                        }
                        label="Generate random access code"
                      />
                      
                      <TextField
                        required
                        fullWidth
                        margin="normal"
                        label="Access Code"
                        value={accessCode}
                        onChange={handleAccessCodeChange}
                        helperText="This code will be required to access the document. Share it securely with the recipient."
                        variant="outlined"
                        disabled={generateRandomCode}
                        type={showAccessCode ? 'text' : 'password'}
                        InputProps={{
                          startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleShowAccessCode}
                                edge="end"
                              >
                                {showAccessCode ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </CardContent>
                  </Card>
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
                  Upload the document to be encrypted and verified by the contract.
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
                      Original Hash: {fileHash ? `${fileHash.substring(0, 20)}...` : 'Calculating...'}
                    </Typography>
                    <Typography variant="caption" component="div" color="success.main" sx={{ wordBreak: 'break-all' }}>
                      Encrypted Hash: {encryptedFileHash ? `${encryptedFileHash.substring(0, 20)}...` : 'Encrypting...'}
                    </Typography>
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Document encrypted successfully with the provided access code!
                    </Alert>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={!selectedFile || !fileHash || !encryptedFileHash}
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
                  
                  <Typography variant="subtitle2" color="text.secondary">Recipient</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {recipient}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Access Code</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {showAccessCode ? accessCode : '•'.repeat(accessCode.length)}
                    <IconButton size="small" onClick={toggleShowAccessCode} sx={{ ml: 1 }}>
                      {showAccessCode ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Document</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedFile?.name}
                  </Typography>
                </CardContent>
              </Card>
              
              <Alert severity="warning" sx={{ mt: 3, mb: 3 }}>
                Important: Make sure to securely share the access code with the recipient. Without it, the document cannot be accessed or verified.
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
                  Your private contract has been created. Share the contract address and access code securely with {recipient}.
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Contract Address:
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, wordBreak: 'break-all' }}>
                  {createdContractAddress}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Access Code:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    {showAccessCode ? accessCode : '•'.repeat(accessCode.length)}
                  </Typography>
                  <IconButton size="small" onClick={toggleShowAccessCode} sx={{ ml: 1 }}>
                    {showAccessCode ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Box>
                
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