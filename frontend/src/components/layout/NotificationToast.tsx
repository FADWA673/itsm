import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNotificationStore } from "../../store";

/**
 * Composant global de notifications/toasts.
 * Connecté à useNotificationStore — affiche les notifications en file.
 * À monter une seule fois dans ThemedApp.tsx.
 *
 * Usage depuis n'importe quel composant :
 *   const { addNotification } = useNotificationStore()
 *   addNotification("Ticket créé", "success")
 */
function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={notification.autoHideDuration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          style={{ bottom: `${24 + index * 70}px` }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ minWidth: 300 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}

export default NotificationToast;
