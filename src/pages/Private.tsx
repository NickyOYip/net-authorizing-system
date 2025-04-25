import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export default function PrivateContracts() {
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

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Typography variant="body1">Dashboard</Typography>
        <Typography variant="body1">/</Typography>
        <Typography variant="body1" fontWeight="bold">Private Contracts</Typography>
      </Box>

      <Typography variant="h5" gutterBottom>
        Private Contracts
      </Typography>
      <Typography variant="body1" paragraph>
        Private contracts provide the highest level of security. Files are encrypted and only accessible to authorized recipients.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please connect your wallet to view and manage your private contracts.
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
              <TableCell>Security Level</TableCell>
              <TableCell>Active Version</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} align="center">
                Connect your wallet to view contracts.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}