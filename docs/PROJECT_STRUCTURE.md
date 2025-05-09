# Project Structure

This document describes the folder and file structure of the project, with a short description for each file.

---

## Root

- **App.tsx**  
  Main app component. Defines all routes using React Router and wraps them in the `Layout`.
- **main.tsx**  
  React entry point. Wraps the app with `DataProvider`, `WalletProvider`, and `BrowserRouter`.
- **mockHelpers.js**  
  Mock data and functions for contracts, contract details, download, and verification (used for UI prototyping).

---

## components/

- **ConnectionPopup.jsx**  
  Modal dialog for wallet connection, status, balances, and Irys actions.
- **DashboardCard.jsx**  
  Card UI for dashboard stats and quick actions.
- **DownloadButton.jsx**  
  Button to download files (used in contract creation/review).
- **Layout.tsx**  
  App layout, includes the top navigation bar and page container.
- **Navbar.jsx**  
  Main navigation bar, shows app title, sidebar, and wallet connection status (synced with global context).
- **ShowContracts.jsx**  
  Table/list view for displaying contracts, with search and action buttons.
- **Sidebar.jsx**  
  Drawer sidebar for navigation links (Dashboard, Create, Activate, Verify).

---

## hooks/

### contractHook/

- **abis.ts**  
  Contract ABIs for all smart contracts.
- **index.ts**  
  Exports all contract hooks.
- **types.ts**  
  Type definitions for contract events and params.
- **useBroadcastContractHook.ts**  
  Hook for broadcast contract.
- **useBroadcastFactoryHook.ts**  
  Hook for broadcast factory.
- **useBroadcastSubContractHook.ts**  
  Hook for broadcast sub-contract.
- **useMasterFactory.ts**  
  (Legacy/alt) Hook for master factory contract.
- **useMasterFactoryHook.ts**  
  Hook for master factory contract.
- **usePrivateContractHook.ts**  
  Hook for private contract.
- **usePrivateFactoryHook.ts**  
  Hook for private factory.
- **usePrivateSubContractHook.ts**  
  Hook for private sub-contract.
- **usePublicContractHook.ts**  
  Hook for public contract.
- **usePublicFactoryHook.ts**  
  Hook for public factory.
- **usePublicSubContractHook.ts**  
  Hook for public sub-contract.
- **utils.ts**  
  Utility functions for contract interaction.

#### contractHook/helpers/

- **index.ts**  
  Exports helper hooks.
- **useFileVerification.ts**  
  Helper for verifying file hashes.
- **useIrysUploader.ts**  
  Helper for Irys uploader integration.

### irysHook/

- **irysAction.ts**  
  Utility functions for interacting with Irys (fund, withdraw, upload, check balance).

---

## pages/

- **Create.jsx**  
  Multi-step form for creating new contracts (broadcast/public/private).
- **Home.tsx**  
  Dashboard page showing contract stats and quick links.
- **PublicActivate.jsx**  
  Activation page for public/private contracts (recipient enters activation code, uploads files if private).
- **PublicView.tsx**  
  Detailed view for a single public contract, including version history and download.
- **Verify.tsx**  
  Document verification page (upload file, check hash against contract).

---

## provider/

- **dataProvider.tsx**  
  React context for global app state (wallet, contract addresses, etc).
- **walletProvider.tsx**  
  React context for wallet connection and Irys uploader, exposes connect/disconnect and status.

---

## services/

- **activateService.ts**  
  Service for contract activation logic.
- **broadcastService.ts**  
  Service for broadcast contract logic.
- **homeService.ts**  
  Service for dashboard/home logic.
- **privateService.ts**  
  Service for private contract logic.
- **publicService.ts**  
  Service for public contract logic.
- **verifyService.ts**  
  Service for document verification logic.

---

## styles/

- **all.css**  
  Shared/global styles (dark theme, force text white, etc).
- **App.css**  
  Main app styles.
- **Navbar.css**  
  Styles for the navigation bar.
- **Sidebar.css**  
  Styles for the sidebar.

---

## Notes

- All contract interaction is abstracted into hooks under `hooks/contractHook/`.
- Global state (wallet, contract addresses, etc) is managed by React context in `provider/`.
- UI pages and components are in `pages/` and `components/`.
- Mock data is used for UI development and can be replaced with real contract calls.
- Service files are present for logic abstraction between UI and contract hooks.
