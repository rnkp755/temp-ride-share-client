import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Pressable,
	Platform,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { MapPin } from "lucide-react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "@/axios";
import { Post } from "@/types";
import TripCard from "../components/TripCard";
import FilterSortOptions from "../components/FilterSort";

// Constants
const POSTS_STORAGE_KEY = "cached_posts";
const PAGE_SIZE = 10;

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

export default function Index() {
	// Changed from HomeScreen to Index for default export
	const { colors } = useTheme();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const [page, setPage] = useState(1);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [filterOptions, setFilterOptions] = useState({
		tripDate: "",
		transportation: [] as string[],
	});
	const [sortOption, setSortOption] = useState<"Latest" | "Oldest">("Latest");

	// Ref to track if first load is complete
	const initialLoadComplete = useRef(false);

	// Load cached posts from AsyncStorage
	const loadCachedPosts = async () => {
		try {
			const cachedPostsJson =
				await AsyncStorage.getItem(POSTS_STORAGE_KEY);
			if (cachedPostsJson) {
				const cachedPosts = JSON.parse(cachedPostsJson) as Post[];
				if (cachedPosts.length > 0) {
					setPosts(cachedPosts);
					setFilteredPosts(cachedPosts);
				}
			}
		} catch (error) {
			console.error("Error loading cached posts:", error);
		}
	};

	// Cache posts to AsyncStorage
	const cachePosts = async (postsToCache: Post[]) => {
		try {
			// Only cache the first 5-6 posts for quick loading
			const postsForCache = postsToCache.slice(0, 6);
			await AsyncStorage.setItem(
				POSTS_STORAGE_KEY,
				JSON.stringify(postsForCache),
			);
		} catch (error) {
			console.error("Error caching posts:", error);
		}
	};

	// Load posts from API
	const loadPosts = async (pageNum = 1, shouldRefresh = false) => {
		if (shouldRefresh) {
			setRefreshing(true);
		} else if (pageNum === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			// Get sort type for API
			const sortType = sortOption === "Latest" ? "desc" : "asc";

			// Build params object
			const params: any = {
				page: pageNum,
				limit: PAGE_SIZE,
				sortBy: "createdAt",
				sortType,
			};

			// Add filter params if set
			if (filterOptions.tripDate) {
				params.tripDate = filterOptions.tripDate;
			}

			if (filterOptions.transportation.length > 0) {
				params.transportation = filterOptions.transportation.join(",");
			}

			const response = await API.get(`/post`, { params });

			if (
				response.data &&
				response.data.data &&
				response.data.data.posts
			) {
				const newPosts = response.data.data.posts as Post[];

				// Check if we have more data
				if (newPosts.length < PAGE_SIZE) {
					setHasMoreData(false);
				}

				// If refreshing or first page, replace posts
				// Otherwise append to existing posts
				if (pageNum === 1) {
					setPosts(newPosts);
					setFilteredPosts(newPosts);

					// Cache the posts for future use
					cachePosts(newPosts);
				} else {
					setPosts((prevPosts) => [...prevPosts, ...newPosts]);
					setFilteredPosts((prevPosts) => [
						...prevPosts,
						...newPosts,
					]);
				}
			}
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
			initialLoadComplete.current = true;
		}
	};

	// Handle refresh (pull to refresh)
	const handleRefresh = useCallback(() => {
		setPage(1);
		setHasMoreData(true);
		loadPosts(1, true);
	}, [filterOptions, sortOption]);

	// Handle load more (infinite scrolling)
	const handleLoadMore = useCallback(() => {
		if (!loadingMore && hasMoreData && initialLoadComplete.current) {
			const nextPage = page + 1;
			setPage(nextPage);
			loadPosts(nextPage);
		}
	}, [
		loadingMore,
		hasMoreData,
		page,
		initialLoadComplete.current,
		filterOptions,
		sortOption,
	]);

	// Apply filters and sort to local posts
	const applyFiltersLocally = useCallback(() => {
		let result = [...posts];

		// Apply date filter
		if (filterOptions.tripDate) {
			result = result.filter(
				(post) => post.tripDate === filterOptions.tripDate,
			);
		}

		// Apply transportation filter
		if (filterOptions.transportation.length > 0) {
			result = result.filter((post) =>
				filterOptions.transportation.includes(post.transportation),
			);
		}

		// Apply sorting
		result.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return sortOption === "Latest" ? dateB - dateA : dateA - dateB;
		});

		setFilteredPosts(result);
	}, [posts, filterOptions, sortOption]);

	// Handle filter changes
	const handleFilterChange = useCallback(
		(newFilters: { tripDate: string; transportation: string[] }) => {
			setFilterOptions(newFilters);

			// First apply filters locally for immediate feedback
			setPage(1);
			setHasMoreData(true);

			// Then fetch from API
			loadPosts(1);
		},
		[],
	);

	// Handle sort changes
	const handleSortChange = useCallback(
		(newSortOption: "Latest" | "Oldest") => {
			setSortOption(newSortOption);

			// First apply sort locally for immediate feedback
			setPage(1);
			setHasMoreData(true);

			// Then fetch from API
			loadPosts(1);
		},
		[],
	);

	useEffect(() => {
		// On initial load, first try to load cached posts
		loadCachedPosts();

		// Then fetch fresh posts from API
		loadPosts();
	}, []);

	useEffect(() => {
		// Request permissions for push notifications
		async function registerForPushNotificationsAsync() {
			let token;
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if (existingStatus !== "granted") {
				const { status } =
					await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			if (finalStatus !== "granted") {
				alert("Failed to get push token for push notification!");
				return;
			}
			token = (await Notifications.getExpoPushTokenAsync()).data;
			console.log(token);
			// Send this token to your server to save it for sending notifications later
			return token;
		}

		registerForPushNotificationsAsync();

		// This listener is fired whenever a notification is received while the app is foregrounded
		const subscription1 = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log("Notification received:", notification);
				// Handle the notification here (e.g., show an alert, update UI)
			},
		);

		// This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
		const subscription2 =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					console.log("Notification response:", response);
					// Handle the user's interaction with the notification here (e.g., navigate to a specific screen)
				},
			);

		return () => {
			subscription1.remove();
			subscription2.remove();
		};
	}, []);

	useEffect(() => {
		// Apply filters locally when filter options or posts change
		applyFiltersLocally();
	}, [filterOptions, sortOption, posts]);

	const renderItem = ({ item, index }: { item: Post; index: number }) => (
		<TripCard item={item} index={index} />
	);

	const renderFooter = () => {
		if (!loadingMore) return null;
		return (
			<View style={styles.loadingMoreContainer}>
				<ActivityIndicator size="small" color={colors.primary} />
				<Text
					style={[
						styles.loadingMoreText,
						{ color: colors.textSecondary },
					]}
				>
					Loading more trips...
				</Text>
			</View>
		);
	};

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>
					RideShare
				</Text>
				<Text
					style={[styles.subtitle, { color: colors.textSecondary }]}
				>
					Find travel companions
				</Text>
			</View>

			<FilterSortOptions
				onFilterChange={handleFilterChange}
				onSortChange={handleSortChange}
				filterOptions={filterOptions}
				sortOption={sortOption}
			/>

			{loading && posts.length === 0 ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text
						style={[
							styles.loadingText,
							{ color: colors.textSecondary },
						]}
					>
						Loading trips...
					</Text>
				</View>
			) : filteredPosts.length > 0 ? (
				<FlatList
					data={filteredPosts}
					renderItem={renderItem}
					keyExtractor={(item) => item._id.toString()}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							colors={[colors.primary]}
							tintColor={colors.primary}
						/>
					}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					ListFooterComponent={renderFooter}
				/>
			) : (
				<View style={styles.emptyContainer}>
					<MapPin size={64} color={colors.primary} />
					<Text style={[styles.emptyText, { color: colors.text }]}>
						No trips available
					</Text>
					<Text
						style={[
							styles.emptySubtext,
							{ color: colors.textSecondary },
						]}
					>
						Be the first to post a trip!
					</Text>
					<Pressable
						style={[
							styles.createTripButton,
							{ backgroundColor: colors.primary },
						]}
						onPress={() => router.push("/create")}
					>
						<Text style={styles.createTripButtonText}>
							Create Trip
						</Text>
					</Pressable>
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
	subtitle: {
		fontSize: 16,
		marginTop: 4,
	},
	listContent: {
		padding: 16,
	},
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
	timeAgo: {
		fontSize: 12,
		marginTop: 2,
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
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyText: {
		fontSize: 20,
		fontWeight: "bold",
		marginTop: 16,
	},
	emptySubtext: {
		fontSize: 16,
		textAlign: "center",
		marginTop: 8,
		marginBottom: 24,
	},
	createTripButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	createTripButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
	},
	loadingMoreContainer: {
		paddingVertical: 20,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	loadingMoreText: {
		marginLeft: 8,
		fontSize: 14,
	},
});
