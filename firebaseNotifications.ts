import { useEffect } from "react";
import {
	getMessaging,
	getToken,
	onMessage,
	requestPermission,
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";
import {
	ref as dbRef,
	onDisconnect,
	onValue,
	serverTimestamp,
	set,
	update,
} from "firebase/database";
import { rtdb } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useFirebaseMessaging() {
	useEffect(() => {
		async function setup() {
			try {
				const app = getApp();
				const messaging = getMessaging(app);

				await requestPermission(messaging);
				const token = await getToken(messaging);
				console.log("✅ FCM token:", token);

				const storedUser = await AsyncStorage.getItem("user");
				const parsedUser = storedUser ? JSON.parse(storedUser) : null;

				if (parsedUser?.id) {
					const userStatusRef = dbRef(
						rtdb,
						`status/${parsedUser.id}`,
					);

					// Set presence online
					await set(userStatusRef, {
						online: true,
						lastSeen: serverTimestamp(),
						fcmToken: token,
					});

					// On disconnect, set offline
					onDisconnect(userStatusRef).set({
						online: false,
						lastSeen: serverTimestamp(),
						fcmToken: token,
					});
				}
			} catch (err) {
				console.error("Error setting up FCM:", err);
			}
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
