import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Link, useNavigate } from 'react-router';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SecurityIcon from '@mui/icons-material/Security';
import Chip from '@mui/material/Chip';

const steps = ['Enter Contract Details', 'Recipient Information', 'Security Settings', 'Upload Documents', 'Review & Submit'];

export default function CreatePrivatePage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [recipientEmail, setRecipientEmail] = React.useState('');
  const [recipientName, setRecipientName] = React.useState('');
  const [notificationType, setNotificationType] = React.useState('email');
  const [jsonFile, setJsonFile] = React.useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = React.useState<File | null>(null);
  const [activationCode, setActivationCode] = React.useState('');
  const [encryptionLevel, setEncryptionLevel] = React.useState<number>(2);
  const [requiresIdentityVerification, setRequiresIdentityVerification] = React.useState<boolean>(false);
  const [accessLimitCount, setAccessLimitCount] = React.useState<number>(5);
  const [enableExpiration, setEnableExpiration] = React.useState<boolean>(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (activeStep === 4) {
      // Generate a random activation code for demo purposes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setActivationCode(code);
    }
  }, [activeStep]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would handle the contract creation logic
    // For now we'll just navigate back to the contracts list
    alert('Private contract created successfully! The secure activation code has been sent to the recipient.');
    navigate('/private');
  };

  const encryptionLevelMarks = [
    {
      value: 1,
      label: 'Standard',
    },
    {
      value: 2,
      label: 'High',
    },
    {
      value: 3,
      label: 'Maximum',
    },
  ];

  const getEncryptionLevelLabel = (value: number) => {
    switch (value) {
      case 1:
        return 'Standard';
      case 2:
        return 'High';
      case 3:
        return 'Maximum';
      default:
        return '';
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/private"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Contracts
        </Button>
        <Typography variant="h4">
          Create New Private Contract
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Private contracts offer the highest level of security and are suitable for sensitive or confidential information.
                </Alert>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Contract Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  helperText="Enter a descriptive title for your contract"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    disabled={!enableExpiration}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={enableExpiration} 
                      onChange={(e) => setEnableExpiration(e.target.checked)} 
                    />
                  }
                  label="Enable expiration date"
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recipient Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The recipient will receive a secure activation code to access this private contract.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="recipientName"
                  label="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  id="recipientEmail"
                  label="Recipient Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="notification-type-label">Notification Method</InputLabel>
                  <Select
                    labelId="notification-type-label"
                    id="notification-type"
                    value={notificationType}
                    label="Notification Method"
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="both">Both Email & SMS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={requiresIdentityVerification} 
                      onChange={(e) => setRequiresIdentityVerification(e.target.checked)} 
                    />
                  }
                  label="Require identity verification"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  The recipient will need to verify their identity before accessing the contract
                </Typography>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure the security level for this private contract.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon color={encryptionLevel === 3 ? "error" : "primary"} sx={{ mr: 1 }} />
                  <Typography id="encryption-level-slider" gutterBottom>
                    Encryption Level
                  </Typography>
                </Box>
                <Slider
                  value={encryptionLevel}
                  onChange={(_, newValue) => setEncryptionLevel(newValue as number)}
                  aria-labelledby="encryption-level-slider"
                  step={1}
                  marks={encryptionLevelMarks}
                  min={1}
                  max={3}
                  sx={{ mb: 4 }}
                />
                <Alert severity={encryptionLevel === 3 ? "warning" : "info"}>
                  {encryptionLevel === 1 && "Standard encryption is suitable for most general documents."}
                  {encryptionLevel === 2 && "High encryption is recommended for sensitive business documents."}
                  {encryptionLevel === 3 && "Maximum encryption is designed for highly confidential information, but may impact performance."}
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Access Limit (Number of times the document can be accessed)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Slider
                    value={accessLimitCount}
                    onChange={(_, newValue) => setAccessLimitCount(newValue as number)}
                    aria-label="Access limit"
                    min={1}
                    max={20}
                    sx={{ mr: 2, width: '80%' }}
                  />
                  <Typography>
                    {accessLimitCount} {accessLimitCount === 1 ? 'time' : 'times'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload the JSON metadata and soft copy files for this contract. These will be stored securely, encrypted, and hashed for verification.
                </Typography>
                <Chip
                  icon={<SecurityIcon />}
                  label={`${getEncryptionLevelLabel(encryptionLevel)} Encryption`}
                  color={encryptionLevel === 3 ? "error" : "primary"}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ height: '100px' }}
                >
                  Upload JSON Metadata
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {jsonFile && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {jsonFile.name} (Will be encrypted)
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ height: '100px' }}
                >
                  Upload Soft Copy
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    hidden
                    onChange={(e) => setSoftCopyFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {softCopyFile && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {softCopyFile.name} (Will be encrypted)
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          {activeStep === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Review Contract Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Contract Title:</Typography>
                <Typography variant="body1" gutterBottom>{title}</Typography>

                <Typography variant="subtitle1">Duration:</Typography>
                <Typography variant="body1" gutterBottom>
                  {startDate?.toLocaleDateString()} - {enableExpiration ? endDate?.toLocaleDateString() : 'No expiration'}
                </Typography>

                <Typography variant="subtitle1">Recipient:</Typography>
                <Typography variant="body1" gutterBottom>
                  {recipientName} ({recipientEmail})
                </Typography>

                <Typography variant="subtitle1">Notification Method:</Typography>
                <Typography variant="body1" gutterBottom>
                  {notificationType === 'email' ? 'Email' : 
                   notificationType === 'sms' ? 'SMS' : 
                   'Both Email & SMS'}
                </Typography>

                <Typography variant="subtitle1">Identity Verification:</Typography>
                <Typography variant="body1" gutterBottom>
                  {requiresIdentityVerification ? 'Required' : 'Not Required'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Security Level:</Typography>
                <Chip 
                  icon={<SecurityIcon />} 
                  label={`${getEncryptionLevelLabel(encryptionLevel)} Encryption`}
                  color={encryptionLevel === 3 ? "error" : "primary"}
                  sx={{ mb: 1 }}
                />

                <Typography variant="subtitle1" sx={{ mt: 2 }}>Access Limit:</Typography>
                <Typography variant="body1" gutterBottom>
                  {accessLimitCount} {accessLimitCount === 1 ? 'time' : 'times'}
                </Typography>

                <Typography variant="subtitle1">JSON File:</Typography>
                <Typography variant="body1" gutterBottom>{jsonFile?.name || 'None'}</Typography>

                <Typography variant="subtitle1">Soft Copy File:</Typography>
                <Typography variant="body1" gutterBottom>{softCopyFile?.name || 'None'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                  A secure activation code will be sent to the recipient. They'll need this code to access the private contract.
                </Alert>
                
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    Secure Activation Code:
                  </Typography>
                  <Typography variant="h6" fontFamily="monospace" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {activationCode}
                  </Typography>
                  <IconButton 
                    onClick={() => navigator.clipboard.writeText(activationCode)}
                    title="Copy to clipboard"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!title || !startDate || (enableExpiration && !endDate))) ||
                  (activeStep === 1 && (!recipientName || !recipientEmail)) ||
                  (activeStep === 3 && (!jsonFile || !softCopyFile))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Create Contract
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </div>
  );
}