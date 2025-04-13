import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
	View,
	Text,
	StyleSheet,
	Image,
	Pressable,
	Switch,
	ScrollView,
	Alert,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, LogOut, Settings, MapPin, User } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/axios";
import * as SecureStore from "expo-secure-store";
import { footerMsg } from "@/config";
import PostVisibilitySetting from "../components/PostVisibility";

export default function ProfileScreen() {
	const { theme, toggleTheme, colors } = useTheme();
	const [user, setUser] = useState({
		avatar: "",
		name: "",
		gender: "",
		email: "",
		role: "",
		settings: {
			postVisibility: "",
		},
		tripsPosted: 0,
	});
	const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

	const handleChangePostVisibility = async (visibility: string) => {
		if (visibility === user.settings.postVisibility) return;

		setUser((prevUser) => ({
			...prevUser,
			settings: {
				...prevUser.settings,
				postVisibility: visibility,
			},
		}));

		try {
			const response = await API.patch(`/user/update-settings`, {
				postVisibility: visibility,
			});
			if (response.data.statusCode != 200) {
				Alert.alert(
					"Error",
					"Something went wrong while updating your settings.",
				);
			}
			const userInAsyncStorage = await AsyncStorage.getItem("user");
			const parsedUser = userInAsyncStorage
				? JSON.parse(userInAsyncStorage)
				: {};
			parsedUser.settings.postVisibility = visibility;
			await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
			console.log("Settings updated successfully:", response.data);
		} catch (error) {
			Alert.alert(
				"Error",
				"An unexpected error occurred. Please try again later.",
			);
		}
	};

	useEffect(() => {
		const fetchUser = async () => {
			const userInAsyncStorage = await AsyncStorage.getItem("user");
			const parsedUser = userInAsyncStorage
				? JSON.parse(userInAsyncStorage)
				: {};
			setUser({
				avatar: parsedUser.avatar || "",
				name: parsedUser.name || "",
				gender: parsedUser.gender || "",
				email: parsedUser.email || "",
				role: parsedUser.role || "",
				settings: {
					...parsedUser.settings,
					postVisibility: parsedUser.settings.postVisibility || "",
				},
				tripsPosted: parsedUser.tripsPosted || 0,
			});
		};
		fetchUser();
	}, []);

	const handleToggleTheme = () => {
		setIsDarkMode(!isDarkMode);
		toggleTheme();
	};

	const handleLogout = async () => {
		try {
			const accessToken = await SecureStore.getItemAsync("accessToken");
			if (!accessToken) throw new Error("No access token found");

			await API.post(
				"/user/logout",
				{},
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);

			await AsyncStorage.clear();
			await SecureStore.deleteItemAsync("accessToken");
			await SecureStore.deleteItemAsync("refreshToken");

			router.replace("/auth/login");
		} catch (error) {
			Alert.alert(
				"Logout Failed",
				"Something went wrong, please try again.",
			);
		}
	};

	const roleSymbols: Record<"student" | "employee" | "admin", string> = {
		student: "⭐",
		employee: "🌟",
		admin: "🔥",
	};

	const roleSymbol =
		roleSymbols[user.role as keyof typeof roleSymbols] || "❓";

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
			showsVerticalScrollIndicator={false}
		>
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
						{
							"\u2B24 " +
							user.role.charAt(0).toUpperCase() +
							user.role.slice(1) +
							"   " +
							"\u2B24 " +
							user.gender.charAt(0).toUpperCase() +
							user.gender.slice(1)
						}
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
				</View>

				{/* <View
					style={[styles.statCard, { backgroundColor: colors.card }]}
				>
					<Text style={[styles.statValue, { color: colors.text }]}>
						12
					</Text>
					<Text
						style={[
							styles.statLabel,
							{ color: colors.textSecondary },
						]}
					>
						Connections
					</Text>
				</View> */}
			</View>

			<View style={[styles.section, { backgroundColor: colors.card }]}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					Preferences
				</Text>

				<View
					style={[
						styles.settingItem,
						{ borderBottomColor: colors.border },
					]}
				>
					<View style={styles.settingLeft}>
						{isDarkMode ? (
							<Moon size={20} color={colors.primary} />
						) : (
							<Sun size={20} color={colors.primary} />
						)}
						<Text
							style={[styles.settingText, { color: colors.text }]}
						>
							Dark Mode
						</Text>
					</View>
					<Switch
						value={isDarkMode}
						onValueChange={handleToggleTheme}
						trackColor={{
							false: colors.border,
							true: colors.primary,
						}}
						thumbColor="#fff"
					/>
				</View>

				<Pressable
					style={styles.settingItem}
					android_ripple={{ color: colors.ripple }}
				>
					<View style={styles.settingLeft}>
						<MapPin size={20} color={colors.primary} />
						<Text
							style={[styles.settingText, { color: colors.text }]}
						>
							Default Location
						</Text>
					</View>
					<Text
						style={[
							styles.settingValue,
							{ color: colors.textSecondary },
						]}
					>
						Chandigarh University
					</Text>
				</Pressable>
			</View>

			<View style={[styles.section, { backgroundColor: colors.card }]}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					Settings
				</Text>
				<PostVisibilitySetting onChange={handleChangePostVisibility} />
			</View>

			<View style={[styles.section, { backgroundColor: colors.card }]}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>
					Account
				</Text>

				<Pressable
					style={[
						styles.settingItem,
						{ borderBottomColor: colors.border },
					]}
					android_ripple={{ color: colors.ripple }}
				>
					<View style={styles.settingLeft}>
						<User size={20} color={colors.primary} />
						<Text
							style={[styles.settingText, { color: colors.text }]}
						>
							Edit Profile
						</Text>
					</View>
				</Pressable>

				<Pressable
					style={[
						styles.settingItem,
						{ borderBottomColor: colors.border },
					]}
					android_ripple={{ color: colors.ripple }}
				>
					<View style={styles.settingLeft}>
						<Settings size={20} color={colors.primary} />
						<Text
							style={[styles.settingText, { color: colors.text }]}
						>
							Account Settings
						</Text>
					</View>
				</Pressable>

				<Pressable
					style={styles.settingItem}
					android_ripple={{ color: colors.ripple }}
					onPress={handleLogout}
				>
					<View style={styles.settingLeft}>
						<LogOut size={20} color="#FF3B30" />
						<Text
							style={[styles.settingText, { color: "#FF3B30" }]}
						>
							Logout
						</Text>
					</View>
				</Pressable>
			</View>

			<View style={styles.footer}>
				<Text
					style={[styles.footerText, { color: colors.textSecondary }]}
				>
					{footerMsg}
				</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingTop: 60,
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
});
