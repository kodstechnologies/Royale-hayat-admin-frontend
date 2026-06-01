import axios from "axios";

const VITE_BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const api = axios.create({
    baseURL: VITE_BACKEND_API_URL,
    withCredentials: true,
});

const ACCESS_TOKEN_KEY = "rhh_admin_access_token";

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const AUTH_PATHS_NO_SESSION_REDIRECT = [
    "/api/v1/auth/login",
    "/api/v1/auth/send-otp",
    "/api/v1/auth/verify-otp",
    "/api/v1/auth/reset-password",
];

const shouldRedirectToLoginOn401 = (requestUrl?: string) => {
    const hasToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!hasToken) return false;

    const url = requestUrl ?? "";
    const isAuthFlowRequest = AUTH_PATHS_NO_SESSION_REDIRECT.some((path) =>
        url.includes(path),
    );
    return !isAuthFlowRequest;
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            shouldRedirectToLoginOn401(error.config?.url)
        ) {
            localStorage.clear();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    },
);
export default api;