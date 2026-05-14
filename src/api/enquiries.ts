import api from "./axiosInstance";
const BASE = "/api/v1/enquiries";

export const getAllEnquiries = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get(`${BASE}`, { params });
};

export const getEnquiryById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};