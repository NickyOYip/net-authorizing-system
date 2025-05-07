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
  Typography,
  InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Search as SearchIcon } from '@mui/icons-material';

// map each type to its filter color
const typeColors = {
  broadcast: '#4e73df',
  public: '#1cc88a',
  private: '#36b9cc'
};

export default function ShowContracts({ type, contracts }) {
  // use the passed‐in contracts instead of mocks
  const docs = contracts || [];
  const [searchTerm, setSearchTerm] = useState('');

  // filter by searchTerm
  const filtered = docs.filter(row =>
    Object.values(row).some(
      val =>
        val &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <Box>
        {type === 'public' && (
          <Typography variant="h4" sx={{ borderLeft: "solid 10px #1cc88a", padding: "10px" }} gutterBottom>
            Public Contracts
          </Typography>
        )}
        {type === 'broadcast' && (
          <Typography variant="h4" sx={{ borderLeft: "solid 10px #4e73df", padding: "10px" }} gutterBottom>
            Broadcast Contracts
          </Typography>
        )}
        {type === 'private' && (
          <Typography variant="h4" sx={{ borderLeft: "solid 10px #36b9cc", padding: "10px" }} gutterBottom>
            Private Contracts
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "white !important" }} />
            </InputAdornment>
          )
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(contract => (
              <TableRow key={contract.address}>
                <TableCell>{contract.address}</TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>
                  <Chip
                    label={contract.type}
                    size="small"
                    sx={{
                      borderRadius: '20px',
                      px: 2,
                      color: '#000',
                      backgroundColor: typeColors[contract.type] || '#ccc',
                      border: `1px solid ${typeColors[contract.type] || '#ccc'}`,
                      textTransform: 'capitalize'
                    }}
                  />
                </TableCell>
                <TableCell>{contract.owner}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/contracts/${contract.address}`}
                      size="small"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                    {type === 'private' && (
                      <Button
                        component={Link}
                        to={`/activate/${contract.address}`}
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
