import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import CustomInput from "../components/CustomInput";
import Button from "../components/Button";
import { emailPlaceholder } from "@/config";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [emailDomain, setEmailDomain] = useState("@gmail.com");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { colors } = useTheme();

	const handleSubmit = async () => {
		setError("");
		setLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const fullEmail = email + emailDomain;

			// Mock validation
			if (fullEmail) {
				router.push("/auth/reset-password");
			} else {
				setError("Please enter a valid email");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>
					Forgot Password?
				</Text>
				<Text
					style={[styles.subtitle, { color: colors.textSecondary }]}
				>
					Enter your email to reset your password
				</Text>
			</View>

			<View style={styles.form}>
				<CustomInput
					label="Email"
					placeholder={emailPlaceholder}
					value={email}
					onChangeText={setEmail}
					isEmail
					emailDomain={emailDomain}
					onEmailDomainChange={setEmailDomain}
				/>

				{error ? (
					<Text
						style={[styles.error, { color: colors.notification }]}
					>
						{error}
					</Text>
				) : null}

				<Button
					title="Send Reset Link"
					onPress={handleSubmit}
					loading={loading}
					style={styles.button}
				/>

				<Button
					title="Back to Login"
					onPress={() => router.back()}
					variant="secondary"
					style={styles.button}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	header: {
		marginTop: 60,
		marginBottom: 48,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
	},
	form: {
		gap: 16,
	},
	error: {
		fontSize: 14,
		textAlign: "center",
	},
	button: {
		marginTop: 8,
	},
});
