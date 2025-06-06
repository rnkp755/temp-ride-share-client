import { View, Text, StyleSheet, Pressable, Image, Alert } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { Calendar, Clock, Car, Bike } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { formatDistanceToNow } from "date-fns";

import { Post } from "@/types";
import API from "@/axios";

// Changed to a proper functional component
export default function TripCard({
	item,
	index = 1,
	authorizedToDelete = false,
}: {
	item: Post;
	index: number;
	authorizedToDelete?: boolean;
}) {
	const { colors } = useTheme();
	const router = useRouter();
	const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
		addSuffix: true,
	});

	return (
		<Animated.View
			entering={FadeInUp.delay(index * 100).springify()}
			style={[styles.card, { backgroundColor: colors.card }]}
		>
			<Pressable
				style={styles.cardContent}
				onPress={() =>
					router.push({
						pathname: `/trip/[id]`, // Use the route pattern from your file structure
						params: {
							id: item._id, // Pass the ID as a separate param
							trip: JSON.stringify(item),
							authorizedToDelete: authorizedToDelete
								? "true"
								: "false",
						},
					})
				}
				android_ripple={{ color: colors.ripple }}
			>
				<View style={styles.userInfo}>
					<Image
						source={{ uri: item.userId.avatar }}
						style={styles.avatar}
					/>
					<View>
						<Text style={[styles.userName, { color: colors.text }]}>
							{item.userId?.name || "Unknown User"}
						</Text>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								width: "92%",
							}}
						>
							<Text
								style={[
									styles.secondaryText,
									{ color: colors.textSecondary },
								]}
							>
								{item.userId?.email || "No Email Provided"}
							</Text>
							<Text
								style={[
									styles.secondaryText,
									{ color: colors.textSecondary },
								]}
							>
								{timeAgo}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.routeContainer}>
					<View style={styles.routePoints}>
						<View style={styles.pointLine}>
							<View
								style={[
									styles.startPoint,
									{ backgroundColor: colors.primary },
								]}
							/>
							<View
								style={[
									styles.routeLine,
									{ backgroundColor: colors.border },
								]}
							/>
							<View
								style={[
									styles.endPoint,
									{ backgroundColor: colors.primary },
								]}
							/>
						</View>

						<View style={styles.routeLabels}>
							<Text
								style={[
									styles.routeText,
									{ color: colors.text },
								]}
							>
								{item.src}
							</Text>
							<Text
								style={[
									styles.routeText,
									{ color: colors.text },
								]}
							>
								{item.dest}
							</Text>
						</View>
					</View>

					<View style={styles.viaContainer}>
						<Text
							style={[
								styles.viaText,
								{ color: colors.textSecondary },
							]}
						>
							{item.via ? `via ${item.via}` : "Direct route"}
						</Text>
					</View>
				</View>

				<View style={styles.tripDetails}>
					<View style={styles.detailItem}>
						<Calendar size={16} color={colors.primary} />
						<Text
							style={[
								styles.detailText,
								{ color: colors.textSecondary },
							]}
						>
							{item.tripDate}
						</Text>
					</View>

					<View style={styles.detailItem}>
						<Clock size={16} color={colors.primary} />
						<Text
							style={[
								styles.detailText,
								{ color: colors.textSecondary },
							]}
						>
							{item.tripTime}
						</Text>
					</View>

					<View style={styles.detailItem}>
						{item.transportation === "Bike" ? (
							<Bike size={16} color={colors.primary} />
						) : (
							<Car size={16} color={colors.primary} />
						)}
						<Text
							style={[
								styles.detailText,
								{ color: colors.textSecondary },
							]}
						>
							{item.transportation || "Undecided"}
						</Text>
					</View>
				</View>
				{!authorizedToDelete ? (
					<Pressable
						style={[
							styles.connectButton,
							{ backgroundColor: colors.primary },
						]}
						onPress={() =>
							router.push(`/messages/${item.userId._id}`)
						}
					>
						<Text style={styles.connectButtonText}>Connect</Text>
					</Pressable>
				) : (
					<Pressable
						style={[
							styles.connectButton,
							{ backgroundColor: "#F45156" },
						]}
						onPress={() => {
							Alert.alert(
								"Delete Post",
								"Are you sure you want to delete this post?",
								[
									{
										text: "Cancel",
										style: "cancel",
									},
									{
										text: "Delete",
										onPress: async () => {
											try {
												// Replace with your API endpoint
												const response =
													await API.delete(
														`/post/delete/${item._id}`,
													);

												if (
													response.data.statusCode ===
													200
												) {
													// Handle successful deletion (e.g., navigation or refreshing the list)
													alert(
														"Trip deleted successfully",
													);
													router.back();
												} else {
													alert(
														"Failed to delete trip",
													);
												}
											} catch (error) {
												console.error(
													"Error deleting trip:",
													error,
												);
												alert(
													"An error occurred while deleting the trip",
												);
											}
										},
										style: "destructive",
									},
								],
							);
						}}
					>
						<Text style={styles.connectButtonText}>Delete</Text>
					</Pressable>
				)}
			</Pressable>
		</Animated.View>
	);
}
const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		overflow: "hidden",
	},
	cardContent: {
		padding: 16,
	},
	userInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600",
	},
	routeContainer: {
		marginBottom: 16,
	},
	routePoints: {
		flexDirection: "row",
		alignItems: "center",
	},
	pointLine: {
		width: 24,
		alignItems: "center",
		marginRight: 12,
	},
	startPoint: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	routeLine: {
		width: 2,
		height: 30,
	},
	endPoint: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	routeLabels: {
		flex: 1,
		justifyContent: "space-between",
		height: 54,
	},
	routeText: {
		fontSize: 16,
		fontWeight: "500",
	},
	viaContainer: {
		marginLeft: 36,
		marginTop: 8,
	},
	viaText: {
		fontSize: 14,
	},
	tripDetails: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 16,
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 16,
		marginBottom: 8,
	},
	detailText: {
		fontSize: 14,
		marginLeft: 6,
	},
	secondaryText: {
		fontSize: 14,
	},
	connectButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: "center",
	},
	connectButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
});
