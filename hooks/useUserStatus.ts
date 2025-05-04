import { useEffect } from "react";
import {
	getDatabase,
	ref,
	set,
	onDisconnect,
	serverTimestamp,
	onValue,
	off,
} from "firebase/database";

export const useUserStatus = (
	userId: string | null,
	setStatus?: (status: any) => void,
) => {
	useEffect(() => {
		if (!userId) return;

		const db = getDatabase();
		const statusRef = ref(db, `/status/${userId}`);

		if (setStatus) {
			console.log("Setting up user status listener for:", userId);
			// Set the initial status to online and set up onDisconnect to set it to offline
			const unsubscribe = onValue(statusRef, (snapshot) => {
				setStatus(snapshot.val());
				console.log("User status updated:", snapshot.val());
			});
			return () => {
				unsubscribe();
				off(statusRef);
			};
		} else {
			set(statusRef, { online: true });
			onDisconnect(statusRef).set({
				online: false,
				lastSeen: serverTimestamp(),
			});
			return () => {
				set(statusRef, {
					online: false,
					lastSeen: serverTimestamp(),
				});
			};
		}
	}, [userId]);
};
