# Net Authorizing System UI Design

## Table of Contents
- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [UI Components](#ui-components)
- [Page Designs](#page-designs)
- [Responsive Design Strategy](#responsive-design-strategy)
- [Navigation Structure](#navigation-structure)
- [Contract Type Visualization](#contract-type-visualization)

## Overview

The Net Authorizing System is a decentralized application for creating, managing, and verifying different types of contracts (Broadcast, Public, and Private). This document outlines the UI design approach to make the complex smart contract interactions intuitive and user-friendly across desktop, tablet, and mobile devices.

## Folder Structure

```
c:\Users\nicky\Desktop\net-authorizing-system\
├── frontend\
│   ├── src\
│   │   ├── assets\             # Static assets (images, icons, etc.)
│   │   ├── components\
│   │   │   ├── common\         # Shared components like Button, Card, etc.
│   │   │   ├── layout\         # Layout components (Header, Footer, Sidebar)
│   │   │   ├── forms\          # Form components and elements
│   │   │   └── contract\       # Contract-specific components
│   │   │       ├── broadcast\  # Broadcast contract components
│   │   │       ├── public\     # Public contract components
│   │   │       ├── private\    # Private contract components
│   │   │       └── version\    # Version management components
│   │   ├── hooks\              # Custom React hooks
│   │   │   └── useContractVersions.ts  # Hook for managing contract versions
│   │   ├── pages\
│   │   │   ├── Home\           # Dashboard
│   │   │   ├── Create\         # Contract creation flows
│   │   │   │   ├── Broadcast\
│   │   │   │   ├── Public\
│   │   │   │   └── Private\
│   │   │   ├── Contracts\      # Contract management
│   │   │   │   └── Detail\     # Contract detail view with version management
│   │   │   ├── Verify\         # Verification portal
│   │   │   └── Account\        # User account management
│   │   ├── routes\             # Application routing
│   │   ├── services\
│   │   │   ├── api\            # Backend API calls
│   │   │   │   └── search.ts   # Search functionality for contracts
│   │   │   ├── blockchain\     # Web3 contract interactions
│   │   │   └── storage\        # Arweave/IPFS storage services
│   │   ├── store\              # State management
│   │   │   └── versionManager\ # State for managing contract versions
│   │   ├── styles\             # Global styles and themes
│   │   ├── types\              # TypeScript type definitions
│   │   └── utils\              # Utility functions
│   │       └── filters.ts      # Contract filtering utilities
│   ├── public\                 # Public assets
│   └── [other Vite config files]
```

## UI Components

### 1. Dashboard & Navigation Structure

The dashboard serves as the central hub that clearly distinguishes between the three contract types:

- **Top Navigation**: 
  - Wallet connection status
  - Network status indicator
  - Account menu dropdown

- **Main Dashboard**:
  - **Card Grid**: Three large visual cards representing contract types:
    - Broadcast Contracts (Blue theme)
    - Public Contracts (Green theme)
    - Private Contracts (Purple theme)
  - Each card shows:
    - Count of owned contracts
    - Quick-action button to create new contract
    - Visual icon representing contract type
  - Recent activity feed showing latest actions

### 2. Contract Creation Flow

The creation flow follows a wizard pattern for each contract type:

1. **Step 1: Basic Information**
   - Title input
   - Start/End date selection
   - Contract type explanation

2. **Step 2: Document Upload**
   - File upload area with drag-and-drop
   - File type validation
   - Hash generation visualization

3. **Step 3: Preview & Confirmation**
   - Contract metadata summary
   - File hashes display
   - Gas estimation and transaction cost
   - Terms acceptance checkbox

4. **Step 4: Success & Next Steps**
   - Contract address (with copy button)
   - Action buttons for:
     - View contract details
     - Create activation code (Public/Private)
     - Create another contract

### 3. Contract Detail & Version Management

Contract detail view uses a timeline-based interface for version management:

- **Contract Header**:
  - Contract title and type
  - Contract address with copy option
  - Owner/user information

- **Version Timeline**:
  - Visual horizontal timeline showing all versions
  - Active version clearly highlighted
  - Version creation dates
  - Status indicators (Active/Disabled)

- **Version Detail Panel**:
  - JSON metadata display in formatted key-value pairs
  - File links with verification status
  - User activation status (Public/Private contracts)
  - Start/End date information
  - Creation timestamp

- **Version Actions**:
  - "Create New Version" button (for owners)
  - Version comparison tool
  - Activate/Deactivate controls
  - For Private contracts: encrypted file management

### 4. Verification Portal

The verification interface is designed to be straightforward:

- **Search Interface**:
  - Search by Contract Address
  - Search by Owner Address
  - Filter by contract type (Broadcast/Public/Private)

- **Results Display**:
  - List view with expandable details
  - Clear visual indicators for contract type
  - Status indicators (Active/Inactive)
  - Timeline view for contracts with multiple versions

- **Verification Section**:
  - File upload area for hash verification
  - Step-by-step verification guidance
  - Clear visual feedback on verification results
  - Option to download verified documents (when permitted)

## Page Designs

### Home/Dashboard Page

- **Hero Section**: Quick explanation of the platform
- **Contract Type Cards**: Visual distinction between contract types
- **Recent Activity**: Timeline of recent interactions
- **Quick Stats**: Number of contracts, verifications, etc.

### Contract Creation Pages

- **Type Selection**: Clear visual choice between contract types with explanations
- **Form-Based Creation**: Step-by-step guided flow with progress indicator
- **File Handling**: Drag-and-drop interface with preview
- **Confirmation**: Clear summary before submission

### Contract Management Pages

- **List View**: Sortable/filterable list of user's contracts
- **Detail View**: Comprehensive view of single contract with all versions
- **Version Timeline**: Visual representation of contract history
- **Action Panel**: Contextual actions based on contract state

### Verification Portal Pages

- **Search Interface**: Multiple search options with guided help
- **Results View**: Clear presentation of verification status
- **Document Validation**: Visual comparison of hashes and metadata

## Responsive Design Strategy

### Desktop View (>1024px)
- Full sidebar navigation
- Multi-column layouts
- Detailed version comparison views
- Advanced filtering options visible
- Horizontal version timeline

### Tablet View (768px-1024px)
- Collapsible sidebar navigation
- Two-column layouts where appropriate
- Simplified filtering with dropdown options
- Scrollable version timeline
- Touch-optimized controls

### Mobile View (<768px)
- Bottom navigation bar with icons
- Single column stacked layouts
- Modal dialogs for detailed views
- Vertical timeline for versions
- Simplified controls with expandable details
- Swipe gestures for navigation between versions

## Navigation Structure

```
/                                 # Home/Dashboard
/create                           # Contract type selection
/create/broadcast                 # Create broadcast contract flow
/create/public                    # Create public contract flow
/create/private                   # Create private contract flow
/contracts                        # List all contracts with filter options
/contracts/search?userAddr=0x...  # Filter contracts by user address
/contracts/search?contractAddr=0x... # Filter contracts by contract address
/contracts/:id                    # View specific contract with all versions
/contracts/:id/versions/:verId    # View specific version of a contract
/verify                           # Contract verification portal
/verify/:id                       # Verification result for specific contract
/account                          # User account/profile
```

## Contract Type Visualization

### Visual Language for Contract Types

- **Broadcast Contracts**:
  - Color: Blue (#3366FF)
  - Icon: Broadcast tower icon
  - Visual Metaphor: Signal spreading outward

- **Public Contracts**:
  - Color: Green (#00C48C)
  - Icon: Document with user icon
  - Visual Metaphor: Directed document transfer

- **Private Contracts**:
  - Color: Purple (#6E56CF)
  - Icon: Locked document icon
  - Visual Metaphor: Secure encrypted transfer

Each contract type maintains this consistent visual language throughout the application, making it easy for users to identify different contract types at a glance.

### Status Indicators

- **Active Contract**: Green dot indicator
- **Disabled Contract**: Grey dot indicator
- **Pending Activation**: Yellow dot indicator
- **Expired Contract**: Red dot indicator

### Version Management Visual Aids

- Clear distinction between versions through timeline
- Active version highlighted with accent color
- Version creation dates shown on timeline nodes
- Comparison view for visualizing changes between versions
