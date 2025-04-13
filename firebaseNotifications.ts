import { useEffect } from "react";
import {
	getMessaging,
	getToken,
	onMessage,
	requestPermission,
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";

export function useFirebaseMessaging() {
	useEffect(() => {
		async function setup() {
			const app = getApp();
			const messaging = getMessaging(app);

			const authStatus = await requestPermission(messaging);
			const token = await getToken(messaging);
			console.log("✅ FCM token:", token);
			// Send to backend
		}

		setup();

		const app = getApp();
		const messaging = getMessaging(app);

		const unsubscribe = onMessage(messaging, async (message) => {
			console.log("📩 Foreground message:", message);
		});

		return () => unsubscribe();
	}, []);
}
