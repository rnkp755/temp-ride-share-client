import { useState, useRef, useEffect, useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
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
import API from "@/axios";
import { db } from "@/firebaseConfig";
import {
	collection,
	query,
	orderBy,
	onSnapshot,
	addDoc,
	serverTimestamp,
	doc,
	setDoc,
	updateDoc,
	getDoc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChatScreen() {
	const { colors } = useTheme();
	const router = useRouter();
	const { id } = useLocalSearchParams(); // Chat partner's user ID
	const [messages, setMessages] = useState<any[]>([]);
	const [message, setMessage] = useState("");
	const flatListRef = useRef<FlatList<any>>(null);

	const [user, setUser] = useState<any>();
	const [oppUser, setOppUser] = useState<any>();

	const [conversationId, setConversationId] = useState<string | null>(null);

	// const conversationId = useMemo(() => {
	// 	if (!user?.id || !id) return null;
	// 	return [user.id, id].sort().join("_");
	// }, [user, id]);

	let conversation = {
		userId: id,
		name: oppUser?.name ?? "Fetching...",
		avatar: oppUser?.avatar ?? "",
		messages,
	};

	const fetchCurrentUser = async () => {
		const userInAsyncStorage = await AsyncStorage.getItem("user");
		const parsedUser = userInAsyncStorage
			? JSON.parse(userInAsyncStorage)
			: {};
		setUser(parsedUser);
		console.log("Current user:", parsedUser);
	};

	const fetchOpponentUser = async () => {
		try {
			const response = await API.get(`/user/${id}`);
			setOppUser(response.data?.data);
		} catch (error) {
			console.error("Error fetching user details:", error);
			return null;
		}
	};

	useEffect(() => {
		fetchCurrentUser();
		fetchOpponentUser();
	}, [id]);

	useEffect(() => {
		if (!user?.id || !id) return;
		setConversationId([user.id, id].sort().join("_"));
	}, [user, id]);

	// 🔁 Real-time message listener
	useEffect(() => {
		if (!id || !user?.id || !conversationId) return;

		const messagesRef = collection(
			db,
			"conversations",
			conversationId,
			"messages",
		);
		const q = query(messagesRef, orderBy("timestamp"));

		const unsubscribe = onSnapshot(q, (snapshot) => {
			setMessages(
				snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
			);
		});

		return unsubscribe;
	}, [id, conversationId, user?.id]);

	// ✅ markAsRead functionality
	useEffect(() => {
		if (!user?.id || !id || !conversationId) return;

		const markConversationAsRead = async () => {
			const convRef = doc(db, "conversations", conversationId);
			const snap = await getDoc(convRef);

			if (snap.exists()) {
				await updateDoc(convRef, {
					readBy: Array.from(
						new Set([...(snap.data()?.readBy || []), user.id]),
					),
				});
			}
		};

		markConversationAsRead();
	}, [id]);

	const handleSend = async () => {
		console.log(
			"Sending message with convo id:",
			conversationId,
			message,
			user?.id,
		); // Printing null
		if (!message.trim() || !conversationId) return;

		await setDoc(
			doc(db, "conversations", conversationId),
			{
				participants: [user.id, id],
				updatedAt: serverTimestamp(),
			},
			{ merge: true },
		);

		await addDoc(
			collection(db, "conversations", conversationId, "messages"),
			{
				senderId: user.id,
				text: message.trim(),
				timestamp: serverTimestamp(),
			},
		);

		setMessage("");
		setTimeout(
			() => flatListRef.current?.scrollToEnd({ animated: true }),
			100,
		);
	};

	const renderMessage = ({ item }) => {
		const isUser = item.senderId === user.id;
		const timeAgo = formatDistanceToNow(
			new Date(item.timestamp?.toDate?.() ?? item.timestamp),
			{
				addSuffix: true,
			},
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
					<Text style={[styles.headerName, { color: colors.text }]}>
						{conversation.name}
					</Text>
				</View>
			</View>

			<FlatList
				ref={flatListRef}
				data={messages}
				renderItem={renderMessage}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.messagesList}
				showsVerticalScrollIndicator={false}
				onLayout={() =>
					flatListRef.current?.scrollToEnd({ animated: false })
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
