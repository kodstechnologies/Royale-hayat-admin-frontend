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

// ——— User management ———

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSubadminPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
};

export const getAllUsers = async () => {
  const response = await api.get<ApiResponse<AdminUser[]>>("/api/v1/auth/users");
  return response.data;
};

export const createSubadmin = async (payload: CreateSubadminPayload) => {
  const response = await api.post<ApiResponse<AdminUser>>(
    "/api/v1/auth/subadmin",
    payload,
  );
  return response.data;
};

export const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const response = await api.put<ApiResponse<AdminUser>>(
    `/api/v1/auth/users/${id}`,
    payload,
  );
  return response.data;
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  const response = await api.patch<ApiResponse<AdminUser>>(
    `/api/v1/auth/users/${id}/status`,
    { isActive },
  );
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete<ApiResponse<null>>(`/api/v1/auth/users/${id}`);
  return response.data;
};