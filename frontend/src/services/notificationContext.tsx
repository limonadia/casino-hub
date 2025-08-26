import { createContext, useContext, useState, type ReactNode } from "react";

export type NotificationType = "success" | "danger" | "warning" | "info";

export interface NotificationAlert {
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  alerts: NotificationAlert[];
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);

  const addAlert = (alert: NotificationAlert, duration = 5000) => {
    setAlerts((prev) => [...prev, alert]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a !== alert));
    }, duration);
  };

  const contextValue: NotificationContextType = {
    alerts,
    success: (message) => addAlert({ type: "success", message }),
    error: (message) => addAlert({ type: "danger", message }),
    warning: (message) => addAlert({ type: "warning", message }),
    info: (message) => addAlert({ type: "info", message }),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
