import { useEffect } from "react";
import { getDatabase, ref, onValue, off } from "firebase/database";

export const useRealtimeMessages = (
	conversationId: string | null,
	setMessages: (messages: any[]) => void,
) => {
	useEffect(() => {
		if (!conversationId) return;
		const db = getDatabase();
		const messagesRef = ref(db, `conversations/${conversationId}/messages`);

		const unsubscribe = onValue(messagesRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const parsedMessages = Object.entries(data).map(
					([key, value]: any) => ({
						id: key,
						...value,
					}),
				);
				setMessages(parsedMessages);
			} else {
				setMessages([]);
			}
		});

		return () => off(messagesRef);
	}, [conversationId]);
};
