import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  Divider
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';

export default function PublicActivate() {
  const { id } = useParams(); // Get contract ID from URL

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Activate Contract
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load contract: Provider not available
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