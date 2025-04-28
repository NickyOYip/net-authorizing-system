import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import '../styles/all.css';
import ShowContracts from "../components/ShowContracts";

export default function PrivateContracts() {
  return (
    <Box sx={{ p: 3 }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Private Contracts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/private/create"
          sx={{ minWidth: 200,background:"#36b9cc",color:"black"}}
        >
          Create New Contract
        </Button>
      </Box>


      <Typography variant="body1" paragraph>
        Private contracts provide the highest level of security. Files are encrypted and only accessible to authorized recipients.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please connect your wallet to view and manage your private contracts.
      </Alert>
      {/* MOCK DATA: contracts shown in ShowContracts are hardcoded */}
      {/* ShowContracts uses mockContracts from mockHelpers.js */}
      <ShowContracts />
    </Box>
  );
}