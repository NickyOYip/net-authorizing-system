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
import SecurityIcon from '@mui/icons-material/Security';
import { Link } from 'react-router';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// Mock data for UI demonstration
const mockContracts = [
  {
    id: '0xjkl',
    title: 'Medical Records Access',
    recipient: 'dr.smith@hospital.example',
    owner: '0xabc...def',
    created: '2025-04-01',
    status: 'Pending Activation',
    encryptionLevel: 'High',
    activeVersion: '-',
  },
  {
    id: '0xmno',
    title: 'Financial Statement',
    recipient: 'accountant@finance.example',
    owner: '0xabc...def',
    created: '2025-04-03',
    status: 'Active',
    encryptionLevel: 'High',
    activeVersion: '1',
  },
  {
    id: '0xpqr',
    title: 'Legal Document',
    recipient: 'lawyer@legal.example',
    owner: '0xabc...def',
    created: '2025-04-07',
    status: 'Active',
    encryptionLevel: 'Maximum',
    activeVersion: '2',
  },
];

export default function PrivateContractsPage() {
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Private Contracts
        </Typography>
        <Button 
          component={Link} 
          to="/private/create" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Contract
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Private contracts contain sensitive data and are encrypted. They are targeted to specific recipients and require secure activation.
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
              <TableCell>Encryption</TableCell>
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
                <TableCell>
                  <Chip 
                    icon={<SecurityIcon />} 
                    label={contract.encryptionLevel} 
                    color={contract.encryptionLevel === 'Maximum' ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{contract.activeVersion}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/private/${contract.id}`}
                    size="small"
                    startIcon={<VisibilityIcon />}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  {contract.status === 'Pending Activation' && (
                    <Button
                      component={Link}
                      to={`/private/activate/${contract.id}`}
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