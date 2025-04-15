import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BroadcastIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import PrivateIcon from '@mui/icons-material/Lock';
import VerifiedIcon from '@mui/icons-material/VerifiedUser';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation } from '@toolpad/core/AppProvider';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Verification System',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'broadcast',
    title: 'Broadcast Contracts',
    icon: <BroadcastIcon />,
  },
  {
    segment: 'public',
    title: 'Public Contracts',
    icon: <PublicIcon />,
  },
  {
    segment: 'private',
    title: 'Private Contracts',
    icon: <PrivateIcon />,
  },
  {
    segment: 'verify',
    title: 'Verify Document',
    icon: <VerifiedIcon />,
  },
];

const BRANDING = {
  title: 'Net Authorizing System',
};

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}
