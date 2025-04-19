import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Image,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import {
	collection,
	query,
	where,
	onSnapshot,
	orderBy,
	doc,
	getDoc,
	getDocs,
} from "firebase/firestore";
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

		const q = query(
			collection(db, "conversations"),
			where("participants", "array-contains", userId),
			orderBy("updatedAt", "desc"),
		);

		const unsubscribe = onSnapshot(q, async (snapshot) => {
			const fetchedConversations = await Promise.all(
				snapshot.docs.map(async (docSnap) => {
					const data = docSnap.data();
					const partnerId = data.participants.find(
						(p: string) => p !== userId,
					);
					const userDoc = await API.get(`/user/${partnerId}`);
					const userInfo = userDoc.data?.data || {};

					const lastMessage = await getLastMessage(docSnap.id);
					const unreadCount =
						data.readBy?.includes(userId) || !lastMessage?.timestamp
							? 0
							: 1;

					return {
						id: docSnap.id,
						userId: partnerId,
						name: userInfo.name || "Unknown",
						avatar: userInfo.avatar || "",
						lastMessage: lastMessage || {
							text: "",
							timestamp: null,
						},
						unreadCount,
					} as Conversation;
				}),
			);

			setConversations(fetchedConversations);
		});

		return () => unsubscribe();
	}, [userId]);

	const getLastMessage = async (conversationId: string) => {
		const messagesRef = collection(
			db,
			"conversations",
			conversationId,
			"messages",
		);
		const q = query(messagesRef, orderBy("timestamp", "desc"));
		const snapshot = await getDocs(q);
		if (!snapshot.empty) {
			return snapshot.docs[0].data();
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
					<Image
						source={{ uri: item.avatar }}
						style={styles.avatar}
					/>
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
		top: 10,
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
});
