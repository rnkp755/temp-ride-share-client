import { X } from "lucide-react-native";
import { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	FlatList,
} from "react-native";

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const CustomDatePicker = ({
	selectedDate,
	onDateChange,
	colors,
}: {
	selectedDate: string;
	onDateChange: (date: string) => void;
	colors: any;
}) => {
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [tempDate, setTempDate] = useState(() => {
		// Parse the selected date if available
		if (selectedDate) {
			const [day, month, year] = selectedDate.split("-").map(Number);
			return { day, month, year };
		}
		return {
			day: new Date().getDate(),
			month: new Date().getMonth() + 1,
			year: new Date().getFullYear(),
		};
	});

	// Generate valid days for the current month/year
	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month, 0).getDate();
	};

	const applyDate = () => {
		const formattedDate = `${tempDate.day.toString().padStart(2, "0")}-${tempDate.month.toString().padStart(2, "0")}-${tempDate.year}`;
		onDateChange(formattedDate);
		setIsPickerOpen(false);
	};

	const clearDate = () => {
		onDateChange("");
		setIsPickerOpen(false);
	};

	return (
		<View style={{ minWidth: "80%" }}>
			<TouchableOpacity onPress={() => setIsPickerOpen(true)}>
				<Text
					style={[
						styles.dateInput,
						{
							color: selectedDate
								? colors.text
								: colors.textSecondary,
						},
					]}
				>
					{selectedDate || "Select date"}
				</Text>
			</TouchableOpacity>

			<Modal
				animationType="fade"
				transparent={true}
				visible={isPickerOpen}
				onRequestClose={() => setIsPickerOpen(false)}
			>
				<View style={styles.pickerModalOverlay}>
					<View
						style={[
							styles.pickerModalContent,
							{ backgroundColor: colors.background },
						]}
					>
						<View style={styles.pickerHeader}>
							<Text
								style={[
									styles.pickerTitle,
									{ color: colors.text },
								]}
							>
								Select Date
							</Text>
							<TouchableOpacity
								onPress={() => setIsPickerOpen(false)}
							>
								<X size={20} color={colors.text} />
							</TouchableOpacity>
						</View>

						<View style={styles.pickerControls}>
							{/* Day Picker */}
							<View style={styles.pickerColumn}>
								<Text
									style={[
										styles.pickerLabel,
										{ color: colors.textSecondary },
									]}
								>
									Day
								</Text>
								<FlatList
									data={Array.from(
										{
											length: getDaysInMonth(
												tempDate.month,
												tempDate.year,
											),
										},
										(_, i) => i + 1,
									)}
									keyExtractor={(item) => item.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={[
												styles.pickerItem,
												tempDate.day === item && {
													backgroundColor:
														colors.primary ||
														`${colors.primary}20`,
												},
											]}
											onPress={() =>
												setTempDate({
													...tempDate,
													day: item,
												})
											}
										>
											<Text
												style={[
													styles.pickerItemText,
													{
														color:
															tempDate.day ===
															item
																? colors.background
																: colors.text,
													},
												]}
											>
												{item}
											</Text>
										</TouchableOpacity>
									)}
									style={styles.pickerList}
									showsVerticalScrollIndicator={false}
									initialScrollIndex={Math.max(
										0,
										tempDate.day - 3,
									)}
									getItemLayout={(_, index) => ({
										length: 40,
										offset: 40 * index,
										index,
									})}
								/>
							</View>

							{/* Month Picker */}
							<View style={styles.pickerColumn}>
								<Text
									style={[
										styles.pickerLabel,
										{ color: colors.textSecondary },
									]}
								>
									Month
								</Text>
								<FlatList
									data={Array.from(
										{ length: 12 },
										(_, i) => i + 1,
									)}
									keyExtractor={(item) => item.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={[
												styles.pickerItem,
												tempDate.month === item && {
													backgroundColor:
														colors.primary ||
														`${colors.primary}20`,
												},
											]}
											onPress={() => {
												// Adjust day if it exceeds days in the new month
												const daysInNewMonth =
													getDaysInMonth(
														item,
														tempDate.year,
													);
												const newDay =
													tempDate.day >
													daysInNewMonth
														? daysInNewMonth
														: tempDate.day;
												setTempDate({
													...tempDate,
													month: item,
													day: newDay,
												});
											}}
										>
											<Text
												style={[
													styles.pickerItemText,
													{
														color:
															tempDate.month ===
															item
																? colors.background
																: colors.text,
													},
												]}
											>
												{MONTHS[item - 1]}
											</Text>
										</TouchableOpacity>
									)}
									style={styles.pickerList}
									showsVerticalScrollIndicator={false}
									initialScrollIndex={Math.max(
										0,
										tempDate.month - 3,
									)}
									getItemLayout={(_, index) => ({
										length: 40,
										offset: 40 * index,
										index,
									})}
								/>
							</View>

							{/* Year Picker */}
							<View style={styles.pickerColumn}>
								<Text
									style={[
										styles.pickerLabel,
										{ color: colors.textSecondary },
									]}
								>
									Year
								</Text>
								<FlatList
									data={Array.from(
										{ length: 10 },
										(_, i) =>
											new Date().getFullYear() - 5 + i,
									)}
									keyExtractor={(item) => item.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={[
												styles.pickerItem,
												tempDate.year === item && {
													backgroundColor:
														colors.primary ||
														`${colors.primary}20`,
												},
											]}
											onPress={() => {
												// Adjust day if Feb 29 in non-leap year
												if (
													tempDate.month === 2 &&
													tempDate.day === 29 &&
													!(
														item % 4 === 0 &&
														(item % 100 !== 0 ||
															item % 400 === 0)
													) &&
													tempDate.year >=
														new Date().getFullYear()
												) {
													setTempDate({
														...tempDate,
														year: item,
														day: 28,
													});
												} else {
													setTempDate({
														...tempDate,
														year: item,
													});
												}
											}}
										>
											<Text
												style={[
													styles.pickerItemText,
													{
														color:
															tempDate.year ===
															item
																? colors.background
																: colors.text,
													},
												]}
											>
												{item}
											</Text>
										</TouchableOpacity>
									)}
									style={styles.pickerList}
									showsVerticalScrollIndicator={false}
									initialScrollIndex={0}
									getItemLayout={(_, index) => ({
										length: 40,
										offset: 40 * index,
										index,
									})}
								/>
							</View>
						</View>

						<View style={styles.pickerActions}>
							<TouchableOpacity
								style={[
									styles.pickerButton,
									styles.clearButton,
									{ borderColor: colors.border },
								]}
								onPress={clearDate}
							>
								<Text style={{ color: colors.text }}>
									Clear
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.pickerButton,
									styles.applyButton,
									{ backgroundColor: colors.primary },
								]}
								onPress={applyDate}
							>
								<Text style={{ color: "#FFFFFF" }}>Apply</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 12,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 6,
	},
	buttonText: {
		fontSize: 14,
		fontWeight: "500",
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		paddingTop: 16,
		maxHeight: "80%",
	},
	filterSection: {
		marginBottom: 24,
	},
	dateInputContainer: {
		minWidth: "100%",
	},
	dateInput: {
		flex: 1,
		fontSize: 16,
		marginLeft: 8,
	},
	modalFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#E2E8F0",
	},
	footerButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	clearButton: {
		marginRight: 8,
		borderWidth: 1,
	},
	applyButton: {
		marginLeft: 8,
	},
	footerButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	applyButtonText: {
		color: "#FFFFFF",
	},
	sortDropdown: {
		position: "absolute",
		top: 45,
		right: 0,
		width: 150,
		borderRadius: 8,
		borderWidth: 1,
		zIndex: 1000,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	sortOption: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 12,
	},
	sortOptionText: {
		fontSize: 14,
	},
	pickerModalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 20,
	},
	pickerModalContent: {
		width: "90%",
		borderRadius: 16,
		padding: 16,
		maxHeight: "70%",
	},
	pickerHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	pickerTitle: {
		fontSize: 18,
		fontWeight: "bold",
	},
	pickerControls: {
		flexDirection: "row",
		marginBottom: 20,
		height: 200,
	},
	pickerColumn: {
		flex: 1,
		alignItems: "center",
	},
	pickerLabel: {
		fontSize: 14,
		marginBottom: 8,
	},
	pickerList: {
		width: "100%",
	},
	pickerItem: {
		alignItems: "center",
		justifyContent: "center",
		height: 40,
		margin: 2,
		borderRadius: 8,
	},
	pickerItemText: {
		fontSize: 16,
	},
	pickerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	pickerButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderRadius: 8,
		margin: 4,
	},
});

export default CustomDatePicker;
