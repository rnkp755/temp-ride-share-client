import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext"; // Adjust the import path as needed

// Define types for theme
interface Theme {
	primary: string;
	background: string;
	card: string;
	text: string;
	textSecondary: string;
	border: string;
	notification: string;
	success: string;
	ripple: string;
}

// Define theme context type
interface ThemeContextType {
	theme: Theme;
}

// Define alert types
type AlertType = "success" | "error" | "info";

// Define props for the CustomAlert component
interface CustomAlertProps {
	visible: boolean;
	type?: AlertType;
	message: string;
	duration?: number;
	onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
	visible,
	type = "success",
	message,
	duration = 3000,
	onClose,
}) => {
	// Animation value
	const fadeAnim = React.useRef(new Animated.Value(0)).current;
	const translateY = React.useRef(new Animated.Value(-20)).current;

	// Get theme from context
	const { colors } = useTheme();

	useEffect(() => {
		if (visible) {
			// Fade in and slide down animation
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(translateY, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();

			// Auto hide after duration
			const timeout = setTimeout(() => {
				handleClose();
			}, duration);

			return () => clearTimeout(timeout);
		}
	}, [visible, duration]);

	const handleClose = (): void => {
		// Fade out and slide up animation
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: -20,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			if (onClose) onClose();
		});
	};

	if (!visible) return null;

	// Determine color and icon based on alert type
	let alertColor: string;
	let iconName: string;

	switch (type) {
		case "success":
			alertColor = colors.success;
			iconName = "checkmark-circle";
			break;
		case "error":
			alertColor = colors.notification;
			iconName = "alert-circle";
			break;
		case "info":
		default:
			alertColor = colors.primary;
			iconName = "information-circle";
			break;
	}

	return (
		<View style={styles.alertContainer}>
			<Animated.View
				style={[
					styles.alertBox,
					{
						backgroundColor: colors.card,
						borderColor: alertColor,
						shadowColor: colors.text,
						opacity: fadeAnim,
						transform: [{ translateY: translateY }],
					},
				]}
			>
				<View style={styles.contentRow}>
					<Ionicons
						name={
							iconName as
								| "checkmark-circle"
								| "alert-circle"
								| "information-circle"
						}
						size={24}
						color={alertColor}
					/>
					<Text style={[styles.message, { color: colors.text }]}>
						{message}
					</Text>
					<TouchableOpacity
						onPress={handleClose}
						style={styles.closeButton}
					>
						<Ionicons
							name="close"
							size={20}
							color={colors.textSecondary}
						/>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	alertContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
		elevation: 5,
		backgroundColor: "rgba(0,0,0,0.1)",
	},
	alertBox: {
		minWidth: 280,
		maxWidth: "80%",
		borderLeftWidth: 4,
		borderRadius: 8,
		padding: 16,
		maxHeight: 200 /* Add this to set a maximum height */,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	contentRow: {
		maxHeight: 180 /* Slightly less than alertBox maxHeight */,
		flexDirection: "row",
		alignItems: "flex-start" /* Change from 'center' to 'flex-start' */,
	},
	message: {
		flex: 1,
		marginHorizontal: 12,
		fontSize: 16,
		flexWrap: "wrap",
	},
	closeButton: {
		padding: 4,
	},
});

export default CustomAlert;
