import api from "./axiosInstance";
export const getLeadership = async () => {
  const response = await api.get("/api/v1/leadership");
  return response.data;
};
export const getLeadershipById = async (id: string) => {
  const response = await api.get(`/api/v1/leadership/${id}`);
  return response.data;
};
export const createLeadership = async (data: FormData) => {
  const response = await api.post("/api/v1/leadership", data);
  return response.data;
};
export const updateLeadership = async (id: string, data: FormData) => {
  const response = await api.put(`/api/v1/leadership/${id}`, data);
  return response.data;
};
export const deleteLeadership = async (id: string) => {
  const response = await api.delete(`/api/v1/leadership/${id}`);
  return response.data;
};
