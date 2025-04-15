import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router';
import Box from '@mui/material/Box';

// Mock data for UI demonstration
const mockContracts = [
  {
    id: '0x123',
    title: 'Certificate of Completion',
    owner: '0xabc...def',
    created: '2025-04-10',
    activeVersion: '1',
    totalVersions: '1',
  },
  {
    id: '0x456',
    title: 'Software License Agreement',
    owner: '0xabc...def',
    created: '2025-04-12',
    activeVersion: '2',
    totalVersions: '2',
  },
  {
    id: '0x789',
    title: 'Warranty Document',
    owner: '0xabc...def',
    created: '2025-04-14',
    activeVersion: '1',
    totalVersions: '1',
  },
];

export default function BroadcastContractsPage() {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Broadcast Contracts
        </Typography>
        <Button 
          component={Link} 
          to="/broadcast/create" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Contract
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Broadcast contracts are publicly visible to everyone. No activation is required for verification.
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contract ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Active Version</TableCell>
              <TableCell>Total Versions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.owner}</TableCell>
                <TableCell>{contract.created}</TableCell>
                <TableCell>{contract.activeVersion}</TableCell>
                <TableCell>{contract.totalVersions}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/broadcast/${contract.id}`}
                    size="small"
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}