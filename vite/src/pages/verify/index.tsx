import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function VerifyDocumentPage() {
  const [contractId, setContractId] = React.useState<string>('');
  const [documentFile, setDocumentFile] = React.useState<File | null>(null);
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  const [verificationResult, setVerificationResult] = React.useState<'none' | 'success' | 'failure'>('none');
  const [contractDetails, setContractDetails] = React.useState<any>(null);

  const handleVerify = () => {
    if (!contractId || !documentFile) return;
    
    setIsVerifying(true);
    
    // Simulate verification process - in a real app this would call an API
    setTimeout(() => {
      setIsVerifying(false);
      
      // For demo purposes, we'll randomly show success or failure
      const isSuccess = Math.random() > 0.3;
      setVerificationResult(isSuccess ? 'success' : 'failure');
      
      if (isSuccess) {
        // Mock contract details for successful verification
        setContractDetails({
          id: contractId,
          title: 'Certificate of Achievement',
          issuer: 'Example University',
          issuedTo: 'John Doe',
          issuedOn: '2025-03-10',
          expiresOn: '2030-03-10',
          contractType: 'Public',
          verificationCount: 3,
          lastVerified: '2025-04-15'
        });
      } else {
        setContractDetails(null);
      }
    }, 2000);
  };

  const handleReset = () => {
    setContractId('');
    setDocumentFile(null);
    setVerificationResult('none');
    setContractDetails(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Verify Document
      </Typography>
      
      <Typography variant="body1" paragraph>
        Verify the authenticity of a document by providing its Contract ID and uploading the document file.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              id="contractId"
              label="Contract ID"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              placeholder="Enter the contract ID (0x...)"
              disabled={isVerifying || verificationResult !== 'none'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ height: '55px' }}
              disabled={isVerifying || verificationResult !== 'none'}
            >
              Upload Document
              <input
                type="file"
                accept="application/pdf,image/*,.json"
                hidden
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              />
            </Button>
            {documentFile && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                {documentFile.name}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleReset}
              disabled={isVerifying || (verificationResult === 'none' && !contractId && !documentFile)}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerify}
              disabled={!contractId || !documentFile || isVerifying || verificationResult !== 'none'}
            >
              {isVerifying ? <CircularProgress size={24} /> : 'Verify Document'}
            </Button>
          </Grid>
        </Grid>
        
        {verificationResult !== 'none' && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            
            {verificationResult === 'success' ? (
              <Stack spacing={3}>
                <Alert severity="success" icon={<VerifiedUserIcon />}>
                  <AlertTitle>Verification Successful</AlertTitle>
                  The document was successfully verified against the contract. It is authentic.
                </Alert>
                
                {contractDetails && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contract Details
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Contract ID:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.id}</Typography>
                          
                          <Typography variant="subtitle2">Title:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.title}</Typography>
                          
                          <Typography variant="subtitle2">Issuer:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.issuer}</Typography>
                          
                          <Typography variant="subtitle2">Issued To:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.issuedTo}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2">Issued On:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.issuedOn}</Typography>
                          
                          <Typography variant="subtitle2">Expires On:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.expiresOn}</Typography>
                          
                          <Typography variant="subtitle2">Contract Type:</Typography>
                          <Typography variant="body2" paragraph>{contractDetails.contractType}</Typography>
                          
                          <Typography variant="subtitle2">Verification Stats:</Typography>
                          <Typography variant="body2" paragraph>
                            Verified {contractDetails.verificationCount} times (Last: {contractDetails.lastVerified})
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            ) : (
              <Alert severity="error" icon={<ErrorOutlineIcon />}>
                <AlertTitle>Verification Failed</AlertTitle>
                The document could not be verified against the provided contract ID. This document may be altered or the contract ID may be incorrect.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </div>
  );
}