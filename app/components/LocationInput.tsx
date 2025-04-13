import {
	useState,
	useEffect,
	useCallback,
	createContext,
	useContext,
} from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	FlatList,
	StyleSheet,
} from "react-native";
import { MapPin, ChevronDown } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import debounce from "lodash.debounce";
import API from "@/axios";
import { Route } from "@/types";

// Create a context to share state between location input components
type LocationContextType = {
	source: string;
	destination: string;
	via: string;
	setSource: (value: string) => void;
	setDestination: (value: string) => void;
	setVia: (value: string) => void;
	availableDestinations: string[];
	availableVias: string[];
	setAvailableDestinations: (values: string[]) => void;
	setAvailableVias: (values: string[]) => void;
};

const LocationContext = createContext<LocationContextType | null>(null);

import { ReactNode } from "react";

export const LocationProvider = ({
	children,
	initialValues = { source: "", destination: "", via: "" },
}: {
	children: ReactNode;
	initialValues?: { source: string; destination: string; via: string };
}) => {
	const [source, setSource] = useState(initialValues.source);
	const [destination, setDestination] = useState(initialValues.destination);
	const [via, setVia] = useState(initialValues.via);
	const [availableDestinations, setAvailableDestinations] = useState<
		string[]
	>([]);
	const [availableVias, setAvailableVias] = useState<string[]>([]);

	return (
		<LocationContext.Provider
			value={{
				source,
				destination,
				via,
				setSource,
				setDestination,
				setVia,
				availableDestinations,
				availableVias,
				setAvailableDestinations,
				setAvailableVias,
			}}
		>
			{children}
		</LocationContext.Provider>
	);
};

type LocationInputProps = {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	isSource: boolean;
	styles: any;
	colors: any;
	onSuggestionPress?: () => void;
	queryParam: string;
	containerStyle?: any;
	isVia?: boolean;
};

