import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Divider,
  Step,
  Stepper,
  StepContent,
  StepLabel,
  Grid,
  TextField,

} from '@mui/material';
import { Link, useParams } from 'react-router-dom';

export default function PublicActivate() {
  const { id } = useParams(); // Get contract ID from URL
  const [contractType, setContractType] = useState('public'); // should get from contract address 
  const [activeStep, setActiveStep] = useState(0);
  const [address, setAddress] = useState('');
  const [activationCode, setactivationCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [error, setError] = useState(null);
  const [activated, setActivated] = useState(false);

  const handleNext = () => {
    if (activeStep === 0) {
      if (!address.trim()) {
        setError("Please enter a contract address");
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

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleActivationChange = (e) => {
    setactivationCode(e.target.value);
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

  //activate logic
  const handleActivate = () => {
    
    setActivated(true);
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Activate Contract
      </Typography>
      {error && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Paper>
      )}

      {activated && (
        <Alert severity="success" sx={{ mb: 2, backgroundColor: "#3cb043 !important" }}>
          Successfully activated !
        </Alert>
      )}

      {/*{activated == true && ()}*/}

      <Stepper activeStep={activeStep} orientation="vertical" sx={{ background: "#404040", padding: "20px", borderRadius: "5px" }}>
        <Step> {/** input address  */}
          <StepLabel>Contract Address</StepLabel>

          <StepContent>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Contract Address"
                value={address}
                onChange={handleAddressChange}
                helperText="Enter address contract"
                variant="outlined"
              />
            </Grid>
            <Box sx={{ mb: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>

        <Step >{/** input code  */}
          <StepLabel>Activation Code </StepLabel>
          <StepContent>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Activation Code"
                value={activationCode}
                onChange={handleActivationChange}
                helperText="Enter activation code"
                variant="outlined"
              />
            </Grid>

            {contractType == 'private' && (
              <>
                <Divider />
                <Grid>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      Upload the document and metadata file of the corresponding contract.
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
                        sx={{ mb: 2 }}
                      >
                        Select metadata
                      </Button>
                    </label>

                    {selectedJson && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Selected File:</Typography>
                        <Typography variant="body2">{selectedJson.name}</Typography>
                      </Box>
                    )}

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
                        sx={{ mb: 2 }}
                      >
                        Select File
                      </Button>
                    </label>

                    {selectedFile && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Selected File:</Typography>
                        <Typography variant="body2">{selectedFile.name}</Typography>
                      </Box>
                    )}

                  </Box>

                </Grid>
              </>
            )}

            <Button
              //variant="contained"
              //component={Link}
              //to=""
              onClick={handleActivate}
              sx={{ mt: 2 }}
            >
              Activate Contract !
            </Button>

          </StepContent>
        </Step>


      </Stepper>




      <Button
        variant="contained"
        component={Link}
        to="/public"
        sx={{ mt: 2 }}
      >
        RETURN TO CONTRACTS
      </Button>
    </Box>

  );
}