import api from "./axiosInstance";

const SUBADMIN_BASE = "/api/v1/auth/subadmin";

export type CreateSubadminPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
};

export const createSubadmin = async (payload: CreateSubadminPayload) => {
  const response = await api.post(SUBADMIN_BASE, payload);
  return response.data;
};
