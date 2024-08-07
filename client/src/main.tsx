import './scss/styles.scss'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { WelcomePage } from './pages/WelcomePage';
import { ErrorPage } from './pages/ErrorPage';
import { lobbyLoader, LobbyPage } from './pages/LobbyPage';


const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/:lobbyID",
    element: <LobbyPage />,
    errorElement: <ErrorPage />,
    loader: lobbyLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
