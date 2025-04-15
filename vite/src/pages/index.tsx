import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import BroadcastIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import PrivateIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import { Link } from 'react-router';

export default function DashboardPage() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Net Authorizing System
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the verification contract management system. Choose a contract type to get started.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <BroadcastIcon fontSize="large" color="primary" />
              <Typography variant="h5" component="div">
                Broadcast Contracts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Public contracts visible to everyone. No activation required.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/broadcast" size="small">View All</Button>
              <Button component={Link} to="/broadcast/create" size="small" variant="contained" color="primary">Create New</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <PublicIcon fontSize="large" color="primary" />
              <Typography variant="h5" component="div">
                Public Contracts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Targeted to specific user with activation code required.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/public" size="small">View All</Button>
              <Button component={Link} to="/public/create" size="small" variant="contained" color="primary">Create New</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <PrivateIcon fontSize="large" color="primary" />
              <Typography variant="h5" component="div">
                Private Contracts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Private data with targeted user and encrypted storage.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/private" size="small">View All</Button>
              <Button component={Link} to="/private/create" size="small" variant="contained" color="primary">Create New</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <VerifiedIcon fontSize="large" color="primary" />
              <Typography variant="h5" component="div">
                Verify Document
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check the validity of a document against its contract.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to="/verify" size="small" variant="contained" color="secondary">Verify Now</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
