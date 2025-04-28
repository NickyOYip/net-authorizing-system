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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function PublicActivate() {
  // Get contract ID from URL or set afte checked if contract address is valid
  const { id } = useParams();
  // type should get from contract address 
  const [contractType, setContractType] = useState('private');
  const [activeStep, setActiveStep] = useState(0);
  const [address, setAddress] = useState('');
  const [activationCode, setactivationCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedJson, setSelectedJson] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [jsonHash, setJsonHash] = useState('');
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activated, setActivated] = useState(null);
  const navigate = useNavigate();

  const steps = ['Contract Address', 'Activation Code'];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!address.trim()) {
        setError("Please enter a contract address");
        return;
      }
      if (!contractType.trim()) {
        setError("Please enter a valid contract address");
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
      console.log("FileHash: " + hashHex)
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
      console.log("JsonHash: " + hashHex)

      setJsonHash(hashHex);
    } catch (err) {
      console.error("Error calculating json hash:", err);
      setError("Failed to process the JSON file. Please try again.");
    }

  };
  //fake hash 
  const metaHash = "0510023a4953f2ee3f36a789812cd2b03cf01c241a24ff25fdfb7207584746e7";
  const docHash = "72d57b40b79b75a4dff4aa939098c42a6ded03d77bf21b11e3b0b03564008299";
  const activeCode = "8978398r7389";

  //activate logic
  const handleActivate = () => {
    if (address != id) {//id is from dashboard page ** if enter this page using sidebar, id is null
      setActivated(false);
      setErrorMessage("Invalid contract address.")
      return;
    }//id is from the url the contract address

    if (activationCode != activeCode) {
      setActivated(false);
      setErrorMessage("Invalid Activation Code.")
      return;
    }

    if (jsonHash != metaHash) {
      setActivated(false);
      setErrorMessage("Invalid METADATA File.")
      return;
    }

    if (fileHash != docHash) {
      setActivated(false);
      setErrorMessage("Invalid Document Soft Copy.")
      return;
    }
    setActivated(true);
    return;
  }

  const handleReset = () => {
    setActiveStep(0);
    setContractType('');
    setAddress('');
    setactivationCode('');
    setSelectedFile(null);
    setSelectedJson(null);
    setFileHash('');
    setJsonHash('');
    setError(null);
    setErrorMessage('');
    setActivated(null);
  };


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

      {activated == true && (
        <Alert severity="success" sx={{ mb: 2, backgroundColor: "#3cb043 !important" }}>
          Successfully activated
        </Alert>
      )}

      {activated == false && (
        <Alert severity="warning" sx={{ mb: 2, backgroundColor: "#900d09 !important" }}>
          Activation Failed. {errorMessage}
        </Alert>
      )}

      <Paper sx={{ background: "#242424",paddingTop:"30px"}}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
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
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ background: "#242424" }}>
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
                <Grid sx={{ paddingTop: "20px" }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" paragraph>
                      Upload the document of the corresponding contract.
                    </Typography>

                    <div className="row" style={{ display: "flex", alignItems: "center" }}>
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
                          sx={{ mb: 2, marginRight: "10px" }}
                        >
                          Select File
                        </Button>
                      </label>

                      {selectedFile && (
                        <Box sx={{ mt: 2, paddingBottom: "35px" }}>
                          <Typography variant="subtitle2">Selected File:</Typography>
                          <Typography variant="body2">{selectedFile.name}</Typography>
                        </Box>
                      )}
                    </div>

                    <Typography variant="body1" paragraph>
                      Upload the metadata file of the corresponding contract.
                    </Typography>

                    <div className="row" style={{ display: "flex", alignItems: "center" }}>
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
                          sx={{ mb: 2, marginRight: "10px" }}
                        >
                          Select metadata
                        </Button>
                      </label>

                      {selectedJson && (
                        <Box sx={{ mt: 2, paddingBottom: "35px" }}>
                          <Typography variant="subtitle2">Selected File:</Typography>
                          <Typography variant="body2">{selectedJson.name}</Typography>
                        </Box>
                      )}
                    </div>
                   
                  </Box>

                </Grid>
              </>
            )}
            <Box sx={{ width: "100%", webkitBoxPack: "", justifyContent: "space-between !important" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleActivate}
                style={{ mt: 3 }}
              >
                Activate Contract
              </Button>

              {activated == true ? (
                <Button
                  variant="outlined"
                  style={{ mb: 2, marginLeft: "30px" }}
                  onClick={handleReset}
                >
                  Activate another contract
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  style={{ mb: 2, marginLeft: "30px" }}
                  onClick={handleBack}
                >
                  Back to previous step
                </Button>
              )}
            </Box>
          </Box>
        )}

      </Paper>

      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2,mt:2}}
      >
        Back
      </Button>

    </Box>

  );
}
