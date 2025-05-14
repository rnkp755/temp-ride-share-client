import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import RenderTrips from "../components/RenderTrips";

export default function Index() {
	// Changed from HomeScreen to Index for default export
	const { colors } = useTheme();
	const router = useRouter();

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

			<RenderTrips />
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
});
