import { useState, useCallback, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	FlatList,
	Animated,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Search } from "lucide-react-native";
import API from "@/axios";
import { Post } from "@/types";
import TripCard from "../components/TripCard";
import LocationInput, { LocationProvider } from "../components/LocationInput";
import FilterSortOptions from "../components/FilterSort";

export default function SearchScreen() {
	const { colors } = useTheme();
	const scrollY = useRef(new Animated.Value(0)).current;

	const [source, setSource] = useState("");
	const [destination, setDestination] = useState("");
	const [via, setVia] = useState("");
	const [searchResults, setSearchResults] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [filterOptions, setFilterOptions] = useState({
		tripDate: "",
		transportation: [] as string[],
	});
	const [sortOption, setSortOption] = useState<"Latest" | "Oldest">("Latest");
	const [isSearching, setIsSearching] = useState(false);

	const [isCompactMode, setIsCompactMode] = useState(false);

	const handleScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: false,
			listener: (event) => {
				const offsetY = event.nativeEvent.contentOffset.y;
				if (offsetY > 10 && !isCompactMode) {
					setIsCompactMode(true);
				} else if (offsetY <= 40 && isCompactMode) {
					setIsCompactMode(false);
				}
			},
		},
	);

	const loadPosts = useCallback(
		async (pageNum: number = page) => {
			if (loading || (!source && !destination)) return;

			setLoading(true);
			try {
				const response = await API.get(`/post`, {
					params: {
						src: source,
						dest: destination,
						page: pageNum,
						limit: 10,
						sortBy: "createdAt",
						sortType: sortOption === "Latest" ? "desc" : "asc",
						tripDate: filterOptions.tripDate || undefined,
						transportation:
							filterOptions.transportation.length > 0
								? filterOptions.transportation.join(",")
								: undefined,
					},
				});

				if (
					response.data &&
					response.data.data &&
					response.data.data.posts
				) {
					const posts = response.data.data.posts as Post[];
					if (posts.length === 0) {
						setHasMoreData(false);
					} else {
						if (pageNum === 1) {
							setSearchResults(posts);
						} else {
							setSearchResults((prev) => [...prev, ...posts]);
						}
						setPage(pageNum);
					}
				} else {
					if (pageNum === 1) {
						setSearchResults([]);
					}
					setHasMoreData(false);
				}
			} catch (error) {
				console.error("Error searching for trips:", error);
				if (pageNum === 1) {
					setSearchResults([]);
				}
				setHasMoreData(false);
			} finally {
				setLoading(false);
				if (pageNum === 1) {
					setIsSearching(false);
				}
			}
		},
		[source, destination, page, loading, filterOptions, sortOption],
	);

	const handleSearch = async () => {
		if (!source && !destination) return;

		setIsSearching(true);
		setPage(1);
		setHasMoreData(true);
		await loadPosts(1);
	};

	const handleFilterChange = useCallback(
		(newFilters: { tripDate: string; transportation: string[] }) => {
			setFilterOptions(newFilters);
			setPage(1);
			setHasMoreData(true);
			loadPosts(1);
		},
		[loadPosts],
	);

	const handleSortChange = useCallback(
		(newSortOption: "Latest" | "Oldest") => {
			setSortOption(newSortOption);
			setPage(1);
			setHasMoreData(true);
			loadPosts(1);
		},
		[loadPosts],
	);

	const handleLoadMore = () => {
		if (!loading && hasMoreData) {
			loadPosts(page + 1);
		}
	};

	const renderItem = ({ item, index }: { item: Post; index: number }) => (
		<TripCard item={item} index={index} />
	);

	const headerHeight = scrollY.interpolate({
		inputRange: [0, 60],
		outputRange: [160, 80], // Reduce from 180 to 160 for less space at the start
		extrapolate: "clamp",
	});

	const inputsOpacity = scrollY.interpolate({
		inputRange: [0, 40], // Adjust for faster fade out
		outputRange: [1, 0],
		extrapolate: "clamp",
	});

	const compactInputsOpacity = scrollY.interpolate({
		inputRange: [30, 70], // Overlap slightly for smoother transition
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	const inputsOpacityRef = useRef(1);
	useEffect(() => {
		const listener = inputsOpacity.addListener(({ value }) => {
			inputsOpacityRef.current = value;
		});

		return () => {
			inputsOpacity.removeListener(listener);
		};
	}, [inputsOpacity]);

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<Animated.View style={[styles.header, { height: headerHeight }]}>
				<Text style={[styles.title, { color: colors.text }]}>
					Find Trips
				</Text>
				<Text
					style={[styles.subtitle, { color: colors.textSecondary }]}
				>
					Search for available rides
				</Text>
			</Animated.View>

			{/* Regular inputs - visible when not scrolling */}
			<Animated.View
				style={[
					styles.searchContainer,
					{
						opacity: inputsOpacity,
						height: isCompactMode ? 0 : undefined,
						overflow: "hidden",
						marginBottom: isCompactMode ? 0 : 20,
					},
				]}
			>
				<LocationProvider initialValues={{ source, destination, via }}>
					<LocationInput
						placeholder="From"
						value={source}
						onChange={setSource}
						isSource={true}
						styles={styles}
						colors={colors}
						queryParam="src"
					/>

					<View style={styles.destContainer}>
						<LocationInput
							placeholder="To"
							value={destination}
							onChange={setDestination}
							isSource={false}
							styles={styles}
							colors={colors}
							queryParam="dest"
						/>
					</View>
				</LocationProvider>

				<Pressable
					style={[
						styles.searchButton,
						{
							backgroundColor: colors.primary,
							opacity:
								loading || (!source && !destination) ? 0.7 : 1,
						},
					]}
					onPress={handleSearch}
					disabled={loading || (!source && !destination)}
				>
					<Search size={20} color="#fff" />
					<Text style={styles.searchButtonText}>
						{loading ? "Searching..." : "Search"}
					</Text>
				</Pressable>
			</Animated.View>

			{/* Compact inputs - visible when scrolling */}
			<Animated.View
				style={[
					styles.compactSearchContainer,
					{
						opacity: compactInputsOpacity,
						zIndex: 100,
						position: "absolute",
						top: 80,
						left: 0,
						right: 0,
						backgroundColor: colors.background,
						shadowOpacity: 0.1,
						display: isCompactMode ? "flex" : "none",
					},
				]}
			>
				<View style={styles.compactInputsRow}>
					<LocationProvider
						initialValues={{ source, destination, via }}
					>
						<View style={styles.compactInput}>
							<LocationInput
								placeholder="From"
								value={source}
								onChange={setSource}
								isSource={true}
								styles={{
									...styles,
									inputContainer:
										styles.compactInputContainer,
								}}
								colors={colors}
								queryParam="src"
								containerStyle={styles.compactInputContainer}
							/>
						</View>

						<View style={styles.compactInput}>
							<LocationInput
								placeholder="To"
								value={destination}
								onChange={setDestination}
								isSource={false}
								styles={{
									...styles,
									inputContainer:
										styles.compactInputContainer,
								}}
								colors={colors}
								queryParam="dest"
								containerStyle={styles.compactInputContainer}
							/>
						</View>
					</LocationProvider>

					<Pressable
						style={[
							styles.compactSearchButton,
							{
								backgroundColor: colors.primary,
								opacity:
									loading || (!source && !destination)
										? 0.7
										: 1,
							},
						]}
						onPress={handleSearch}
						disabled={loading || (!source && !destination)}
					>
						<Search size={18} color="#fff" />
					</Pressable>
				</View>
			</Animated.View>

			{/* Filter options */}
			{searchResults.length > 0 && (
				<View style={styles.filterContainer}>
					<FilterSortOptions
						onFilterChange={handleFilterChange}
						onSortChange={handleSortChange}
						filterOptions={filterOptions}
						sortOption={sortOption}
					/>
				</View>
			)}

			<View
				style={[
					styles.resultsContainer,
					{
						flex: 1,
						paddingTop: isCompactMode ? 60 : 8,
					},
				]}
			>
				{isSearching ? (
					<View style={styles.loadingContainer}>
						<Text style={[{ color: colors.textSecondary }]}>
							Searching...
						</Text>
					</View>
				) : searchResults.length > 0 ? (
					<FlatList
						data={searchResults}
						renderItem={renderItem}
						keyExtractor={(item) => item._id}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.3}
						ListFooterComponent={
							loading && page > 1 ? (
								<View style={styles.footerLoader}>
									<Text
										style={{ color: colors.textSecondary }}
									>
										Loading more trips...
									</Text>
								</View>
							) : !hasMoreData && searchResults.length > 0 ? (
								<View style={styles.footerEnd}>
									<Text
										style={{ color: colors.textSecondary }}
									>
										No more trips to load
									</Text>
								</View>
							) : null
						}
					/>
				) : (
					<View style={styles.emptyResults}>
						<Text
							style={[
								styles.emptyResultsText,
								{ color: colors.textSecondary },
							]}
						>
							{source && destination
								? "No trips found for this route. Try different locations or create a new trip."
								: "Enter source and destination to search for trips"}
						</Text>
					</View>
				)}
			</View>
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
		paddingBottom: 10,
		overflow: "hidden",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 16,
		marginTop: 4,
	},
	searchContainer: {
		position: "relative",
		paddingHorizontal: 20,
		paddingBottom: 20,
		zIndex: 2,
		overflow: "hidden",
	},
	inputContainer: {
		marginBottom: 12,
		zIndex: 3,
		position: "relative",
	},
	destContainer: {
		zIndex: 2,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	input: {
		flex: 1,
		marginLeft: 12,
		fontSize: 16,
	},
	suggestionsContainer: {
		position: "absolute",
		top: 60,
		left: 0,
		right: 0,
		borderRadius: 12,
		maxHeight: 200,
		zIndex: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	suggestionText: {
		marginLeft: 12,
		fontSize: 16,
	},
	searchButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 12,
		marginTop: 8,
		zIndex: 1,
	},
	searchButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
		marginLeft: 8,
	},
	listContent: {
		paddingVertical: 16,
	},
	emptyResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	emptyResultsText: {
		fontSize: 16,
		textAlign: "center",
	},
	// Loading and footer indicators
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	// Ensure results container is properly positioned
	resultsContainer: {
		flex: 1,
		paddingHorizontal: 20,
		zIndex: 1,
		marginTop: 8,
	},
	compactSearchContainer: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		position: "absolute",
		top: 80,
		left: 0,
		right: 0,
		zIndex: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	compactInputsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	compactInput: {
		flex: 1,
		marginRight: 8,
		maxHeight: 50,
	},
	compactInputContainer: {
		marginBottom: 0,
		zIndex: 3,
	},
	compactSearchButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},

	// Filter container
	filterContainer: {
		paddingHorizontal: 20,
		paddingVertical: 8,
		zIndex: 1,
	},
	// Loading indicators
	footerLoader: {
		padding: 20,
		alignItems: "center",
	},
	footerEnd: {
		padding: 20,
		alignItems: "center",
	},
});
