import api from "./axiosInstance";

export const getAllEnquiries = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get("/api/v1/enquiries", { params });
};

