import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';

export default function PublicView() {
  const { id } = useParams(); // Get contract ID from URL

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Typography variant="body1">Public Contracts</Typography>
        <Typography variant="body1">/</Typography>
        <Typography variant="body1" fontWeight="bold">View Contract</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Verification System
        </Typography>

        <Alert severity="info" sx={{ mt: 2 }}>
          Please connect your wallet to view contract details.
        </Alert>
      </Paper>

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