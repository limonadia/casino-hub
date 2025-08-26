import { useNotifications } from "../../services/notificationContext";

export const Notifications = () => {
  const { alerts } = useNotifications();

  return (
    <div style={{ position: "fixed", bottom: 10, right: 10, zIndex: 9999}}>
      {alerts.map((alert, index) => (  
        <div
          key={index}
          style={{
            marginBottom: 10,
            padding: "10px 15px",
            borderRadius: 5,
            color: "#fff",
            backgroundColor:
              alert.type === "success"
                ? "green"
                : alert.type === "danger"
                ? "red"
                : alert.type === "warning"
                ? "orange"
                : "blue",
          }}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
};
