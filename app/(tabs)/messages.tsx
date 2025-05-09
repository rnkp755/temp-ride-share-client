import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
	ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
	getDatabase,
	ref,
	query,
	orderByChild,
	limitToLast,
	get,
	off,
	onValue,
} from "firebase/database";
import { formatDistanceToNow } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInRight } from "react-native-reanimated";
import API from "@/axios";

type Conversation = {
	id: string;
	userId: string;
	name: string;
	avatar: string;
	lastMessage: {
		text: string;
		timestamp: any;
	};
	unreadCount: number;
};

export default function MessagesScreen() {
	const { colors } = useTheme();
	const router = useRouter();

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const userInStorage = await AsyncStorage.getItem("user");
			const parsedUser = userInStorage ? JSON.parse(userInStorage) : null;
			setUserId(parsedUser?.id || null);
		};
		fetchUser();
	}, []);

	useEffect(() => {
		if (!userId) return;

		const db = getDatabase();
		const conversationsRef = ref(db, "conversations");

		// Order by updatedAt and filter manually
		const q = query(conversationsRef, orderByChild("updatedAt"));

		const unsubscribe = onValue(q, async (snapshot) => {
			if (!snapshot.exists()) return;

			const data = snapshot.val();
			const entries = Object.entries(data || {});
			const filteredAndSorted = entries
				.filter(([_, convo]: any) =>
					convo.participants?.includes(userId),
				)
				.sort((a: any, b: any) => b[1].updatedAt - a[1].updatedAt);

			const fetchedConversations = await Promise.all(
				filteredAndSorted.map(async ([id, convo]: any) => {
					const partnerId = convo.participants.find(
						(p: string) => p !== userId,
					);

					const userDoc = await API.get(`/user/${partnerId}`);
					const userInfo = userDoc.data?.data || {};

					// Get last message (assumes you have getLastMessage in RTDB version already)
					const lastMessage = await getLastMessage(id);

					// Count unread messages
					const messagesRef = ref(db, `conversations/${id}/messages`);
					const messagesSnapshot = await get(messagesRef);
					let unreadCount = 0;

					if (messagesSnapshot.exists()) {
						messagesSnapshot.forEach((childSnapshot) => {
							const messageData = childSnapshot.val();
							if (
								messageData.senderId === partnerId &&
								(!messageData.readBy ||
									!messageData.readBy.includes(userId))
							) {
								unreadCount++;
							}
						});
					}

					return {
						id,
						userId: partnerId,
						name: userInfo.name || "Unknown",
						avatar:
							userInfo.avatar ||
							"https://avatar.iran.liara.run/public",
						lastMessage: lastMessage || {
							text: "",
							timestamp: null,
						},
						unreadCount,
					} as Conversation;
				}),
			);

			setConversations(fetchedConversations);
			setIsLoading(false);
		});

		return () => off(q, "value", unsubscribe); // Manually remove listener
	}, [userId]);

	const getLastMessage = async (conversationId: string) => {
		const db = getDatabase();
		const messagesRef = ref(db, `conversations/${conversationId}/messages`);
		const lastMessageQuery = query(
			messagesRef,
			orderByChild("timestamp"),
			limitToLast(1),
		);
		const snapshot = await get(lastMessageQuery);

		if (snapshot.exists()) {
			let lastMessage = null;
			snapshot.forEach((child) => {
				lastMessage = child.val(); // gets the last message object
			});
			return lastMessage;
		}
		return null;
	};

	const renderConversationItem = ({
		item,
		index,
	}: {
		item: Conversation;
		index: number;
	}) => {
		const timeAgo = item.lastMessage?.timestamp
			? formatDistanceToNow(
					new Date(
						item.lastMessage.timestamp.toDate?.() ??
							item.lastMessage.timestamp,
					),
					{ addSuffix: true },
				)
			: "";

		return (
			<Animated.View
				entering={FadeInRight.delay(index * 100).springify()}
			>
				<Pressable
					style={[
						styles.conversationItem,
						{ borderBottomColor: colors.border },
					]}
					onPress={() => router.push(`/messages/${item.userId}`)}
					android_ripple={{ color: colors.ripple }}
				>
					{item.avatar ? (
						<Image
							source={{
								uri: item.avatar,
							}}
							style={styles.avatar}
						/>
					) : (
						<Image
							source={{
								uri: "https://avatar.iran.liara.run/public/",
							}}
							style={styles.avatar}
						/>
					)}
					<View style={styles.conversationContent}>
						<View style={styles.conversationHeader}>
							<Text
								style={[
									styles.userName,
									{ color: colors.text },
								]}
							>
								{item.name}
							</Text>
							<Text
								style={[
									styles.timeAgo,
									{ color: colors.textSecondary },
								]}
							>
								{timeAgo}
							</Text>
						</View>
						<Text
							style={[
								styles.lastMessage,
								{ color: colors.textSecondary },
							]}
							numberOfLines={1}
						>
							{item.lastMessage?.text || ""}
						</Text>
						{item.unreadCount > 0 && (
							<View
								style={[
									styles.unreadBadge,
									{ backgroundColor: colors.primary },
								]}
							>
								<Text style={styles.unreadCount}>
									{item.unreadCount}
								</Text>
							</View>
						)}
					</View>
				</Pressable>
			</Animated.View>
		);
	};

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>
					Messages
				</Text>
			</View>

			{conversations.length > 0 ? (
				<FlatList
					data={conversations}
					renderItem={renderConversationItem}
					keyExtractor={(item) => item.userId.toString()}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			) : isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.primary} />
					<Text
						style={[
							styles.loadingText,
							{ color: colors.textSecondary },
						]}
					>
						Loading messages...
					</Text>
				</View>
			) : (
				<View style={styles.emptyContainer}>
					<Text style={[styles.emptyText, { color: colors.text }]}>
						No messages yet
					</Text>
					<Text
						style={[
							styles.emptySubtext,
							{ color: colors.textSecondary },
						]}
					>
						Connect with travelers to start a conversation
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingTop: 60,
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
	},
	listContent: {
		paddingBottom: 20,
	},
	conversationItem: {
		flexDirection: "row",
		padding: 16,
		borderBottomWidth: 1,
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 16,
	},
	conversationContent: {
		flex: 1,
		position: "relative",
	},
	conversationHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
	},
	timeAgo: {
		fontSize: 12,
	},
	lastMessage: {
		fontSize: 14,
		paddingRight: 24,
	},
	unreadBadge: {
		position: "absolute",
		right: 0,
		top: 20,
		minWidth: 20,
		height: 20,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 6,
	},
	unreadCount: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: "bold",
	},
	emptySubtext: {
		fontSize: 16,
		textAlign: "center",
		marginTop: 8,
	},
	loadingContainer: {
		paddingVertical: 20,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	loadingText: {
		marginLeft: 8,
		fontSize: 14,
	},
});
