import './scss/styles.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage } from './pages/ErrorPage';
import { lobbyLoader, LobbyPage } from './pages/LobbyPage';
import { WelcomePage } from './pages/WelcomePage';
import { StatsPage } from './pages/StatsPage';

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
