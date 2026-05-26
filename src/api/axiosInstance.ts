import axios from "axios";

const VITE_BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const api = axios.create({
    baseURL: VITE_BACKEND_API_URL,
    withCredentials: true,
});
// RESPONSE INTERCEPTOR
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            // remove broken auth state if any
            localStorage.clear();

            // redirect login
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);
export default api;