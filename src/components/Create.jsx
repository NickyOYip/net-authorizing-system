import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import StepContent from '@mui/material/StepContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';


export const CreateContract = ({ isOpen, onClose, contractType }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState('');
  const [error, setError] = useState(null);
  const [recipient, setRecipient] = useState('');

  const handleNext = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError("Please enter a contract title");
        return;
      }
      if (contractType != 'broadcast') {
        if (!recipient.trim() || !isValidEmail(recipient)) {
          setError("Please enter a valid recipient email");
          return;
        }
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

  // reset create 
  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  // Handle back step in form
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  //Handle Document Upload
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

  //Handle Json Upload
  const handleJsonChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedJson(file);
    setError(null);

    try {
      // Calculate hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setFileHash(hashHex);
    } catch (err) {
      console.error("Error calculating json hash:", err);
      setError("Failed to process the JSON file. Please try again.");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  //Handle recipient of private/public contracts 
  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleBackToList = () => {
    navigate('/broadcast');
  };

  const handleCreate = () => {
    setCreating(false);
  }

  //for non-broadcast contracts 
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  handleReset;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New {contractType} Contract
        </Typography>
      </Box>
      
      <Box style={{
        backgroundColor: "#404040",
        borderRadius: "5px",
        padding: "20px",
        width: "80vw",
        justifySelf: "center"
      }}>
        <Box sx={{ maxWidth: "80vw", mx: 'auto' }}>
          <div>
            {/*Title */}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

          </div>

          <Stepper activeStep={activeStep} orientation="vertical" sx={{ color: "white" }}>
            {/* Step 1: Contract Information */}
            <Step >
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

                  {contractType == 'private' || contractType == 'public' && (
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
                  )}

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
                    variant="contained"
                    onClick={onClose}
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
                  <Typography variant="body1" >
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

            {/** step 2.5 upload json file  */}
            <Step>
              <StepLabel>Metadata Upload</StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    Upload the metadata file of the contract.
                  </Typography>

                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="contained-button-file"
                    type="file"
                    onChange={handleJsonChange}
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

                  {selectedJson && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Selected File:</Typography>
                      <Typography variant="body2">{selectedJson.name}</Typography>
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
                <Card variant="outlined" sx={{ backgroundColor: "#404040 !important", borderColor: "#b3b3b3 !important" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contract Details
                    </Typography>

                    <Divider sx={{ mb: 2, }} />

                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {title}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {description || 'No description provided'}
                    </Typography>

                    {contractType != 'broadcast' && (
                      <>
                        <Typography variant="subtitle2" color="text.secondary">Recipient</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {recipient}
                        </Typography>
                      </>
                    )}

                    <Typography variant="subtitle2" color="text.secondary">Document</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedFile?.name}
                    </Typography>

                    <Typography variant="subtitle2" color="text.secondary">Metadata file</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedJson?.name}
                    </Typography>

                  </CardContent>
                </Card>
                {/** need to be changed for different types of contract */}
                <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                  Once created, this broadcast contract will be publicly accessible to everyone on the blockchain. The document itself will not be stored on the blockchain, only its cryptographic hash.
                </Alert>

                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    //idk how to handle
                    onClick={handleNext}
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
                      'Created Contract'
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

                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Contract Address:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {createdContractAddress}
                  </Typography>
                  {contractType == 'broadcast' && (
                    <Typography variant="body1" >
                      Your broadcast contract has been created and is now publicly verifiable.
                    </Typography>
                  )}
                  {contractType == 'public' && (
                    <Typography variant="body1" >
                      Your public contract has been created. Share the contract address with {recipient} to activate it.
                    </Typography>
                  )}
                  {contractType == 'private' && (
                    <Typography variant="body1" >
                      Your private contract has been created. Share the contract address, metadata and document file with {recipient} to activate it.
                    </Typography>
                  )}

                  <Box sx={{ mt: 3 }}>
                    {/*
                  <Button
                    variant="contained"
                    color="primary"
                    //onClick={handleViewContract}
                    sx={{ mr: 2 }}
                  >
                    View Contract
                  </Button>
                  */}
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                    >
                      Create another contract
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </Box>
    </>
  );
}

export default CreateContract;
