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
	serverTimestamp,
	set,
} from "firebase/database";
import { rtdb } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/axios";

const updateFcmToken = async (token: string) => {
	console.log("🔑 Updating FCM token to mongo");
	const response = await API.patch("/user/update-fcm-token", {
		fcmToken: token,
	});

	console.log("✅ FCM token updated:", response.data.message);
};

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
					});

					// Update FCM token in the backend
					await updateFcmToken(token);

					// On disconnect, set offline
					onDisconnect(userStatusRef).set({
						online: false,
						lastSeen: serverTimestamp(),
					});
				}
			} catch (err) {
				console.error("Error setting up FCM:", err);
			}
		}

		setup();

		// const app = getApp();
		// const messaging = getMessaging(app);

		// const unsubscribe = onMessage(messaging, async (message) => {
		// 	console.log("📩 Foreground message:", message);
		// });

		// return () => unsubscribe();
	}, []);
}
