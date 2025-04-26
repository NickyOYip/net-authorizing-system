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
  const { id } = useParams(); // Get contract ID from URL
  const [contractType, setContractType] = useState('private'); // should get from contract address 
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
      console.log("FileHash: "+hashHex)
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
      console.log("JsonHash: "+hashHex)

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
    if (address != id) {
      setActivated(false);
      setErrorMessage("Wrong contract address!")
      return;
    }//id is from the url the contract address

    if (activationCode != activeCode) {
      setActivated(false);
      setErrorMessage("Wrong Activation Code!")
      return;
    }

    if (jsonHash != metaHash) {
      setActivated(false);
      setErrorMessage("Wrong METADATA File!")
      return;
    }

    if (fileHash != docHash) {
      setActivated(false);
      setErrorMessage("Wrong Document Soft Copy!")
      return;
    }
    setActivated(true);
    return;
  }


  return (
    <Box sx={{ p: 3 }}>

      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        RETURN TO CONTRACTS
      </Button>

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
          Successfully activated !
        </Alert>
      )}

      {activated == false && (
        <Alert severity="warning" sx={{ mb: 2, backgroundColor: "#900d09 !important" }}>
          Activation failed ! {errorMessage}
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





    </Box>

  );
}