const LocationInput = ({
	placeholder,
	value,
	onChange,
	isSource,
	isVia = false,
	styles,
	colors,
	onSuggestionPress,
	queryParam,
	containerStyle,
}: LocationInputProps) => {
	const locationContext = useContext(LocationContext);

	if (!locationContext) {
		throw new Error("LocationInput must be used within a LocationProvider");
	}

	const {
		source,
		destination,
		setSource,
		setDestination,
		setVia,
		availableDestinations,
		availableVias,
		setAvailableDestinations,
		setAvailableVias,
	} = locationContext;

	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isDropdownMode, setIsDropdownMode] = useState(false);
	const [searchText, setSearchText] = useState("");

	// Debounce the API calls for suggestions
	const debouncedFetchSuggestions = useCallback(
		debounce(async (text) => {
			if (text.length < 2) {
				setSuggestions([]);
				return;
			}

			try {
				const response = await API.get(
					`/route/search?${queryParam}=${text}`,
				);

				if (response.data && response.data.data) {
					const routes = response.data.data as Route[];
					// Extract unique locations from routes
					const locationSuggestions = [
						...new Set(
							routes.map((route) =>
								isSource ? route.src : route.dest,
							),
						),
					];
					setSuggestions(locationSuggestions);
				}
			} catch (error) {
				console.error(
					`Error fetching ${isSource ? "source" : "destination"} suggestions:`,
					error,
				);
				setSuggestions([]);
			}
		}, 300),
		[isSource, queryParam],
	);

	// Fetch destinations based on selected source
	const fetchDestinations = useCallback(
		async (src: string) => {
			if (!src) return;

			try {
				const response = await API.get(`/route/search?src=${src}`);

				if (response.data && response.data.data) {
					const routes = response.data.data as Route[];
					const destinations = [
						...new Set(routes.map((route) => route.dest)),
					];
					setAvailableDestinations(destinations);
				}
			} catch (error) {
				console.error("Error fetching destinations:", error);
				setAvailableDestinations([]);
			}
		},
		[setAvailableDestinations],
	);

	// Fetch via points based on selected source and destination
	const fetchVias = useCallback(
		async (src: string, dest: string) => {
			if (!src || !dest) return;

			try {
				const response = await API.get(
					`/route/search?src=${src}&dest=${dest}`,
				);

				if (response.data && response.data.data) {
					const routes = response.data.data as Route[];
					// Assuming there's a via field in your Route type
					const vias = routes
						.flatMap((route) => route.via || [])
						.filter(Boolean);
					const uniqueVias = [...new Set(vias)];
					setAvailableVias(uniqueVias);
				}
			} catch (error) {
				console.error("Error fetching via points:", error);
				setAvailableVias([]);
			}
		},
		[setAvailableVias],
	);

	// Update dropdown mode based on context changes
	useEffect(() => {
		if (isSource) {
			setIsDropdownMode(false);
		} else if (!isSource && !isVia) {
			// Destination field logic
			setIsDropdownMode(source !== "");
			if (source !== "") {
				fetchDestinations(source);
			}
		} else if (isVia) {
			// Via field logic
			setIsDropdownMode(source !== "" && destination !== "");
			if (source !== "" && destination !== "") {
				fetchVias(source, destination);
			}
		}
	}, [isSource, isVia, source, destination, fetchDestinations, fetchVias]);

	// Update the useEffect to set searchText when value changes
	useEffect(() => {
		// Initialize searchText with value when component mounts or value changes
		if (value && searchText === "") {
			setSearchText(value);
		}
	}, [value]);

	// Effect to fetch suggestions whenever input changes
	useEffect(() => {
		if (isDropdownMode) {
			// In dropdown mode, filter from available options
			if (isVia) {
				const filteredVias = availableVias.filter((v) =>
					v.toLowerCase().includes(searchText.toLowerCase()),
				);
				setSuggestions(filteredVias);
			} else {
				const filteredDests = availableDestinations.filter((d) =>
					d.toLowerCase().includes(searchText.toLowerCase()),
				);
				setSuggestions(filteredDests);
			}
		} else if (value) {
			// Regular search mode
			debouncedFetchSuggestions(value);
		} else {
			setSuggestions([]);
		}

		return () => {
			debouncedFetchSuggestions.cancel();
		};
	}, [
		value,
		debouncedFetchSuggestions,
		isDropdownMode,
		searchText,
		availableDestinations,
		availableVias,
		isVia,
	]);

	// Handle suggestion selection
	// Fix the handleSelectSuggestion function to update the searchText state
	const handleSelectSuggestion = (selection: string) => {
		onChange(selection);
		setSearchText(selection); // Add this line to update the search text
		setShowSuggestions(false);

		if (isSource) {
			// When source is selected, fetch destinations
			setSource(selection);
			setDestination("");
			setVia("");
			fetchDestinations(selection);
		} else if (!isVia) {
			// When destination is selected
			setDestination(selection);
			setVia("");

			if (source) {
				fetchVias(source, selection);
			} else {
				// If destination selected first, make source a dropdown
				const response = API.get(`/route/search?dest=${selection}`);
				response
					.then((res) => {
						if (res.data && res.data.data) {
							const routes = res.data.data as Route[];
							const sources = [
								...new Set(routes.map((route) => route.src)),
							];
							setSuggestions(sources);
						}
					})
					.catch((error) => {
						console.error(
							"Error fetching potential sources:",
							error,
						);
					});
			}
		} else {
			// Via selection
			setVia(selection);
		}

		if (onSuggestionPress) {
			onSuggestionPress();
		}
	};

	// Handle text input
	const handleTextChange = (text: string) => {
		if (isDropdownMode) {
			setSearchText(text);
			// Also update the value when in dropdown mode
			onChange(text);
		} else {
			onChange(text);
		}
	};

	const renderSuggestion = ({ item }: { item: string }) => {
		return (
			<Pressable
				style={[
					styles.suggestionItem,
					{ borderBottomColor: colors.border },
				]}
				onPress={() => handleSelectSuggestion(item)}
			>
				<MapPin size={16} color={colors.primary} />
				<Text style={[styles.suggestionText, { color: colors.text }]}>
					{item}
				</Text>
			</Pressable>
		);
	};

	// Disable input for via when source or destination is not selected
	const isDisabled = isVia && (source === "" || destination === "");

	return (
		<View style={containerStyle || styles.inputContainer}>
			<Pressable
				style={[
					styles.inputWrapper,
					{
						backgroundColor: colors.card,
						borderColor: colors.border,
						opacity: isDisabled ? 0.5 : 1,
					},
				]}
				onPress={() => {
					if (!isDisabled) {
						if (isDropdownMode) {
							setShowSuggestions(!showSuggestions);
							if (isVia) {
								setSuggestions(availableVias);
							} else {
								setSuggestions(availableDestinations);
							}
						}
					}
				}}
			>
				<MapPin size={20} color={colors.primary} />
				<TextInput
					style={[styles.input, { color: colors.text }]}
					placeholder={placeholder}
					placeholderTextColor={colors.textSecondary}
					value={isDropdownMode ? searchText : value}
					onChangeText={handleTextChange}
					onFocus={() => {
						if (!isDisabled) {
							setShowSuggestions(true);
							if (isDropdownMode) {
								if (isVia) {
									setSuggestions(availableVias);
								} else {
									setSuggestions(availableDestinations);
								}
							}
						}
					}}
					editable={!isDisabled}
				/>
				{isDropdownMode && (
					<ChevronDown size={20} color={colors.textSecondary} />
				)}
			</Pressable>

			{showSuggestions && suggestions.length > 0 && !isDisabled && (
				<Animated.View
					entering={FadeIn.duration(200)}
					style={[
						styles.suggestionsContainer,
						{
							backgroundColor: colors.card,
							zIndex: 20, // Add this to ensure dropdown appears on top
							elevation: 5, // For Android
						},
					]}
				>
					<FlatList
						data={suggestions}
						renderItem={renderSuggestion}
						keyExtractor={(item, index) =>
							`${isSource ? "source" : isVia ? "via" : "destination"}-${index}-${item}`
						}
						keyboardShouldPersistTaps="handled"
					/>
				</Animated.View>
			)}
		</View>
	);
};

export default LocationInput;
