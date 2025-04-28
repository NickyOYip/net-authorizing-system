import React, { useState } from 'react';
import '../styles/all.css';
import {
  Box,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { mockContracts } from '../mockHelpers';


export default function ShowContracts({ type }) {

  //types are private/broadcast/public, then you can know what type of contract to display
  //or you can pass the list of contracts into this jsx

  // Use mockContracts from helper
  const docs = mockContracts;

  const [data] = useState(docs);
  const [searchTerm, setSearchTerm] = useState('');
 //for search function 
  const contracts = data.filter((row) =>
    
    
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().trim().toLowerCase().includes(searchTerm.toLowerCase())

    )
  );

  return (
    <>
      <Box>
        {type == 'public' && (
          <Typography variant="h4" sx={{borderLeft:"solid 10px #1cc88a",padding:"10px"}} gutterBottom>
            My Public Contracts:
          </Typography>
        )}
        {type == 'broadcast' && (
           <Typography variant="h4"  sx={{borderLeft:"solid 10px #4e73df",padding:"10px"}} gutterBottom>
            All Broadcast Contracts:
          </Typography>
        )}
        {type == 'private' && (
           <Typography variant="h4" sx={{borderLeft:"solid 10px #36b9cc",padding:"10px"}}gutterBottom>
            My Private Contracts:
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "white !important" }} />
            </InputAdornment>
          ),
        }}
      />
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
                      to={`/view/${contract.id}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                    {contract.status === 'Pending Activation' && (
                      <Button
                        component={Link}
                        to={`/activate/${contract.id}`}
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
    </>
  );
}
