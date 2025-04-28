import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import StepContent from '@mui/material/StepContent';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import { CardContent, Paper } from '@mui/material';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import DownloadButton from './DownloadButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';


export const CreateContract = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState('');
  const [error, setError] = useState(null);
  const [type, setType] = useState('');
  //for contract creation step 4 

  const [progressStep, setProgressStep] = useState({

    estimating: null,
    uploading: null,
    creating: null,
    success: null,

  });

  const steps = ['Contract Information', 'Select Document', 'Review & Create', 'Contract Creation'];

  //:) add choose types of contracts to create form 
  //:) add step 2 and 3 to step 1
  //:)no description
  //:) add download file to check the file in step 4 
  //:)add tooltips to types of contract buttons
  // last step need add loading animation and file like the blockchain project 

  const handletypeSelect = (type) => {
    setType(type);
  }


  const handleNext = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError("Please enter a contract title");
        return;
      }
      if (type == '') {
        setError("Please choose contract type !");
        return;
      }
    } else if (activeStep === 1) {
      if (!selectedFile || !fileHash) {
        setError("Please select a file !");
        return;
      }
      if (!selectedJson || !jsonHash) {
        setError("Please select a metadata file !");
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  // reset create 
  const handleReset = () => {
    setActiveStep(0);
    setFileHash('');
    setJsonHash('');
    setSelectedFile(null);
    setSelectedJson(null);
    setTitle('');
    setCreating(false);
    setRecipient('');
    setError('');
    setType('');
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

      setJsonHash(hashHex);

    } catch (err) {
      console.error("Error calculating json hash:", err);
      setError("Failed to process the JSON file. Please try again.");
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };


  //Handle recipient of private/public contracts 
  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleCreate = () => {
    setCreating(false);
  }

  

  const handleSubmit = () => {
    try {
      setActiveStep((prevStep) => prevStep + 1);

      setProgressStep(prev => ({
        ...prev,
        estimating: true
      }));

      //some estimating logic ...
      setProgressStep(prev => ({
        ...prev,
        estimating: false, //false means done
        uploading: true
      }));

      //some uploading logic ...
      setProgressStep(prev => ({
        ...prev,
        uploading: false,
        creating: true
      }));

      //some creating logic ...
      setProgressStep(prev => ({
        ...prev,
        //creating: false,
        //success: true
      }));

      return;
    } catch (e) {
      setError(e);
      return;
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New {type} Contract
        </Typography>
      </Box>

      <Box style={{
        backgroundColor: "#242424",
        borderRadius: "5px",
        padding: "20px",
        
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
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Contract Information */}
          {activeStep === 0 && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Tooltip title="Public contracts that are visible to everyone. No activation required." placement='top'>
                    <Button
                      fullWidth
                      variant={type === 'broadcast' ? 'contained' : 'outlined'}
                      onClick={() => handletypeSelect('broadcast')}
                    >
                      BROADCAST CONTRACT
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title='Targeted to specific user with activation code required.' placement='top'>
                    <Button
                      fullWidth
                      variant={type === 'public' ? 'contained' : 'outlined'}
                      onClick={() => handletypeSelect('public')}
                    >
                      PUBLIC CONTRACT
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item xs={4}>
                  <Tooltip title='Private data with targeted user and encrypted storage.' placement='top'>
                    <Button
                      fullWidth
                      variant={type === 'private' ? 'contained' : 'outlined'}
                      onClick={() => handletypeSelect('private')}
                    >
                      PRIVATE CONTRACT
                    </Button>
                  </Tooltip>
                </Grid>
              </Grid>
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
                  variant="outlined"

                  sx={{ mt: 1, mr: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Document Upload */}

          {activeStep === 1 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
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

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph >
                  Upload the metadata file of the contract.
                </Typography>

                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="json"
                  type="file"
                  onChange={handleJsonChange}
                />

                <label htmlFor="json">
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
                  disabled={!selectedFile || !fileHash || !selectedJson || !jsonHash}
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
            </Box>
          )}

          {/* Step 3: Review & Create */}
          {activeStep === 2 && (
            <Box>
              <Card variant="outlined" sx={{ backgroundColor: "#404040 !important", borderColor: "#b3b3b3 !important" }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Contract Details
                  </Typography>

                  <Divider sx={{ mb: 2, }} />

                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {title}
                  </Typography>

                  {type != 'broadcast' && (
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
                  <Box>
                    <DownloadButton file={selectedFile} />
                    <DownloadButton file={selectedJson} />
                  </Box>

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
                  onClick={handleSubmit}
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
            </Box>
          )}

          {/* Step 4: Success */}
          {activeStep === 3 && (

            <Box>
              <Paper style={{ border: "solid 1px #1976d2", width: "500px", justifySelf: "center" }}>
                
                <div style={{
                  background: "#121212 !important",
                  borderRadius: "10px",
                  mb: 4,
                }} >
                  <Typography variant='h5' sx={{ margin: "10px" }}>
                    Creating Contract
                  </Typography>

                  {progressStep.estimating != null && (
                    progressStep.estimating == true ? (
                      <Typography color="#1976d2" variant="h6"
                        style={{
                          background: "#1976d250",
                          padding: '8px',
                          marginBottom: "10px", 
                          borderRadius: "10px"
                        }}>
                        1. Estimating <LinearProgress sx={{ height: "3px" }} />
                      </Typography>
                    ) : (
                      <Typography color="green" variant="h6"
                        style={{
                          background: "#2e7d3250",
                          paddingLeft: '10px', 
                          marginBottom: "10px", 
                          borderRadius: "10px"
                        }}>
                        1. Estimated
                      </Typography>)
                  )}

                  {progressStep.uploading != null && (
                    progressStep.uploading == true ? (
                      <Typography color="#1976d2" variant="h6"
                      style={{
                        background: "#1976d250",
                        padding: '8px',
                        marginBottom: "10px", 
                        borderRadius: "10px"
                      }}>
                        2. Uploading <LinearProgress sx={{ height: "3px" }} />
                      </Typography>
                    ) : (
                      <Typography color="green" variant="h6" 
                      style={{
                        background: "#2e7d3250",
                        paddingLeft: '10px', 
                        marginBottom: "10px", 
                        borderRadius: "10px"
                      }}>2. Uploaded
                      </Typography>)
                  )}

                  {progressStep.creating != null && (
                    progressStep.creating == true ? (
                      <Typography color="#1976d2" variant="h6"
                      style={{
                        background: "#1976d250",
                        padding: '8px',
                        marginBottom: "10px", 
                        borderRadius: "10px"
                      }}>
                        3. Creating <LinearProgress sx={{ height: "3px" }} />
                      </Typography>
                    ) : (
                      <Typography color="green" variant="h6" 
                      style={{
                        background: "#2e7d3250",
                        paddingLeft: '10px', 
                        marginBottom: "10px", 
                        borderRadius: "10px"
                      }}>
                      3. Created
                      </Typography>)
                  )}

                </div>
              </Paper>

              {/**  Successfully updated  */}
              {progressStep.success != null && progressStep.success == true && (

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
                  {type == 'broadcast' && (
                    <Typography variant="body1" >
                      Your broadcast contract has been created and is now publicly verifiable.
                    </Typography>
                  )}
                  {type == 'public' && (
                    <Typography variant="body1" >
                      Your public contract has been created. Share the contract address with {recipient} to activate it.
                    </Typography>
                  )}
                  {type == 'private' && (
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
                      onClick={handleReset}
                    >
                      Create another contract
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

          )}

        </Box >
      </Box >
    </>
  );
}

export default CreateContract;
