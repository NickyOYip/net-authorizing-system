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

export default function PublicContractsPage() {
  // Mock data - replace with your actual data
  const contracts = [
    {
      id: '0xabc',
      title: 'Employment Certificate',
      recipient: 'john.doe@example.com',
      owner: '0x123...def',
      created: '2025-04-05',
      status: 'Pending Activation',
      activeVersion: '-'
    },
    {
      id: '0xdef',
      title: 'Course Completion Certificate',
      recipient: 'jane.smith@example.com',
      owner: '0x123...def',
      created: '2025-04-08',
      status: 'Active',
      activeVersion: '1'
    },
    {
      id: '0xghi',
      title: 'Property Lease Document',
      recipient: 'tenant@example.com',
      owner: '0xabc...def',
      created: '2025-04-10',
      status: 'Pending Activation',
      activeVersion: '-'
    }
  ];

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