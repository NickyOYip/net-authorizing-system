import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { WalletContext } from '../provider/walletProvider';
import { DataContext } from '../provider/dataProvider';
import { useMasterFactory } from '../hooks/contractHook';
import ConnectButton from '../components/ConnectButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export default function Layout() {
  const { walletStatus } = useContext(WalletContext);
  const { data, updateData } = useContext(DataContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentFactories } = useMasterFactory();

  // Check if wallet is connected
  useEffect(() => {
    setIsConnected(walletStatus !== 'Not connected' && !walletStatus.includes('Error'));
  }, [walletStatus]);

  // Load factory addresses when wallet is connected
  useEffect(() => {
    const loadFactoryAddresses = async () => {
      if (data.ethProvider) {
        try {
          setIsLoading(true);
          const factories = await getCurrentFactories();
          
          updateData({
            broadcastFactory: {
              version: 1, // We'll get the actual version in a more complete implementation
              address: factories.broadcastFactory,
            },
            publicFactory: {
              version: 1,
              address: factories.publicFactory,
            },
            privateFactory: {
              version: 1,
              address: factories.privateFactory,
            }
          });
          
          console.log("Factory addresses loaded:", factories);
        } catch (error) {
          console.error("Failed to load factory addresses:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFactoryAddresses();
  }, [data.ethProvider, getCurrentFactories, updateData]);

  return (
    <DashboardLayout
      toolbarItems={
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Left side of the toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption">Loading contracts...</Typography>
              </Box>
            )}
          </Box>
          
          {/* Right side of the toolbar - Connect button will be next to the night mode toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', mr: 2 }}>
            <ConnectButton />
          </Box>
        </Box>
      }
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
