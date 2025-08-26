import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './services/notificationContext.tsx';
import { Notifications } from './components/Notification/Notifications.tsx';
import { AuthProvider } from './services/authContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
    <AuthProvider>
      <NotificationProvider>
        <Notifications/>
        <App />
      </NotificationProvider>
    </AuthProvider>
    </Router>
  </StrictMode>,
)
