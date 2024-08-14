import './scss/styles.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage } from './pages/ErrorPage';
import { lobbyLoader, LobbyPage } from './pages/LobbyPage';
import { statsLoader, StatsPage } from './pages/StatsPage';
import { WelcomePage } from './pages/WelcomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/stats',
    element: <StatsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/stats/:group',
    element: <StatsPage />,
    errorElement: <ErrorPage />,
    loader: statsLoader,
  },
  // {
  //   path: "/test",
  //   element: <TestPage />,
  //   errorElement: <ErrorPage />,
  // },
  {
    path: '/:lobbyID',
    element: <LobbyPage />,
    errorElement: <ErrorPage />,
    loader: lobbyLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
