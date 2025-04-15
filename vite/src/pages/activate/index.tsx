import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { useParams, Link, useNavigate } from 'react-router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function ActivateContractPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activationCode, setActivationCode] = React.useState('');
  const [isActivating, setIsActivating] = React.useState(false);
  const [activationSuccess, setActivationSuccess] = React.useState(false);
  const [contractType, setContractType] = React.useState<'public' | 'private'>('public');
  const [error, setError] = React.useState<string | null>(null);

  // Determine contract type from URL path
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/public/')) {
      setContractType('public');
    } else if (path.includes('/private/')) {
      setContractType('private');
    }
  }, []);

  // For mock purposes - get contract details
  const contractData = {
    id: id || '0x123',
    title: contractType === 'public' ? 'Employment Certificate' : 'Medical Records Access',
    recipient: 'john.doe@example.com',
    created: '2025-04-05',
  };

  const handleActivationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivationCode(e.target.value);
    setError(null);
  };

  const handleActivate = () => {
    if (!activationCode) {
      setError('Please enter the activation code');
      return;
    }

    setIsActivating(true);
    setError(null);

    // Simulate API call for activation - in a real app this would call a blockchain transaction
    setTimeout(() => {
      if (activationCode === '12345' || activationCode === 'TEST123') {
        setActivationSuccess(true);
      } else {
        setError('Invalid activation code. Please check and try again.');
      }
      setIsActivating(false);
    }, 2000);
  };

  const goToContract = () => {
    navigate(`/${contractType}/${id}`);
  };

  const navigateBackUrl = `/${contractType}`;

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to={navigateBackUrl}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Contracts
        </Button>
        <Typography variant="h4">
          Activate Contract
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {!activationSuccess ? (
          <>
            <Typography variant="h5" gutterBottom>
              {contractData.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ID: {contractData.id}
            </Typography>

            <Alert severity={contractType === 'private' ? 'warning' : 'info'} sx={{ my: 3 }}>
              <AlertTitle>
                {contractType === 'private' 
                  ? 'This is a private contract requiring secure activation' 
                  : 'This contract requires activation'}
              </AlertTitle>
              Enter the activation code that was sent to {contractData.recipient} to activate this contract.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  required
                  fullWidth
                  id="activationCode"
                  label="Activation Code"
                  value={activationCode}
                  onChange={handleActivationCodeChange}
                  placeholder={contractType === 'private' ? "Enter your secure activation code" : "Enter activation code"}
                  error={!!error}
                  helperText={error || `The code was sent to ${contractData.recipient}`}
                  disabled={isActivating}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isActivating ? <CircularProgress size={20} /> : <LockOpenIcon />}
                  onClick={handleActivate}
                  disabled={isActivating}
                  fullWidth
                  size="large"
                >
                  {isActivating ? 'Activating...' : 'Activate Contract'}
                </Button>
              </Grid>
              {contractType === 'private' && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Need help? Contact support at support@netauthorizing.example
                  </Typography>
                </Grid>
              )}
            </Grid>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleOutlineIcon color="success" style={{ fontSize: 80 }} />
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
              Contract Activated Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              The {contractType} contract "{contractData.title}" has been successfully activated.
              You can now view and verify the contract.
            </Typography>

            <Card sx={{ mb: 3, mt: 4, maxWidth: 500, mx: 'auto' }}>
              <CardContent>
                <Typography variant="subtitle1">Contract ID:</Typography>
                <Typography variant="body1" gutterBottom>{contractData.id}</Typography>

                <Typography variant="subtitle1">Title:</Typography>
                <Typography variant="body1" gutterBottom>{contractData.title}</Typography>

                <Typography variant="subtitle1">Status:</Typography>
                <Typography variant="body1" color="success.main" fontWeight="bold">Active</Typography>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              color="primary"
              onClick={goToContract}
              size="large"
              sx={{ mt: 2 }}
            >
              View Contract Details
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
}