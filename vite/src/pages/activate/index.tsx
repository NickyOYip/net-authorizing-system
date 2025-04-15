import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { DataContext } from '../../provider/dataProvider';
import { WalletContext } from '../../provider/walletProvider';
import { usePublicContract, usePrivateContract } from '../../hooks/contractHook';

const steps = ['Verify Contract', 'Connect Wallet', 'Activate Contract'];

export default function ActivateContractPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useContext(DataContext);
  const { walletStatus, connectWallet } = useContext(WalletContext);
  const { getContractDetails: getPublicDetails, activateContract: activatePublicContract } = usePublicContract();
  const { getContractDetails: getPrivateDetails, activateContract: activatePrivateContract } = usePrivateContract();
  
  const [contractType, setContractType] = useState('');
  const [contractDetails, setContractDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [accessCode, setAccessCode] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);

  const isWalletConnected = walletStatus !== 'Not connected';

  // Determine contract type from URL path
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.includes('/public/activate')) {
      setContractType('public');
    } else if (path.includes('/private/activate')) {
      setContractType('private');
    } else {
      setError('Unknown contract type for activation');
    }
  }, []);

  // Load contract details
  useEffect(() => {
    const fetchContractDetails = async () => {
      if (!id || !contractType) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let details;
        
        // Get details based on contract type
        if (contractType === 'public') {
          details = await getPublicDetails(id);
        } else if (contractType === 'private') {
          details = await getPrivateDetails(id);
        } else {
          throw new Error(`Invalid contract type for activation: ${contractType}`);
        }
        
        if (details.user) {
          setError('This contract has already been activated');
        }
        
        setContractDetails({
          ...details,
          deployTime: details.deployTime ? new Date(Number(details.deployTime) * 1000).toLocaleString() : 'Unknown',
        });
        
        setLoading(false);
        if (isWalletConnected) {
          setActiveStep(1);
        }
      } catch (err) {
        console.error("Failed to load contract details:", err);
        setError(`Failed to load contract: ${err.message}`);
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [id, contractType, getPublicDetails, getPrivateDetails, isWalletConnected]);

  // Move to next step when wallet is connected
  useEffect(() => {
    if (isWalletConnected && activeStep === 0) {
      setActiveStep(1);
    }
  }, [isWalletConnected, activeStep]);

  const handleAccessCodeChange = (e) => {
    setAccessCode(e.target.value);
  };

  const handleActivateContract = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!id) {
      setError('Contract ID is missing');
      return;
    }

    try {
      setActivating(true);
      setError(null);
      
      let result;
      if (contractType === 'public') {
        result = await activatePublicContract(id);
      } else if (contractType === 'private') {
        // For private contracts, we need an access code/key
        if (!accessCode.trim()) {
          throw new Error('Access code is required for private contracts');
        }
        result = await activatePrivateContract(id, accessCode);
      }
      
      console.log('Contract activation result:', result);
      setActivationSuccess(true);
      setActiveStep(2);
      
      // Redirect after successful activation
      setTimeout(() => {
        navigate(`/${contractType}/${id}`);
      }, 3000);
    } catch (err) {
      console.error('Contract activation failed:', err);
      setError(`Failed to activate contract: ${err.message}`);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !activationSuccess) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Activate Contract
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => navigate(`/${contractType}`)}
          sx={{ mt: 2 }}
        >
          Return to Contracts
        </Button>
      </Box>
    );
  }

  if (!contractDetails) {
    return (
      <Alert severity="warning">
        Contract not found. This contract may not exist or you may not have permission to view it.
      </Alert>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Activate Contract
      </Typography>
      
      <Typography variant="body1" paragraph>
        {contractType === 'public' 
          ? 'Activate this contract to gain access to the document and verify its authenticity.' 
          : 'Activate this encrypted contract with your access key to view the secure document.'}
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connect Your Wallet
            </Typography>
            <Typography variant="body1" paragraph>
              To activate this contract, you need to connect your Ethereum wallet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={connectWallet}
              startIcon={<FingerprintIcon />}
            >
              Connect Wallet
            </Button>
          </Box>
        )}
        
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contract Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {contractDetails.title || 'Untitled Contract'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                  <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    {contractDetails.owner || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {contractDetails.deployTime}
                  </Typography>
                  
                  {contractType === 'private' && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Access Code</Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        placeholder="Enter your access code"
                        value={accessCode}
                        onChange={handleAccessCodeChange}
                        helperText="This code was provided by the contract creator"
                        type="password"
                        size="small"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ready to Activate
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1" paragraph>
                    By activating this contract, you will:
                  </Typography>
                  <ul>
                    <li>
                      <Typography variant="body2" gutterBottom>
                        Gain access to the document associated with this contract
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" gutterBottom>
                        Register your wallet address as an authorized user
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" gutterBottom>
                        Be able to verify the document authenticity at any time
                      </Typography>
                    </li>
                  </ul>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleActivateContract}
                      startIcon={<LockOpenIcon />}
                      disabled={contractType === 'private' && !accessCode.trim()}
                      fullWidth
                    >
                      {activating ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Activating...
                        </>
                      ) : (
                        'Activate Contract'
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Contract Activated Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              You now have access to the document. You will be redirected to the contract details page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/${contractType}/${id}`)}
            >
              View Contract Details
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
}