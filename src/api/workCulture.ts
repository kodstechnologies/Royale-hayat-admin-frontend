import api from "./axiosInstance";

export const getWorkCulture = async () => {
  const response = await api.get("/api/v1/work-culture");
  return response.data;
};
export const postWorkCulture = async (data: object) => {
  const response = await api.post("/api/v1/work-culture", data);
  return response.data;
};
export const deleteWorkCulture = async (id: String) => {
  const response = await api.delete(`/api/v1/work-culture/${id}`);
  return response.data;
};
export const updateWorkCulture = async (id: String, data: object) => {
  const response = await api.put(`/api/v1/work-culture/${id}`, data);
  return response.data;
};
export const getWorkCultureById = async (id: String) => {
  const response = await api.get(`/api/v1/work-culture/${id}`);
  return response.data;
};