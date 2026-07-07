import axios from 'axios';
import { getAnyAuthToken, getUserIdAndType } from '@/lib/auth';
import https from 'https';

async function resolveLocale() {
	return 'en';
}

/**
 * Create an authenticated API instance for server-side requests
 * This should be used in server components and server actions
 */
export async function useAxios(token?: string) {
	const authToken = token || await getAnyAuthToken();
	const userInfo = await getUserIdAndType();
	const language = await resolveLocale();
	// console.log(authToken)

	const headers: Record<string, string> = {
		platform: 'web',
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...(authToken && { Authorization: `Bearer ${authToken}` }),
	};

	// Add user_id and user_type headers if user is authenticated
	if (userInfo) {
		headers['user_id'] = String(userInfo.user_id);
		headers['user_type'] = userInfo.user_type;
	}

	const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

	const api = axios.create({
		baseURL,
		timeout: 30000, // 30 seconds - prevents indefinite hanging
		headers,
		...(process.env.NEXT_PUBLIC_HTTPS_AGENT_V6_ENABLED === 'true' && {
			httpsAgent: new https.Agent({
				family: 6, // 🔥 THIS is the fix
			}),
		}),
		withCredentials: true,
		// maxBodyLength: Infinity, // Remove body size limit for file uploads
		// maxContentLength: Infinity, // Remove content size limit for file uploads
	});

	// Request interceptor to handle FormData
	api.interceptors.request.use(
		(config) => {
			// If data is FormData, remove Content-Type header to let browser set it with boundary
			if (config.data instanceof FormData) {
				delete config.headers['Content-Type'];
			}
			return config;
		},
		(error) => {
			return Promise.reject(error)
		}
	);

	// Response interceptor
	api.interceptors.response.use(
		(response) => response?.data,
		(error) => {
			return Promise.reject(error?.response || error);
		}
	);
	return api;
}