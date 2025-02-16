import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DataProvider from './store/dataStore.jsx';
import MetaMaskProvider from './MetaMaskProvider.jsx';

/**
 * @title Root Component
 * @notice Renders the root component
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap the App component with DataProvider and MetaMaskProvider */}
    <DataProvider>
      <MetaMaskProvider>
        <App />
      </MetaMaskProvider>
    </DataProvider>
  </StrictMode>,
)
