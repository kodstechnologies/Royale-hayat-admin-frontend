import api from "./axiosInstance";

// export const login = async (email: string, password: string) => {
//   const response = await api.post("/api/v1/auth/login", { email, password }, { withCredentials: true });
//   return response.data;
// };

// export const sendOtp = async (email: string) => {
//   const response = await api.post("/api/v1/auth/send-otp", { email }, { withCredentials: true });
//   return response.data;
// };

// export const verifyOtp = async (email: string, otp: string) => {
//   const response = await api.post("/api/v1/auth/verify-otp", { email, otp }, { withCredentials: true });
//   return response.data;
// };

// export const logout = async () => {
//   const response = await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
//   return response.data;
// };



//----------------------
// auth.ts


export const sendOtp = async (email: string) => {
  const response = await api.post(
    "/api/v1/auth/send-otp",
    { email }
  );

  return response.data;
};

export const verifyOtp = async (
  email: string,
  otp: string
) => {

  const response = await api.post(
    "/api/v1/auth/verify-otp",
    { email, otp }
  );

  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/api/v1/auth/login", { email, password });
  return response.data;
};

export const getMe = async () => {

  const response = await api.get(
    "/api/v1/auth/me"
  );

  return response.data;
};

export const logout = async () => {

  const response = await api.post(
    "/api/v1/auth/logout"
  );

  return response.data;
};

export type ResetPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await api.post("/api/v1/auth/reset-password", payload);
  return response.data;
};