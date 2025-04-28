import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import '../styles/App.css';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

export default function Sidebar() {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const DrawerList = (
        <Box className="Box" role="presentation" onClick={toggleDrawer(false)}>
            <div className='Button'>
                <Button onClick={toggleDrawer(false)} style={{ alignContent: "right" }}>
                    <MenuOpenIcon />
                </Button>
            </div>
            <Divider />
            <List >
                <ListItem className='ListItem'
                    component={RouterLink}
                    to="/">
                    <ListItemButton className='ListItemButton'>
                        <ListItemIcon>
                            <DashboardIcon className='List' />
                        </ListItemIcon>
                        <ListItemText
                            primary='Dashboard'
                            className='List' />
                    </ListItemButton>
                </ListItem>
                <ListItem className='ListItem'
                    component={RouterLink}
                    to="/create">
                    <ListItemButton className='ListItemButton'>
                        <ListItemIcon>
                            <NoteAddIcon className='List' />
                        </ListItemIcon>
                        <ListItemText primary=' Create New Contracts' className='List' />
                    </ListItemButton>
                </ListItem>
                <ListItem className='ListItem'
                    component={RouterLink}
                    to="/activate">
                    <ListItemButton className='ListItemButton'>
                        <ListItemIcon>
                            <NewReleasesIcon className='List' />
                        </ListItemIcon>
                        <ListItemText primary='Activate Contracts' className='List' />
                    </ListItemButton>
                </ListItem>
                <ListItem className='ListItem'
                    component={RouterLink}
                    to="/verify">
                    <ListItemButton className='ListItemButton'>
                        <ListItemIcon>
                            <VerifiedUserIcon className='List' />
                        </ListItemIcon>
                        <ListItemText primary='Verify Documents' className='List' />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <aside>
            <Button onClick={toggleDrawer(true)}>
                <MenuIcon />
            </Button>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </aside>
    );
}

