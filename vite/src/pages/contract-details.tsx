import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useParams, Link } from 'react-router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `contract-tab-${index}`,
    'aria-controls': `contract-tabpanel-${index}`,
  };
}

// Mock verification history data
const verificationHistory = [
  { id: 1, date: '2025-04-15 09:23:11', verifier: 'jane.smith@example.com', status: 'Success', ip: '192.168.1.243' },
  { id: 2, date: '2025-04-14 14:45:22', verifier: 'john.doe@example.com', status: 'Success', ip: '203.0.113.45' },
  { id: 3, date: '2025-04-12 16:12:05', verifier: 'unknown@example.com', status: 'Failed', ip: '198.51.100.67' },
];

// Mock version history data
const versionHistory = [
  { version: 2, date: '2025-04-10 14:30:00', updatedBy: 'admin@example.com', changes: 'Updated recipient details and extended contract period' },
  { version: 1, date: '2025-04-05 10:15:22', updatedBy: 'admin@example.com', changes: 'Initial contract creation' },
];

export default function ContractDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState(0);
  const [qrDialogOpen, setQrDialogOpen] = React.useState(false);
  const [contractType, setContractType] = React.useState<'broadcast' | 'public' | 'private'>('broadcast');

  // Determine contract type from URL path - in a real app, you'd get this from an API
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/broadcast/')) {
      setContractType('broadcast');
    } else if (path.includes('/public/')) {
      setContractType('public');
    } else if (path.includes('/private/')) {
      setContractType('private');
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock contract data - in a real app, you would fetch this based on the contract ID
  const contractData = {
    id: id || '0x123',
    title: 'Certificate of Achievement',
    contractType: contractType,
    owner: '0xabc...def',
    created: '2025-04-05',
    validFrom: '2025-04-05',
    validUntil: '2030-04-05',
    status: 'Active',
    activeVersion: '2',
    recipient: contractType !== 'broadcast' ? 'john.doe@example.com' : null,
    encryptionLevel: contractType === 'private' ? 'Maximum' : null,
    accessLimit: contractType === 'private' ? 5 : null,
    verificationCount: 12,
    lastVerified: '2025-04-15',
  };

  const navigateBackUrl = `/${contractType}`;

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to={navigateBackUrl}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Contracts
        </Button>
        <Typography variant="h4">
          Contract Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {contractData.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ID: {contractData.id}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`${contractData.contractType.charAt(0).toUpperCase() + contractData.contractType.slice(1)} Contract`}
                color="primary"
                size="small"
              />
              <Chip
                label={contractData.status}
                color="success"
                size="small"
              />
              {contractData.encryptionLevel && (
                <Chip
                  icon={<SecurityIcon />}
                  label={`${contractData.encryptionLevel} Encryption`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
            <Button startIcon={<DownloadIcon />} variant="outlined">
              Download JSON
            </Button>
            <Button startIcon={<DownloadIcon />} variant="outlined">
              Download Document
            </Button>
            <Button 
              startIcon={<QrCodeIcon />} 
              variant="outlined"
              onClick={() => setQrDialogOpen(true)}
            >
              Show QR Code
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="contract tabs">
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Verification History" {...a11yProps(1)} />
            <Tab label="Version History" {...a11yProps(2)} />
            {contractType === 'private' && <Tab label="Security Settings" {...a11yProps(3)} />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Owner:</Typography>
              <Typography variant="body1" paragraph>{contractData.owner}</Typography>

              <Typography variant="subtitle1">Created:</Typography>
              <Typography variant="body1" paragraph>{contractData.created}</Typography>

              <Typography variant="subtitle1">Valid Period:</Typography>
              <Typography variant="body1" paragraph>{contractData.validFrom} to {contractData.validUntil}</Typography>

              <Typography variant="subtitle1">Active Version:</Typography>
              <Typography variant="body1" paragraph>{contractData.activeVersion}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {contractData.recipient && (
                <>
                  <Typography variant="subtitle1">Recipient:</Typography>
                  <Typography variant="body1" paragraph>{contractData.recipient}</Typography>
                </>
              )}

              {contractData.accessLimit && (
                <>
                  <Typography variant="subtitle1">Access Limit:</Typography>
                  <Typography variant="body1" paragraph>
                    {contractData.accessLimit} times
                  </Typography>
                </>
              )}

              <Typography variant="subtitle1">Verification Stats:</Typography>
              <Typography variant="body1" paragraph>
                Verified {contractData.verificationCount} times (Last: {contractData.lastVerified})
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Verifier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {verificationHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.verifier}</TableCell>
                    <TableCell>
                      {row.status === 'Success' ? (
                        <Chip 
                          icon={<VerifiedUserIcon />} 
                          label="Success" 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label="Failed" 
                          color="error" 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>{row.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Updated By</TableCell>
                  <TableCell>Changes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versionHistory.map((row) => (
                  <TableRow key={row.version}>
                    <TableCell>v{row.version}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.updatedBy}</TableCell>
                    <TableCell>{row.changes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {contractType === 'private' && (
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SecurityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Encryption Settings
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Encryption Level:</Typography>
                      <Chip 
                        label={contractData.encryptionLevel} 
                        color="error" 
                        sx={{ mt: 0.5, mb: 2 }} 
                      />
                      
                      <Typography variant="subtitle2">Access Limit:</Typography>
                      <Typography variant="body2" paragraph>
                        {contractData.accessLimit} times
                      </Typography>
                      
                      <Typography variant="subtitle2">Identity Verification:</Typography>
                      <Typography variant="body2" paragraph>
                        Required
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Advanced Options
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="warning" 
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Revoke All Access
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        sx={{ mb: 2, display: 'block' }}
                      >
                        Change Access Limits
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="error"
                      >
                        Transfer Ownership
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </Paper>

      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        aria-labelledby="qr-code-dialog-title"
      >
        <DialogTitle id="qr-code-dialog-title">Contract QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <QrCodeIcon style={{ fontSize: 200, color: '#000' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Scan this QR code to verify the contract directly.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Contract ID: {contractData.id}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="primary">Download QR</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}