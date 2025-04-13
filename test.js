
import * as Notifications from 'expo-notifications';
    import { Platform } from 'react-native';
    import { useEffect } from 'react';

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    export default function App() {
      useEffect(() => {
        // Request permissions for push notifications
        async function registerForPushNotificationsAsync() {
          let token;
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
          }
          token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log(token);
          // Send this token to your server to save it for sending notifications later
          return token;
        }

        registerForPushNotificationsAsync();

        // This listener is fired whenever a notification is received while the app is foregrounded
        const subscription1 = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
          // Handle the notification here (e.g., show an alert, update UI)
        });

        // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
        const subscription2 = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          // Handle the user's interaction with the notification here (e.g., navigate to a specific screen)
        });

        return () => {
          subscription1.remove();
          subscription2.remove();
        };
      }, []);

      // ... rest of your app code ...
    }