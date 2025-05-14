import { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	Image,
	ScrollView,
	Pressable,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";

import API from "@/axios";
import { useTheme } from "@/context/ThemeContext";

import Index from "@/app/(tabs)/index";
import RenderTrips from "../components/RenderTrips";
import { ChevronLeft } from "lucide-react-native";

export default function ProfilePage() {
	const { id } = useLocalSearchParams();
	const { colors } = useTheme();

	const [user, setUser] = useState({
		avatar: "",
		name: "Fetching...",
		gender: "",
		email: "",
		role: "",
		tripsPosted: 0,
	});

	const roleSymbols: Record<"student" | "employee" | "admin", string> = {
		student: "⭐",
		employee: "🌟",
		admin: "🔥",
	};

	const roleSymbol =
		roleSymbols[user.role as keyof typeof roleSymbols] || "❓";

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await API.get(`/user/${id}`);
				setUser(response.data.data);
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUser();
	}, [id]);

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.topHeader}>
				<Pressable
					style={styles.backButton}
					onPress={() => router.back()}
					hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
				>
					<ChevronLeft size={24} color={colors.text} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: colors.text }]}>
					Profile Details
				</Text>
			</View>
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Animated.View entering={FadeIn.duration(600)}>
						<Image
							source={{ uri: user.avatar }}
							style={styles.avatar}
						/>
					</Animated.View>
					<Text style={[styles.name, { color: colors.text }]}>
						{user.name} {roleSymbol}
					</Text>
					<Text
						style={[styles.email, { color: colors.textSecondary }]}
					>
						{user.email}
					</Text>
					<Text
						style={[styles.email, { color: colors.textSecondary }]}
					>
						{"\u2B24 " +
							user.role.charAt(0).toUpperCase() +
							user.role.slice(1) +
							"   " +
							"\u2B24 " +
							user.gender.charAt(0).toUpperCase() +
							user.gender.slice(1)}
					</Text>
				</View>
			</View>

			<View style={styles.statsContainer}>
				<View
					style={[styles.statCard, { backgroundColor: colors.card }]}
				>
					<Text style={[styles.statValue, { color: colors.text }]}>
						{user.tripsPosted}
					</Text>
					<Text
						style={[
							styles.statLabel,
							{ color: colors.textSecondary },
						]}
					>
						Trips Posted
					</Text>
				</View>{" "}
			</View>
			<RenderTrips postedBy={Array.isArray(id) ? id[0] : id} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	topHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 60,
		paddingHorizontal: 20,
	},
	header: {
		paddingTop: 10,
		paddingBottom: 30,
	},
	headerContent: {
		alignItems: "center",
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 16,
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
	},
	statsContainer: {
		flexDirection: "row",
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	statCard: {
		flex: 1,
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		marginHorizontal: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	statValue: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
	},
	section: {
		marginHorizontal: 20,
		marginBottom: 24,
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		padding: 16,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
	},
	settingLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	settingText: {
		fontSize: 16,
		marginLeft: 12,
	},
	settingValue: {
		fontSize: 16,
	},
	footer: {
		padding: 20,
		alignItems: "center",
	},
	footerText: {
		fontSize: 14,
	},
	// Add to your StyleSheet
	dropdownButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderRadius: 6,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	dropdownMenu: {
		position: "absolute",
		width: 180,
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		overflow: "hidden",
	},
	dropdownItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	dropdownItemText: {
		fontSize: 16,
	},
	backButton: {
		marginRight: 16,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
});
