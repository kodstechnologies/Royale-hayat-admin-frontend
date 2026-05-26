import api from "./axiosInstance";

export type ApiAchievement = {
  _id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  title: string;
  achievements: string;
  image?: string;
  visibilityStatus: "show" | "hide";
  createdAt: string;
  updatedAt?: string;
};

export type GetAchievementsParams = {
  visibilityStatus?: "show" | "hide";
  page?: number;
  limit?: number;
};

export const getAllAchievements = async (params: GetAchievementsParams = {}) => {
  const response = await api.get("/api/v1/achievements", {
    params: { page: 1, limit: 100, ...params },
  });
  return response.data;
};

export const getAchievementById = async (id: string) => {
  const response = await api.get(`/api/v1/achievements/${id}`);
  return response.data;
};

export const createAchievement = async (data: FormData) => {
  const response = await api.post("/api/v1/achievements", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateAchievement = async (id: string, data: FormData) => {
  const response = await api.put(`/api/v1/achievements/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteAchievement = async (id: string) => {
  const response = await api.delete(`/api/v1/achievements/${id}`);
  return response.data;
};
