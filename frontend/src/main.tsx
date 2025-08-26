import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './services/notificationContext.tsx';
import { Notifications } from './components/Notification/Notifications.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
    <NotificationProvider>
      <Notifications/>
      <App />
    </NotificationProvider>
    </Router>
  </StrictMode>,
)
