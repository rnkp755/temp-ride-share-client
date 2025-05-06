import axios from "axios";
import { SERVER_URL } from "./config";
import * as SecureStore from "expo-secure-store";

// Create the Axios instance
const API = axios.create({
	baseURL: SERVER_URL,
	withCredentials: true,
});
// Function to get the access token from SecureStore
const fetchUserToken = async (): Promise<string | null> => {
	try {
		const token = await SecureStore.getItemAsync("accessToken");
		return token;
	} catch (error) {
		console.error("Error fetching user token:", error);
		return null;
	}
};

// Set the Authorization header with the fetched token
const setAuthorizationHeader = async () => {
	const token = await fetchUserToken();
	if (token) {
		API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete API.defaults.headers.common["Authorization"]; // Remove the header if no token is found
	}
};

// Intercept all requests to set the Authorization header before sending any request
API.interceptors.request.use(
	async (config) => {
		await setAuthorizationHeader(); // Ensure token is set before request
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Export the API instance
export default API;
