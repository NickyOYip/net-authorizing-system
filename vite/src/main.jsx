import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { DataProvider } from './provider/dataProvider'
import { WalletProvider } from './provider/walletProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </DataProvider>
  </React.StrictMode>,
)
