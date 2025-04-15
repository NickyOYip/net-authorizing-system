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

const steps = ['Enter Contract Details', 'Upload Documents', 'Review & Submit'];

export default function CreateBroadcastPage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [jsonFile, setJsonFile] = React.useState<File | null>(null);
  const [softCopyFile, setSoftCopyFile] = React.useState<File | null>(null);
  const navigate = useNavigate();

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
    alert('Contract created successfully!');
    navigate('/broadcast');
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/broadcast"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Contracts
        </Button>
        <Typography variant="h4">
          Create New Broadcast Contract
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
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload the JSON metadata and soft copy files for this contract. These will be stored securely and hashed for verification.
                </Typography>
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
                    {jsonFile.name}
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
                    {softCopyFile.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
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
                  {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">JSON File:</Typography>
                <Typography variant="body1" gutterBottom>{jsonFile?.name || 'None'}</Typography>

                <Typography variant="subtitle1">Soft Copy File:</Typography>
                <Typography variant="body1" gutterBottom>{softCopyFile?.name || 'None'}</Typography>
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
                  (activeStep === 0 && (!title || !startDate || !endDate)) ||
                  (activeStep === 1 && (!jsonFile || !softCopyFile))
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
                Submit Contract
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </div>
  );
}