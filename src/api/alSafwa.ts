import api from "./axiosInstance";

const BASE = "/api/v1/al-safwa";

export type AlSafwaEnrollment = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  notes: string;
  isActive?: boolean;
  isViewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AlSafwaListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isViewed?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getAllAlSafwaEnrollments = async (
  params: AlSafwaListParams = {}
) => {
  return api.get(BASE, { params });
};

export const getAlSafwaEnrollmentById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const createAlSafwaEnrollment = async (payload: {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  notes: string;
}) => {
  return api.post(BASE, payload);
};
