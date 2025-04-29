import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ShowContracts from '../components/ShowContracts.jsx';
export default function BroadcastContracts() {
  return (
    <Box sx={{ p: 3 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Broadcast Contracts
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/broadcast/create"
          sx={{ minWidth: 200,background:"rgb(78, 115, 223)" ,color:"black"}}
        >
          Create New Contract
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Broadcast Contracts are publicly visible to everyone. No activation is required for verification.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please connect your wallet to view and manage your broadcast contracts.
      </Alert>

      <ShowContracts type = {'broadcast'}/>
    </Box>
  );
}