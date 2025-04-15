import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import DashboardPage from './pages';
import BroadcastContractsPage from './pages/broadcast';
import PublicContractsPage from './pages/public';
import PrivateContractsPage from './pages/private';
import VerifyDocumentPage from './pages/verify';
import CreateBroadcastPage from './pages/broadcast/create';
import CreatePublicPage from './pages/public/create';
import CreatePrivatePage from './pages/private/create';
import ContractDetailsPage from './pages/contract-details';
import ActivateContractPage from './pages/activate';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '',
            Component: DashboardPage,
          },
          {
            path: 'broadcast',
            children: [
              {
                path: '',
                Component: BroadcastContractsPage,
              },
              {
                path: 'create',
                Component: CreateBroadcastPage,
              },
              {
                path: ':id',
                Component: ContractDetailsPage,
              },
            ],
          },
          {
            path: 'public',
            children: [
              {
                path: '',
                Component: PublicContractsPage,
              },
              {
                path: 'create',
                Component: CreatePublicPage,
              },
              {
                path: ':id',
                Component: ContractDetailsPage,
              },
              {
                path: 'activate/:id',
                Component: ActivateContractPage,
              },
            ],
          },
          {
            path: 'private',
            children: [
              {
                path: '',
                Component: PrivateContractsPage,
              },
              {
                path: 'create',
                Component: CreatePrivatePage,
              },
              {
                path: ':id',
                Component: ContractDetailsPage,
              },
              {
                path: 'activate/:id',
                Component: ActivateContractPage,
              },
            ],
          },
          {
            path: 'verify',
            Component: VerifyDocumentPage,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
