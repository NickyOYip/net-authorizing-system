import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavBar from './Navbar.jsx';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar position="static">
        <NavBar/>
        {/*
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Net Authorizing System
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/broadcast">Broadcast</Button>
          <Button color="inherit" component={RouterLink} to="/public">Public</Button>
          <Button color="inherit" component={RouterLink} to="/private">Private</Button>
          <Button color="inherit" component={RouterLink} to="/verify">Verify</Button>
        </Toolbar>
        */}
        
      </AppBar>
      <Box sx={{ p: 3 }}>{children}</Box>
    </>
  )
}