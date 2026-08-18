import axios from 'axios';
import { getAnyAuthToken, getUserIdAndType } from '@/lib/auth';
import https from 'https';

async function resolveLocale() {
	return 'en';
}

/**
 * Create an authenticated API instance for client & server requests
 */
export async function useAxios(token?: string) {
	const authToken = token || await getAnyAuthToken();
	const userInfo = await getUserIdAndType();
	const language = await resolveLocale();

	const headers: Record<string, string> = {
		platform: 'web',
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...(authToken && { Authorization: `Bearer ${authToken}` }),
	};

	if (userInfo) {
		headers['user_id'] = String(userInfo.user_id);
		headers['user_type'] = userInfo.user_type;
	}

	const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

	const api = axios.create({
		baseURL,
		timeout: 30000,
		headers,
		...(process.env.NEXT_PUBLIC_HTTPS_AGENT_V6_ENABLED === 'true' && {
			httpsAgent: new https.Agent({
				family: 6,
			}),
		}),
		withCredentials: true,
	});

	// Request interceptor to handle FormData
	api.interceptors.request.use(
		(config) => {
			if (config.data instanceof FormData) {
				delete config.headers['Content-Type'];
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	// Response interceptor with auto 401 token refresh retry
	api.interceptors.response.use(
		(response) => response?.data,
		async (error) => {
			const originalRequest = error?.config || error?.response?.config;
			const status = error?.status || error?.response?.status;

			// If 401 Unauthorized and not already retried
			if (status === 401 && originalRequest && !originalRequest._retry) {
				originalRequest._retry = true;

				try {
					const refreshRes = await axios.post(
						`${baseURL}/auth/refresh-token`,
						{},
						{ withCredentials: true }
					);

					const newAccessToken =
						refreshRes.data?.data?.accessToken ||
						refreshRes.data?.accessToken;

					if (newAccessToken) {
						if (typeof window !== 'undefined') {
							localStorage.setItem('accessToken', newAccessToken);
						}

						originalRequest.headers = originalRequest.headers || {};
						originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

						const retryRes = await axios(originalRequest);
						return retryRes?.data || retryRes;
					}
				} catch (refreshErr) {
					if (typeof window !== 'undefined') {
						localStorage.removeItem('accessToken');
						window.location.href = '/login';
					}
				}
			}

			return Promise.reject(error?.response || error);
		}
	);

	return api;
}