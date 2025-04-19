import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Constants from "expo-constants";

const firebaseConfig = {
	apiKey: "AIzaSyApECXGW2_ZKzK_kF4pCIDJl40IdQonP8w",
	authDomain: "ride-share-755.firebaseapp.com",
	databaseURL:
		"https://ride-share-755-default-rtdb.asia-southeast1.firebasedatabase.app/",
	projectId: "ride-share-755",
	storageBucket: "ride-share-755.firebasestorage.app",
	messagingSenderId: "938321883825",
	appId: "1:938321883825:android:fd40bad0c500c78b10a890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let messaging: ReturnType<typeof getMessaging> | null = null;
if (!Constants.expoConfig?.extra?.isExpoGo) {
	try {
		messaging = getMessaging(app);
	} catch (e) {
		console.warn("FCM not available in current environment");
	}
}

export { app, db, messaging };
