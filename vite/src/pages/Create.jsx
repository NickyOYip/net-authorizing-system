import React, { useState, useContext, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Card from '@mui/material/Card';
import { CardContent, Paper, IconButton } from '@mui/material';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import DownloadButton from '../components/DownloadButton';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import { DataContext } from '../provider/dataProvider';
import { createService } from '../services/createService';
import { 
  useBroadcastFactory, 
  usePublicFactory, 
  usePrivateFactory,
  useBroadcastContract, 
  usePublicContract, 
  usePrivateContract,
  useMasterFactory
} from '../hooks/contractHook';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const CreateContract = () => {
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState('');
  const [createdSubContractAddress, setCreatedSubContractAddress] = useState('');
  const [error, setError] = useState(null);
  const [type, setType] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [factoryAddresses, setFactoryAddresses] = useState({
    broadcastFactory: '',
    publicFactory: '',
    privateFactory: ''
  });
  const [factoriesLoaded, setFactoriesLoaded] = useState(false);

  // For contract creation progress
  const [progressStep, setProgressStep] = useState({
    estimating: null,
    uploading: null,
    creating: null,
    success: null,
  });

  // Hook instances for contract creation
  const broadcastFactoryHook = useBroadcastFactory();
  const publicFactoryHook = usePublicFactory();
  const privateFactoryHook = usePrivateFactory();
  const broadcastContractHook = useBroadcastContract();
  const publicContractHook = usePublicContract();
  const privateContractHook = usePrivateContract();
  
  // Get master factory hook
  const { getCurrentFactories, isLoading: loadingFactories } = useMasterFactory();

  // Use factory addresses from context if available, or fetch them if not
  useEffect(() => {
    const setupFactoryAddresses = async () => {
      console.log("Setting up factory addresses...");
      console.log("Data context:", data);
      
      // First check if factory addresses are available in the data context
      if (data && 
          data.broadcastFactory && 
          data.publicFactory && 
          data.privateFactory) {
        
        console.log("Using factory addresses from context.");
        setFactoryAddresses({
          broadcastFactory: data.broadcastFactory.address,
          publicFactory: data.publicFactory.address,
          privateFactory: data.privateFactory.address
        });
        
        setFactoriesLoaded(true);
        setError(null);
        return;
      } 
      
      // If not available in context, try to fetch them
      console.log("Factory addresses not found in context, fetching...");
      try {
        const addresses = await getCurrentFactories();
        console.log("Factory addresses fetched:", addresses);
        
        if (addresses && 
            addresses.broadcastFactory && 
            addresses.publicFactory && 
            addresses.privateFactory) {
          
          setFactoryAddresses({
            broadcastFactory: addresses.broadcastFactory,
            publicFactory: addresses.publicFactory,
            privateFactory: addresses.privateFactory
          });
          
          setFactoriesLoaded(true);
          setError(null);
        } else {
          console.warn("Some factory addresses are missing", addresses);
          setError("Some factory addresses are missing. Please check your wallet connection.");
        }
      } catch (err) {
        console.error("Failed to fetch factory addresses:", err);
        setError("Failed to fetch factory addresses. Please check your connection and try again.");
      }
    };

    setupFactoryAddresses();
  }, [data, getCurrentFactories]);

  // Add another effect to log data changes for debugging
  useEffect(() => {
    console.log("DataContext updated:", data);
    if (data && data.factoryAddress) {
      console.log("Master factory address available:", data.factoryAddress);
    }
  }, [data]);

  const steps = ['Contract Information', 'Select Document', 'Review & Create', 'Contract Creation'];

  const handletypeSelect = (type) => {
    setType(type);
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError("Please enter a contract title");
        return;
      }
      if (type === '') {
        setError("Please choose contract type!");
        return;
      }
      
      // Check for activation code if public or private contract
      if ((type === 'public' || type === 'private') && !activationCode.trim()) {
        setError("Please enter an activation code");
        return;
      }
    } else if (activeStep === 1) {
      if (!selectedFile || !fileHash) {
        setError("Please select a file!");
        return;
      }
      if (!selectedJson || !jsonHash) {
        setError("Please select a metadata file!");
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError(null);
  };

  // Reset create process
  const handleReset = () => {
    setActiveStep(0);
    setFileHash('');
    setJsonHash('');
    setSelectedFile(null);
    setSelectedJson(null);
    setTitle('');
    setCreating(false);
    setActivationCode('');
    setError('');
    setType('');
    setCreatedContractAddress('');
    setCreatedSubContractAddress('');
    setProgressStep({
      estimating: null,
      uploading: null,
      creating: null,
      success: null,
    });
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

  const handleActivationCodeChange = (e) => {
    setActivationCode(e.target.value);
  };

  // Function to generate a random activation code
  const generateActivationCode = () => {
    // Generate a random string of 8 characters (letters and numbers)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setActivationCode(result);
  };

  // Generate activation code when the type changes to public or private
  useEffect(() => {
    if (type === 'public' || type === 'private') {
      generateActivationCode();
    } else {
      setActivationCode('');
    }
  }, [type]);

  // Function to copy activation code to clipboard
  const copyActivationCode = () => {
    navigator.clipboard.writeText(activationCode);
    // Optional: add some visual feedback
    alert("Activation code copied to clipboard!");
  };

  const handleSubmit = async () => {
    try {
      // Move to the final step
      setActiveStep(3);
      setCreating(true);
      
      // First check if factories are loaded
      if (!factoriesLoaded) {
        // One last attempt to get factory addresses from context
        if (data && 
            data.broadcastFactory && 
            data.publicFactory && 
            data.privateFactory) {
              
          setFactoryAddresses({
            broadcastFactory: data.broadcastFactory.address,
            publicFactory: data.publicFactory.address,
            privateFactory: data.privateFactory.address
          });
          setFactoriesLoaded(true);
        } else {
          throw new Error('Factory addresses not loaded. Please check your wallet connection and try again.');
        }
      }
      
      // Get corresponding factory address based on contract type
      let factoryAddress = '';
      switch (type) {
        case 'broadcast':
          factoryAddress = factoryAddresses.broadcastFactory;
          break;
        case 'public':
          factoryAddress = factoryAddresses.publicFactory;
          break;
        case 'private':
          factoryAddress = factoryAddresses.privateFactory;
          break;
        default:
          throw new Error('Invalid contract type');
      }
      
      // Log the factory address for debugging
      console.log(`Using ${type} factory address:`, factoryAddress);
      
      if (!factoryAddress) {
        throw new Error(`Factory address for ${type} contract not available. Please check your wallet connection.`);
      }

      // Prepare contract helpers based on contract type
      let contractHelpers;
      
      if (type === 'broadcast') {
        contractHelpers = {
          createBroadcastContract: broadcastFactoryHook.createBroadcastContract,
          addNewBroadcastSubContract: broadcastContractHook.addNewBroadcastSubContract
        };
      } else if (type === 'public') {
        contractHelpers = {
          createPublicContract: publicFactoryHook.createPublicContract,
          addNewPublicSubContract: publicContractHook.addNewPublicSubContract
        };
      } else if (type === 'private') {
        contractHelpers = {
          createPrivateContract: privateFactoryHook.createPrivateContract,
          addNewPrivateSubContract: privateContractHook.addNewPrivateSubContract
        };
      }

      // Prepare common parameters
      const commonParams = {
        title,
        documentFile: selectedFile,
        jsonFile: selectedJson,
        factoryAddress,
        progressCallback: setProgressStep,
        contractHelpers, // Pass the contract helpers
        irysUploader: data.irysUploader // Pass the Irys instance from context
      };

      let result;
      
      // Call appropriate service method based on contract type
      if (type === 'broadcast') {
        result = await createService.createBroadcastContract(commonParams);
      } else if (type === 'public') {
        result = await createService.createPublicContract({
          ...commonParams,
          activationCode
        });
      } else if (type === 'private') {
        result = await createService.createPrivateContract({
          ...commonParams,
          activationCode
        });
      } else {
        throw new Error('Invalid contract type');
      }
      
      if (result.success) {
        // Log detailed information about the created contract
        console.log(`=== Contract Creation Successful ===`);
        console.log(`Contract Type: ${type}`);
        console.log(`Title: ${title}`);
        console.log(`Main Contract Address: ${result.contractAddress}`);
        console.log(`Sub-Contract Address: ${result.subContractAddress}`);
        console.log(`Transaction Hash: ${result.transactionHash}`);
        console.log(`View Contract URL: /contracts/${result.contractAddress}`);
        console.log(`===============================`);

        setCreatedContractAddress(result.contractAddress);
        setCreatedSubContractAddress(result.subContractAddress);
        setProgressStep(prev => ({...prev, success: true}));

        // Log available routes
        const viewRoute = `/contracts/${result.contractAddress}`;
        console.log(`To view this contract, navigate to: ${viewRoute}`);
        
        // Check if route exists (basic validation)
        if (!result.contractAddress || result.contractAddress === '0x0000000000000000000000000000000000000000') {
          console.warn("Warning: Contract address appears invalid. Route navigation may fail.");
        }
      } else {
        console.error("Contract creation failed:", result.errorMessage);
        setError(result.errorMessage || 'Contract creation failed');
        setProgressStep(prev => ({...prev, success: false}));
      }

      setCreating(false);
    } catch (e) {
      console.error('Contract creation error:', e);
      setError(e.message || 'An unexpected error occurred');
      setProgressStep({
        estimating: false,
        uploading: false,
        creating: false,
        success: false
      });
      setCreating(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New {type.charAt(0).toUpperCase() + type.slice(1)} Contract
        </Typography>
      </Box>

      <Box style={{
        backgroundColor: "#242424",
        borderRadius: "5px",
        padding: "20px",
        
      }}>
        <Box sx={{ maxWidth: "80vw", mx: 'auto' }}>
          <div>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {/* Show wallet status */}
            {!data?.ethProvider && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Please connect your wallet to continue.
              </Alert>
            )}
            {loadingFactories && !error && !factoriesLoaded && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Loading factory contracts...
              </Alert>
            )}
            {factoriesLoaded && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Factory contracts loaded successfully.
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

                {(type === 'public' || type === 'private') && (
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Activation Code"
                      value={activationCode}
                      onChange={handleActivationCodeChange}
                      helperText="This code will be needed to activate the contract"
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <>
                            <IconButton 
                              onClick={generateActivationCode}
                              size="small"
                              title="Generate new activation code"
                            >
                              <RefreshIcon />
                            </IconButton>
                            <IconButton 
                              onClick={copyActivationCode}
                              size="small"
                              title="Copy activation code"
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </>
                        ),
                      }}
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
                  variant="outlined"
                  onClick={() => navigate(-1)}
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
                      Hash: {jsonHash ? `${jsonHash.substring(0, 20)}...${jsonHash.substring(jsonHash.length - 10)}` : 'Calculating...'}
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

                  <Typography variant="subtitle2" color="text.secondary">Contract Type</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>

                  {(type === 'public' || type === 'private') && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Activation Code</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {activationCode ? '••••••••' : 'Not set'}
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

              {/* Contract type specific info */}
              {type === 'broadcast' && (
                <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                  This broadcast contract will be publicly accessible to everyone on the blockchain. 
                  The document itself will be stored on decentralized storage, with its hash recorded on the blockchain.
                </Alert>
              )}

              {type === 'public' && (
                <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                  This public contract requires activation with the code you provided. 
                  The document will be stored on decentralized storage, but only accessible after activation.
                </Alert>
              )}

              {type === 'private' && (
                <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                  This private contract requires activation with the code you provided. 
                  Only document hashes are stored on-chain. The actual files will need to be shared securely with the recipient.
                </Alert>
              )}

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ mt: 1, mr: 1 }}
                  startIcon={<SendIcon />}
                  disabled={creating || loadingFactories || !factoriesLoaded}
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

              {/* Add warning if factories not loaded */}
              {!factoriesLoaded && !loadingFactories && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Factory contracts not loaded. Please connect your wallet and refresh the page.
                </Alert>
              )}
            </Box>
          )}

          {/* Step 4: Contract Creation Progress/Success */}
          {activeStep === 3 && (
            <Box>
              <Paper style={{ border: "solid 1px #1976d2", maxWidth: "500px", margin: "0 auto" }}>
                <div style={{
                  background: "#121212 !important",
                  borderRadius: "10px",
                  padding: "20px"
                }}>
                  <Typography variant='h5' sx={{ marginBottom: "20px" }}>
                    Creating Contract
                  </Typography>

                  {progressStep.estimating !== null && (
                    progressStep.estimating === true ? (
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

                  {progressStep.uploading !== null && (
                    progressStep.uploading === true ? (
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
                        }}>
                        2. Uploaded
                      </Typography>)
                  )}

                  {progressStep.creating !== null && (
                    progressStep.creating === true ? (
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

              {/* Success message */}
              {progressStep.success === true && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="success.main">
                    Contract Created Successfully!
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Contract Address:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ mb: 2, wordBreak: 'break-all', fontFamily: 'monospace' }}
                    onClick={() => {
                      navigator.clipboard.writeText(createdContractAddress);
                      alert("Contract address copied to clipboard!");
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {createdContractAddress}
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sub-Contract Address:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ mb: 3, wordBreak: 'break-all', fontFamily: 'monospace' }}
                    onClick={() => {
                      navigator.clipboard.writeText(createdSubContractAddress);
                      alert("Sub-contract address copied to clipboard!");
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {createdSubContractAddress}
                  </Typography>

                  {type === 'broadcast' && (
                    <Typography variant="body1">
                      Your broadcast contract has been created and is now publicly verifiable.
                    </Typography>
                  )}
                  
                  {type === 'public' && (
                    <Typography variant="body1">
                      Your public contract has been created. Share the contract address and activation code 
                      (<span 
                        style={{ fontWeight: 'bold', cursor: 'pointer' }} 
                        onClick={() => {
                          navigator.clipboard.writeText(activationCode);
                          alert("Activation code copied to clipboard!");
                        }}
                      >{activationCode}</span>) 
                      with the recipient to activate it.
                    </Typography>
                  )}
                  
                  {type === 'private' && (
                    <Typography variant="body1">
                      Your private contract has been created. Share the contract address, activation code 
                      (<span 
                        style={{ fontWeight: 'bold', cursor: 'pointer' }} 
                        onClick={() => {
                          navigator.clipboard.writeText(activationCode);
                          alert("Activation code copied to clipboard!");
                        }}
                      >{activationCode}</span>), 
                      and files with the recipient to activate it.
                    </Typography>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        const route = `/contracts/${createdContractAddress}`;
                        console.log(`Navigating to: ${route}`);
                        navigate(route);
                      }}
                      sx={{ mr: 2 }}
                    >
                      View Contract
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                    >
                      Create another contract
                    </Button>
                  </Box>
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                    Click on addresses to copy them to clipboard
                  </Typography>
                </Box>
              )}

              {/* Error message */}
              {progressStep.success === false && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h5" gutterBottom color="error">
                    Contract Creation Failed
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {error || 'There was an error creating your contract. Please try again.'}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={handleReset}
                  >
                    Try Again
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default CreateContract;
