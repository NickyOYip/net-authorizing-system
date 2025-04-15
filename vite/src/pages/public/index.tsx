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
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Link } from 'react-router';
import Box from '@mui/material/Box';

// Mock data for UI demonstration
const mockContracts = [
  {
    id: '0xabc',
    title: 'Employment Certificate',
    recipient: 'john.doe@example.com',
    owner: '0xabc...def',
    created: '2025-04-05',
    status: 'Pending Activation',
    activeVersion: '-',
  },
  {
    id: '0xdef',
    title: 'Course Completion Certificate',
    recipient: 'jane.smith@example.com',
    owner: '0xabc...def',
    created: '2025-04-08',
    status: 'Active',
    activeVersion: '1',
  },
  {
    id: '0xghi',
    title: 'Property Lease Document',
    recipient: 'tenant@example.com',
    owner: '0xabc...def',
    created: '2025-04-10',
    status: 'Pending Activation',
    activeVersion: '-',
  },
];

export default function PublicContractsPage() {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Public Contracts
        </Typography>
        <Button 
          component={Link} 
          to="/public/create" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Contract
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Public contracts are targeted to specific recipients. They require activation using a code sent to the recipient.
      </Typography>
      
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
            {mockContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.recipient}</TableCell>
                <TableCell>{contract.owner}</TableCell>
                <TableCell>{contract.created}</TableCell>
                <TableCell>{contract.status}</TableCell>
                <TableCell>{contract.activeVersion}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/public/${contract.id}`}
                    size="small"
                    startIcon={<VisibilityIcon />}
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}