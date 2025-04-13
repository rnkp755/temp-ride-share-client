import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Text, Modal } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Lock, ChevronDown, Check } from "lucide-react-native";

interface PostVisibilityProp {
    onChange: (value: string) => void;
    currVisibility?: string;
}

const PostVisibilitySetting: React.FC<PostVisibilityProp> = ({ onChange, currVisibility }) => {
	const { colors } = useTheme();

	const [visibility, setVisibility] = useState<string>(currVisibility || "all");
	const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);

	let allowedPostsVisibilityOptions: string[] = ["All"];

	const userPostVisibilityMap: Record<string, string> = {
		All: "all",
		"Female Only": "female-only",
		"Employee Only": "employee-only",
	};

	const userPostVisibilityMapReverse: Record<string, string> = {
		all: "All",
		"female-only": "Female Only",
		"employee-only": "Employee Only",
	};

	useEffect(() => {
		const fetchUser = async () => {
			const userInAsyncStorage = await AsyncStorage.getItem("user");
			const parsedUser = userInAsyncStorage
				? JSON.parse(userInAsyncStorage)
				: {};
			console.log("Parsed user from async storage", parsedUser);
			setVisibility(parsedUser.settings?.postVisibility || "all");
			if (parsedUser.role === "employee") {
				allowedPostsVisibilityOptions.push("Employee Only");
			}
			if (parsedUser.gender == "female") {
				console.log("Adding female only option");
				allowedPostsVisibilityOptions.push("Female Only");
			}
		};
		fetchUser();
	}, []);

	const handleVisibilityChange = (newVisibility: string) => {
		console.log("New visibility:", newVisibility);
		setVisibility(newVisibility);
		onChange(newVisibility);
	};

	return (
		<View style={[styles.settingItem]}>
			<View style={styles.settingLeft}>
				<Lock size={20} color={colors.primary} />
				<Text style={[styles.settingText, { color: colors.text }]}>
					Posts Visibility
				</Text>
			</View>
			<Pressable
				onPress={() => setShowVisibilityDropdown(true)}
				style={styles.dropdownButton}
			>
				<Text
					style={[
						styles.settingValue,
						{ color: colors.textSecondary },
					]}
				>
					{userPostVisibilityMapReverse[visibility]}
				</Text>
				<ChevronDown
					size={16}
					color={colors.textSecondary}
					style={{ marginLeft: 6 }}
				/>
			</Pressable>

			{/* Visibility dropdown modal */}
			<Modal
				transparent={true}
				visible={showVisibilityDropdown}
				animationType="fade"
				onRequestClose={() => setShowVisibilityDropdown(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowVisibilityDropdown(false)}
				>
					<View
						style={[
							styles.dropdownMenu,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
								right: 20,
								top: 620, // Adjust this value based on your layout
							},
						]}
					>
						{allowedPostsVisibilityOptions.map((option) => (
							<Pressable
								key={option}
								style={[
									styles.dropdownItem,
									{
										backgroundColor:
											userPostVisibilityMapReverse[
												visibility
											] === option
												? `${colors.primary}20`
												: "transparent",
									},
								]}
								onPress={() => {
									handleVisibilityChange(
										userPostVisibilityMap[option],
									);
									setShowVisibilityDropdown(false);
								}}
							>
								<Text
									style={[
										styles.dropdownItemText,
										{
											color:
												userPostVisibilityMapReverse[
													visibility
												] === option
													? colors.primary
													: colors.text,
										},
									]}
								>
									{option}
								</Text>
								{userPostVisibilityMapReverse[visibility] ===
									option && (
									<Check size={16} color={colors.primary} />
								)}
							</Pressable>
						))}
					</View>
				</Pressable>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
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

export default PostVisibilitySetting;
