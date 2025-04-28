import React from 'react';
import '../styles/all.css';
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
  Alert,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddIcon from '@mui/icons-material/Add';
import ShowContracts from "../components/ShowContracts";
import { mockContracts } from '../mockHelpers';

export default function PublicContractsPage() {
  // Use mockContracts from helper
  const contracts = mockContracts;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Public Contracts
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/public/create"
          startIcon={<AddIcon />} // Now this works
          sx={{ minWidth: 200,background:"#1cc88a",color:"black"}}
        >
          Create New Contract
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Public contracts require activation by the recipient before they become accessible.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please connect your wallet to view and manage your public contracts.
      </Alert>

      <ShowContracts />
    </Box>
  );
}