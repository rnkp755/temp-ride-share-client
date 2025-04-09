import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Dimensions,
	Modal,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Animated, {
	useAnimatedStyle,
	withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface TimePickerProps {
	onTimeSelected: (hours: number, minutes: number, period: string) => void;
	is24Hour?: boolean;
	visible: boolean;
	onClose: () => void;
}

export default function TimePicker({
	onTimeSelected,
	is24Hour = false,
	visible,
	onClose,
}: TimePickerProps) {
	const { colors } = useTheme();
	const [selectedHour, setSelectedHour] = React.useState(0);
	const [selectedMinute, setSelectedMinute] = React.useState(0);
	const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

	const hours = is24Hour
		? Array.from({ length: 24 }, (_, i) => i)
		: Array.from({ length: 12 }, (_, i) => i + 1);
	const minutes = Array.from({ length: 60 }, (_, i) => i);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: withSpring(1) }],
		};
	});

	const handleTimeSelection = () => {
		let finalHour = selectedHour;
		if (!is24Hour && period === "PM" && selectedHour !== 12) {
			finalHour += 12;
		} else if (!is24Hour && period === "AM" && selectedHour === 12) {
			finalHour = 0;
		}
		onTimeSelected(finalHour, selectedMinute, period);
		onClose();
	};

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<Animated.View
					style={[
						styles.container,
						{ backgroundColor: colors.card },
						animatedStyle,
					]}
				>
					<View style={styles.pickerContainer}>
						<ScrollView
							style={[
								styles.scrollColumn,
								{ borderColor: colors.border },
							]}
							showsVerticalScrollIndicator={false}
						>
							{hours.map((hour) => (
								<TouchableOpacity
									key={hour}
									onPress={() => setSelectedHour(hour)}
									style={[
										styles.timeItem,
										selectedHour === hour && {
											backgroundColor: colors.primary,
										},
									]}
								>
									<Text
										style={[
											styles.timeText,
											{
												color:
													selectedHour === hour
														? colors.card
														: colors.text,
											},
										]}
									>
										{hour.toString().padStart(2, "0")}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						<Text
							style={[styles.separator, { color: colors.text }]}
						>
							:
						</Text>

						<ScrollView
							style={[
								styles.scrollColumn,
								{ borderColor: colors.border },
							]}
							showsVerticalScrollIndicator={false}
						>
							{minutes.map((minute) => (
								<TouchableOpacity
									key={minute}
									onPress={() => setSelectedMinute(minute)}
									style={[
										styles.timeItem,
										selectedMinute === minute && {
											backgroundColor: colors.primary,
										},
									]}
								>
									<Text
										style={[
											styles.timeText,
											{
												color:
													selectedMinute === minute
														? colors.card
														: colors.text,
											},
										]}
									>
										{minute.toString().padStart(2, "0")}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						{!is24Hour && (
							<View
								style={[
									styles.periodContainer,
									{ borderColor: colors.border },
								]}
							>
								<TouchableOpacity
									onPress={() => setPeriod("AM")}
									style={[
										styles.periodButton,
										period === "AM" && {
											backgroundColor: colors.primary,
										},
									]}
								>
									<Text
										style={[
											styles.periodText,
											{
												color:
													period === "AM"
														? colors.card
														: colors.text,
											},
										]}
									>
										AM
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => setPeriod("PM")}
									style={[
										styles.periodButton,
										period === "PM" && {
											backgroundColor: colors.primary,
										},
									]}
								>
									<Text
										style={[
											styles.periodText,
											{
												color:
													period === "PM"
														? colors.card
														: colors.text,
											},
										]}
									>
										PM
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: colors.border },
							]}
							onPress={onClose}
						>
							<Text
								style={[
									styles.buttonText,
									{ color: colors.text },
								]}
							>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: colors.primary },
							]}
							onPress={handleTimeSelection}
							disabled={selectedHour == 0 && selectedMinute == 0}
						>
							<Text
								style={[
									styles.buttonText,
									{ color: colors.card },
								]}
							>
								Confirm
							</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		padding: 20,
		borderRadius: 16,
		width: width * 0.9,
		maxWidth: 400,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	pickerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	scrollColumn: {
		height: 200,
		width: 60,
		borderWidth: 1,
		borderRadius: 8,
	},
	timeItem: {
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
	},
	timeText: {
		fontSize: 18,
		fontWeight: "600",
	},
	separator: {
		fontSize: 24,
		fontWeight: "bold",
		marginHorizontal: 10,
	},
	periodContainer: {
		marginLeft: 10,
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
	periodButton: {
		width: 50,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	periodText: {
		fontSize: 16,
		fontWeight: "600",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	button: {
		flex: 1,
		height: 50,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 5,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
