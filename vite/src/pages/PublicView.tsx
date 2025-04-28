import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Grid
} from '@mui/material';

import { Link, useParams, useNavigate} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import PublicIcon from '@mui/icons-material/Public';
import CampaignIcon from '@mui/icons-material/Campaign';
import LockIcon from '@mui/icons-material/Lock';
import { mockContractDetail, mockDownload } from '../mockHelpers';

export default function PublicContractViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Use mockContractDetail from helper
  const [contract, setContract] = useState(mockContractDetail(id));

  // Sort versions in descending order
  const sortedVersions = [...contract.versions].sort((a, b) => b.version - a.version);

  const getContractTypeIcon = () => {
    switch(contract.type) {
      case 'broadcast':
        return <CampaignIcon color="primary" sx={{ mr: 1 }} />;
      case 'public':
        return <PublicIcon color="primary" sx={{ mr: 1 }} />;
      case 'private':
        return <LockIcon color="primary" sx={{ mr: 1 }} />;
      default:
        return <PublicIcon color="primary" sx={{ mr: 1 }} />;
    }
  };

  // Use mockDownload from helper
  const handleDownload = mockDownload;

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        RETURN TO CONTRACTS
      </Button>

      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Contract Details
      </Typography>

      {/* Contract Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getContractTypeIcon()}
          <DescriptionIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h6">{contract.title}</Typography>
          <Chip 
            label={contract.status} 
            color={contract.status === 'Active' ? 'success' : 'warning'}
            sx={{ ml: 2 }}
          />
          <Chip 
            label={contract.type.toUpperCase()} 
            color="info"
            sx={{ ml: 2 }}
          />
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          {contract.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Contract ID:</Typography>
            <Typography variant="body1">{contract.id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Owner:</Typography>
            <Typography variant="body1">{contract.owner}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Recipient:</Typography>
            <Typography variant="body1">{contract.recipient}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Created Date:</Typography>
            <Typography variant="body1">{contract.created}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Contract Type:</Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              {getContractTypeIcon()}
              {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* File Versions Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h6">File Versions (Newest First)</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedVersions.map((version) => (
                <TableRow key={version.version}>
                  <TableCell>
                    {version.version}
                    {version.version === contract.currentVersion && (
                      <Chip label="Current" color="primary" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>{version.fileType}</TableCell>
                  <TableCell>{version.size}</TableCell>
                  <TableCell>{version.timestamp}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleDownload(version.hash)}
                      title="Download this version"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
