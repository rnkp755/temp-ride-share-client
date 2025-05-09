import { useState, useRef, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	Pressable,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	getDatabase,
	ref,
	push,
	set,
	update,
	get,
	runTransaction,
} from "firebase/database";
import API from "@/axios";

import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useUserStatus } from "@/hooks/useUserStatus";

export default function ChatScreen() {
	const { colors } = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams(); // Chat partner's user ID

	const [message, setMessage] = useState("");
	const flatListRef = useRef<FlatList<any>>(null);

	const [user, setUser] = useState<any>();
	const [oppUser, setOppUser] = useState<any>();
	const [oppUserStatus, setOppUserStatus] = useState<any>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);

	const [messages, setMessages] = useState<any[]>([]);

	// Fetch users
	useEffect(() => {
		const fetchCurrentUser = async () => {
			const userInAsyncStorage = await AsyncStorage.getItem("user");
			const parsedUser = userInAsyncStorage
				? JSON.parse(userInAsyncStorage)
				: {};
			setUser(parsedUser);
		};

		const fetchOpponentUser = async () => {
			try {
				const response = await API.get(`/user/${id}`);
				setOppUser(response.data?.data);
			} catch (error) {
				console.error("Error fetching user details:", error);
			}
		};

		fetchCurrentUser();
		fetchOpponentUser();
	}, [id]);

	// Set conversationId
	useEffect(() => {
		if (user?.id && id) {
			setConversationId([user.id, id].sort().join("_"));
		}
	}, [user?.id, id]);

	// Realtime messages
	useRealtimeMessages(conversationId, setMessages);

	// Mark current user online
	useUserStatus(user?.id);

	// Watch opponent's online status
	useUserStatus(typeof id === "string" ? id : null, setOppUserStatus);

	const conversation = {
		userId: id,
		name: oppUser?.name ?? "Fetching...",
		avatar: oppUser?.avatar ?? "",
		messages,
	};

	// Mark conversation as read
	useEffect(() => {
		if (!user?.id || !id || !conversationId) return;

		const markConversationAsRead = async () => {
			const convRef = ref(
				getDatabase(),
				`conversations/${conversationId}`,
			);

			await runTransaction(convRef, (data) => {
				if (data) {
					if (!Array.isArray(data.readBy)) {
						data.readBy = [];
					}
					if (!data.readBy.includes(user.id)) {
						data.readBy.push(user.id);
					}
				}
				return data;
			});
		};

		markConversationAsRead();
	}, [id, user?.id, conversationId]);

	// Send message
	const handleSend = async () => {
		if (!message.trim() || !conversationId || !user?.id) return;

		const db = getDatabase();
		const convRef = ref(db, `conversations/${conversationId}`);
		const messagesRef = ref(db, `conversations/${conversationId}/messages`);

		await update(convRef, {
			participants: [user.id, id],
			updatedAt: new Date().toISOString(),
		});

		const newMsgRef = push(messagesRef);
		await set(newMsgRef, {
			senderId: user.id,
			text: message.trim(),
			timestamp: new Date().toISOString(),
		});

		const receiverStatusSnap = await get(ref(db, `/status/${id}`));
		const receiverStatus = receiverStatusSnap.exists()
			? receiverStatusSnap.val()
			: null;

		const receiverIsOnChatScreen =
			receiverStatus?.online &&
			receiverStatus?.currentChatId === conversationId;

		if (!receiverIsOnChatScreen) {
			console.log("Receiver is not on chat screen, sending notification");
			await API.post("/notification/message", {
				toUserId: id,
				title: user.name,
				body: message.trim(),
			});
		}

		setMessage("");
		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	const renderMessage = ({ item }: { item: any }) => {
		const isUser = item.senderId === user?.id;
		const timeAgo = formatDistanceToNow(
			new Date(item.timestamp?.toDate?.() ?? item.timestamp),
			{ addSuffix: true },
		);

		return (
			<Animated.View
				entering={
					isUser ? FadeInRight.springify() : FadeInLeft.springify()
				}
				style={[
					styles.messageContainer,
					isUser
						? styles.userMessageContainer
						: styles.otherMessageContainer,
				]}
			>
				{!isUser && (
					<Image
						source={{ uri: conversation.avatar }}
						style={styles.messageAvatar}
					/>
				)}

				<View
					style={[
						styles.messageBubble,
						isUser
							? [
									styles.userMessageBubble,
									{ backgroundColor: colors.primary },
								]
							: [
									styles.otherMessageBubble,
									{
										backgroundColor: colors.card,
										borderColor: colors.border,
									},
								],
					]}
				>
					<Text
						style={[
							styles.messageText,
							{ color: isUser ? "#fff" : colors.text },
						]}
					>
						{item.text}
					</Text>
					<Text
						style={[
							styles.messageTime,
							{
								color: isUser
									? "rgba(255, 255, 255, 0.7)"
									: colors.textSecondary,
							},
						]}
					>
						{timeAgo}
					</Text>
				</View>
			</Animated.View>
		);
	};

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: colors.background }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
		>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => router.back()}
					hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
				>
					<ChevronLeft size={24} color={colors.text} />
				</Pressable>

				<View style={styles.headerUser}>
					<Image
						source={{ uri: conversation.avatar }}
						style={styles.headerAvatar}
					/>
					<View style={{ flex: 1 }}>
						<Text
							style={[styles.headerName, { color: colors.text }]}
						>
							{conversation.name}
						</Text>
						<Text
							style={{
								color: colors.textSecondary,
								fontSize: 12,
							}}
						>
							{oppUserStatus?.online
								? "Online"
								: oppUserStatus?.lastSeen
									? `Last seen ${formatDistanceToNow(
											new Date(oppUserStatus.lastSeen),
										)} ago`
									: "Fetching status..."}
						</Text>
					</View>
				</View>
			</View>

			<FlatList
				ref={flatListRef}
				data={messages || []}
				renderItem={renderMessage}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.messagesList}
				showsVerticalScrollIndicator={false}
				onLayout={() =>
					setTimeout(() => {
						flatListRef.current?.scrollToEnd({ animated: true });
					}, 500)
				}
			/>

			<View
				style={[
					styles.inputContainer,
					{
						backgroundColor: colors.card,
						borderTopColor: colors.border,
					},
				]}
			>
				<TextInput
					style={[
						styles.input,
						{
							color: colors.text,
							backgroundColor: colors.background,
						},
					]}
					placeholder="Type a message..."
					placeholderTextColor={colors.textSecondary}
					value={message}
					onChangeText={setMessage}
					multiline
					onKeyPress={({ nativeEvent }) => {
						if (nativeEvent.key === "Enter") {
							if (message.trim()) {
								setMessage(""); // Clear immediately
								setTimeout(() => handleSend(), 0); // Execute send after state update
							}
							return false;
						}
					}}
					returnKeyType="send"
					enablesReturnKeyAutomatically={true}
				/>
				<Pressable
					style={[
						styles.sendButton,
						{ backgroundColor: colors.primary },
					]}
					onPress={handleSend}
					disabled={!message.trim()}
				>
					<Send size={20} color="#fff" />
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 60,
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	backButton: {
		marginRight: 16,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	headerUser: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	headerName: {
		fontSize: 18,
		fontWeight: "600",
	},
	messagesList: {
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	messageContainer: {
		marginBottom: 16,
		flexDirection: "row",
		maxWidth: "80%",
	},
	userMessageContainer: {
		alignSelf: "flex-end",
	},
	otherMessageContainer: {
		alignSelf: "flex-start",
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 8,
		alignSelf: "flex-end",
	},
	messageBubble: {
		borderRadius: 16,
		padding: 12,
	},
	userMessageBubble: {
		borderBottomRightRadius: 4,
	},
	otherMessageBubble: {
		borderBottomLeftRadius: 4,
		borderWidth: 1,
	},
	messageText: {
		fontSize: 16,
		marginBottom: 4,
	},
	messageTime: {
		fontSize: 12,
		alignSelf: "flex-end",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderTopWidth: 1,
	},
	input: {
		flex: 1,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 10,
		maxHeight: 100,
	},
	sendButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	notFoundContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	notFoundText: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
	},
	backButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});
