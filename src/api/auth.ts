import api from "./axiosInstance";

export const login = async (email: string, password: string) => {
  const response = await api.post("/api/v1/auth/login", { email, password }, { withCredentials: true });
  return response.data;
};

export const sendOtp = async (email: string) => {
  const response = await api.post("/api/v1/auth/send-otp", { email }, { withCredentials: true });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post("/api/v1/auth/verify-otp", { email, otp }, { withCredentials: true });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
  return response.data;
};