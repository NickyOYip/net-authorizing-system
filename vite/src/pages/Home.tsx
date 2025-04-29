import React, { useContext, useEffect, useState } from 'react';
import '../styles/all.css';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab, 
  Paper,
  TextField,
  InputAdornment,
  Button,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ShowContracts from '../components/ShowContracts';
import { useHomeService } from '../services/homeService';
import { DataContext } from '../provider/dataProvider';

// Custom styled filter button to match the design in the screenshot
const FilterButton = styled(Button)(({ theme, active, color }) => ({
  borderRadius: '20px',
  padding: '6px 16px',
  color: active ? '#000000' : '#ffffff',
  backgroundColor: active ? color : 'transparent',
  border: `1px solid ${color}`,
  '&:hover': {
    backgroundColor: active ? color : 'rgba(255, 255, 255, 0.1)',
  },
  textTransform: 'none',
  minWidth: 'auto',
  marginRight: '10px'
}));

export default function Home() {
  const { data } = useContext(DataContext);
  const homeService = useHomeService();
  const isWalletConnected = !!data.ethProvider;

  // Tab state: 0 = Search, 1 = My Contracts
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter state
  const [filter, setFilter] = useState<{broadcast: boolean, public: boolean, private: boolean}>({
    broadcast: true,
    public: true,
    private: true
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // User contracts state
  const [userContracts, setUserContracts] = useState<any[]>([]);
  const [userContractsLoading, setUserContractsLoading] = useState(false);
  const [userContractsError, setUserContractsError] = useState<string | null>(null);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    
    try {
      const results = await homeService.searchContracts(searchTerm);
      
      // Apply filters
      const filteredResults = results.filter(contract => {
        if (contract.type === 'broadcast' && !filter.broadcast) return false;
        if (contract.type === 'public' && !filter.public) return false;
        if (contract.type === 'private' && !filter.private) return false;
        return true;
      });
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setSearchError('No contracts found matching your search and filters.');
      }
    } catch (e: any) {
      console.error('Search error:', e);
      setSearchError(e?.message || 'Failed to search contracts.');
    }
    
    setSearchLoading(false);
  };

  // Load user contracts when tab changes to "My Contracts"
  useEffect(() => {
    const fetchUserContracts = async () => {
      if (tabValue !== 1) return;
      
      setUserContractsLoading(true);
      setUserContractsError(null);
      
      try {
        if (!isWalletConnected) {
          setUserContractsError('Please connect your wallet to view your contracts.');
          setUserContractsLoading(false);
          return;
        }
        
        const contracts = await homeService.getUserRelatedContracts();
        
        // Apply filters
        const filteredContracts = contracts.filter(contract => {
          if (contract.type === 'broadcast' && !filter.broadcast) return false;
          if (contract.type === 'public' && !filter.public) return false;
          if (contract.type === 'private' && !filter.private) return false;
          return true;
        });
        
        setUserContracts(filteredContracts);
        
        if (filteredContracts.length === 0) {
          setUserContractsError('You have no contracts matching selected filters.');
        }
      } catch (e: any) {
        console.error('Error loading user contracts:', e);
        setUserContractsError(e?.message || 'Failed to load your contracts.');
      }
      
      setUserContractsLoading(false);
    };

    fetchUserContracts();
  }, [tabValue, isWalletConnected, filter]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const toggleFilter = (type: 'broadcast' | 'public' | 'private') => {
    setFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    // Re-search if we're already showing results
    if (searchResults.length > 0 && tabValue === 0) {
      handleSearch();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Dashboard
      </Typography>
      
      {/* Tabs for Search and My Contracts - Centered */}
      <Paper sx={{ mt: 4, p: 0, backgroundColor: '#242424', borderRadius: 1 }}>
        {/* Custom tab styling with centered tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #333' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            textColor="inherit"
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#3f85f5',
                height: '3px'
              }
            }}
          >
            <Tab 
              label="SEARCH CONTRACTS" 
              sx={{ 
                fontSize: '14px', 
                fontWeight: tabValue === 0 ? 'bold' : 'normal',
                color: tabValue === 0 ? '#3f85f5' : 'inherit',
                textTransform: 'uppercase'
              }} 
            />
            <Tab 
              label="MY CONTRACTS" 
              sx={{ 
                fontSize: '14px', 
                fontWeight: tabValue === 1 ? 'bold' : 'normal',
                color: tabValue === 1 ? '#3f85f5' : 'inherit',
                textTransform: 'uppercase'
              }} 
            />
          </Tabs>
        </Box>
        
        {/* Search Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ position: 'relative', mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Enter address, owner, or contract address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    pl: 1
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#444',
                    },
                  }
                }}
              />
            </Box>
            
            {/* Filter buttons styled to match screenshot - centered */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, color: '#aaa' }}>
                Filter by:
              </Typography>
              
              <FilterButton
                active={filter.broadcast ? 1 : 0}
                color="#4e73df"
                onClick={() => toggleFilter('broadcast')}
                startIcon={<PodcastsIcon />}
              >
                Broadcast
              </FilterButton>
              
              <FilterButton
                active={filter.public ? 1 : 0}
                color="#1cc88a"
                onClick={() => toggleFilter('public')}
                startIcon={<PublicIcon />}
              >
                Public
              </FilterButton>
              
              <FilterButton
                active={filter.private ? 1 : 0}
                color="#36b9cc"
                onClick={() => toggleFilter('private')}
                startIcon={<LockIcon />}
              >
                Private
              </FilterButton>
            </Box>
            
            {/* Centered warning message */}
            {searchError && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Alert severity="info" sx={{ maxWidth: '600px' }}>
                  {searchError}
                </Alert>
              </Box>
            )}
            
            {searchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : searchResults.length > 0 ? (
              <ShowContracts
                type="search"
                contracts={searchResults}
              />
            ) : searchTerm && !searchLoading && !searchError ? (
              <Box sx={{ textAlign: 'center', my: 4, p: 3, border: '1px dashed #555', borderRadius: 1 }}>
                <Typography variant="h6" color="text.secondary">
                  No contracts found matching your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search term or filters
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
        
        {/* My Contracts Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Filter buttons - same styling as search tab - centered */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2, color: '#aaa' }}>
                Filter by:
              </Typography>
              
              <FilterButton
                active={filter.broadcast ? 1 : 0}
                color="#4e73df"
                onClick={() => toggleFilter('broadcast')}
                startIcon={<PodcastsIcon />}
              >
                Broadcast
              </FilterButton>
              
              <FilterButton
                active={filter.public ? 1 : 0}
                color="#1cc88a"
                onClick={() => toggleFilter('public')}
                startIcon={<PublicIcon />}
              >
                Public
              </FilterButton>
              
              <FilterButton
                active={filter.private ? 1 : 0}
                color="#36b9cc"
                onClick={() => toggleFilter('private')}
                startIcon={<LockIcon />}
              >
                Private
              </FilterButton>
            </Box>
            
            {/* Centered warning for wallet connection */}
            {!isWalletConnected && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Alert severity="warning" sx={{ maxWidth: '600px' }}>
                  Please connect your wallet to view your contracts.
                </Alert>
              </Box>
            )}
            
            {userContractsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : userContractsError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Alert severity="info" sx={{ maxWidth: '600px' }}>
                  {userContractsError}
                </Alert>
              </Box>
            ) : userContracts.length > 0 ? (
              <ShowContracts
                type="user"
                contracts={userContracts}
              />
            ) : isWalletConnected ? (
              <Box sx={{ textAlign: 'center', my: 4, p: 3, border: '1px dashed #555', borderRadius: 1 }}>
                <Typography variant="h6" color="text.secondary">
                  No contracts found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  You have not created or received any contracts yet
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </Paper>
    </Box>
  );
}