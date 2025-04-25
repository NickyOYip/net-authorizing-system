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

export default function BroadcastContracts() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Broadcast Contracts
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/broadcast/create"
          sx={{ minWidth: 200 }}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contract ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Active Version</TableCell>
              <TableCell>Total Version</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} align="center">
                Connect your wallet to view contracts.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}