import { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Pressable,
	TextInput,
	Platform,
	TouchableOpacity,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useTripStore } from "@/store/tripStore";
import { useUserStore } from "@/store/userStore";
import { allowedVehicles } from "@/config";
import { ChevronLeft, Calendar, Clock, Car, Check } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import LocationInput, { LocationProvider } from "../components/LocationInput";
import CustomDatePicker from "../components/DatePicker";
import TimePicker from "../components/TimePicker";

export default function CreateTripScreen() {
	const { colors } = useTheme();
	const router = useRouter();
	const { addTrip } = useTripStore();
	const { user } = useUserStore();

	const [source, setSource] = useState("");
	const [destination, setDestination] = useState("");
	const [via, setVia] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [time, setTime] = useState<string>("");
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [transportation, setTransportation] = useState("");
	const [notes, setNotes] = useState("");

	const handleTimeSelected = (
		hours: number,
		minutes: number,
		period: string,
	) => {
		setTime(
			`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`,
		);
	};

	const closeTimePicker = () => {
		setShowTimePicker(false);
	};

	const handleCreateTrip = () => {
		if (!source || !destination) return;

		const newTrip = {
			id: Date.now(),
			user: {
				id: user.id,
				name: user.name,
				avatar: user.avatar,
			},
			src: source,
			dest: destination,
			date,
			time,
			transportation: transportation || "Undecided",
			notes,
			createdAt: new Date().toISOString(),
		};

		addTrip(newTrip);
		router.back();
	};

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Pressable
					style={styles.backButton}
					onPress={() => router.back()}
					hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
				>
					<ChevronLeft size={24} color={colors.text} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: colors.text }]}>
					Create Trip
				</Text>
			</View>
			<ScrollView
				style={styles.content}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				<LocationProvider initialValues={{ source, destination, via }}>
					<Animated.View entering={FadeInUp.delay(100).springify()}>
						<Text
							style={[
								styles.sectionTitle,
								{ color: colors.text },
							]}
						>
							Select Route
						</Text>
						<Animated.View style={styles.searchContainer}>
							<LocationInput
								placeholder="From"
								value={source}
								onChange={setSource}
								isSource={true}
								styles={styles}
								colors={colors}
								queryParam="src"
							/>

							<LocationInput
								placeholder="To"
								value={destination}
								onChange={setDestination}
								isSource={false}
								styles={styles}
								colors={colors}
								queryParam="dest"
							/>

							<LocationInput
								placeholder="Via"
								value={via}
								onChange={setVia}
								isSource={false}
								isVia={true}
								styles={styles}
								colors={colors}
								queryParam="via"
							/>
						</Animated.View>
					</Animated.View>
				</LocationProvider>

				<Animated.View entering={FadeInUp.delay(200).springify()}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Date & Time
					</Text>
					<View
						style={[
							styles.inputContainer,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
								paddingHorizontal: 16,
								paddingVertical: 22,
							},
						]}
					>
						<Calendar size={20} color={colors.primary} />
						<CustomDatePicker
							selectedDate={date}
							onDateChange={(date: string) => setDate(date)}
							colors={colors}
						/>
					</View>

					<TouchableOpacity onPress={() => setShowTimePicker(true)}>
						<View
							style={[
								styles.inputContainer,
								{
									backgroundColor: colors.card,
									borderColor: colors.border,
									paddingHorizontal: 16,
									paddingVertical: 22,
								},
							]}
						>
							<Clock size={20} color={colors.primary} />
							<Text
								style={[
									styles.selectedTime,
									{
										color: time
											? colors.text
											: colors.textSecondary,
									},
								]}
							>
								{time ? time : "Select Time"}
							</Text>
							<TimePicker
								onTimeSelected={handleTimeSelected}
								visible={showTimePicker}
								onClose={closeTimePicker}
							/>
						</View>
					</TouchableOpacity>
				</Animated.View>

				<Animated.View entering={FadeInUp.delay(300).springify()}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Transportation
					</Text>
					<View style={styles.allowedVehicles}>
						{allowedVehicles.map((option) => (
							<Pressable
								key={option}
								style={[
									styles.transportOption,
									{
										backgroundColor:
											transportation === option
												? colors.primary
												: colors.card,
										borderColor: colors.border,
									},
								]}
								onPress={() => setTransportation(option)}
							>
								<Car
									size={16}
									color={
										transportation === option
											? "#fff"
											: colors.primary
									}
								/>
								<Text
									style={[
										styles.transportText,
										{
											color:
												transportation === option
													? "#fff"
													: colors.text,
										},
									]}
								>
									{option}
								</Text>
							</Pressable>
						))}
					</View>
				</Animated.View>

				<Animated.View entering={FadeInUp.delay(400).springify()}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						Additional Notes
					</Text>
					<View
						style={[
							styles.notesContainer,
							{
								backgroundColor: colors.card,
								borderColor: colors.border,
							},
						]}
					>
						<TextInput
							style={[styles.notesInput, { color: colors.text }]}
							placeholder="Add any additional information about your trip..."
							placeholderTextColor={colors.textSecondary}
							value={notes}
							onChangeText={setNotes}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
						/>
					</View>
				</Animated.View>

				<View style={styles.buttonContainer}>
					<Pressable
						style={[
							styles.createButton,
							{
								backgroundColor: source
									? colors.primary
									: colors.border,
								opacity: source ? 1 : 0.7,
							},
						]}
						onPress={handleCreateTrip}
						disabled={!source || !destination}
					>
						<Text style={styles.createButtonText}>Create Trip</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
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
		fontSize: 24,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	contentContainer: {
		paddingBottom: 40,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginTop: 24,
		marginBottom: 12,
	},
	searchContainer: {
		zIndex: 2,
	},
	locationInputContainer: {
		zIndex: 3,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 12,
		marginBottom: 12,
	},
	input: {
		flex: 1,
		marginLeft: 12,
		fontSize: 16,
		color: "#000", // Adjust based on your theme
	},
	suggestionsContainer: {
		position: "absolute",
		top: 60,
		left: 0,
		right: 0,
		borderRadius: 12,
		maxHeight: 200,
		zIndex: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		backgroundColor: "#fff", // Adjust based on your theme
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#eee", // Adjust based on your theme
	},
	suggestionText: {
		marginLeft: 12,
		fontSize: 16,
		color: "#000", // Adjust based on your theme
	},
	selectedTime: {
		fontSize: 16,
		marginLeft: 8,
	},
	allowedVehicles: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginHorizontal: -6,
	},
	transportOption: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 10,
		marginHorizontal: 6,
		marginBottom: 12,
	},
	transportText: {
		fontSize: 14,
		marginLeft: 8,
	},
	notesContainer: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
	},
	notesInput: {
		fontSize: 16,
		minHeight: 100,
	},
	buttonContainer: {
		marginTop: 24,
		marginBottom: 40,
	},
	createButton: {
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
