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
  Alert,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddIcon from '@mui/icons-material/Add'; // Added this import

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
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Public Contracts
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/public/create"
          startIcon={<AddIcon />} // Now this works
          sx={{ minWidth: 200 }}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contract ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Active Version</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.recipient}</TableCell>
                <TableCell>{contract.owner}</TableCell>
                <TableCell>{contract.created}</TableCell>
                <TableCell>
                  <Chip 
                    label={contract.status} 
                    color={contract.status === 'Active' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{contract.activeVersion}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/public/view/${contract.id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                    {contract.status === 'Pending Activation' && (
                      <Button
                        component={Link}
                        to={`/public/activate/${contract.id}`}
                        size="small"
                        color="secondary"
                        startIcon={<LockOpenIcon />}
                      >
                        Activate
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}