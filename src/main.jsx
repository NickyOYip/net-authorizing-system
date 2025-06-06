import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletProvider } from './provider/walletProvider';
import { DataProvider } from './provider/dataProvider';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DataProvider>
        <WalletProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </DataProvider>
    </React.StrictMode>
  );
}