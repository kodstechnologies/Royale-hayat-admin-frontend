import api from "./axiosInstance";

const BASE = "/api/v1/international-patient-enquiries";

export type InternationalPatientEnquiry = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  address?: string;
  comments?: string;
  isActive?: boolean;
  isViewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type InternationalPatientListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isViewed?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getAllInternationalPatientEnquiries = async (
  params: InternationalPatientListParams = {}
) => {
  return api.get(BASE, { params });
};

export const getInternationalPatientEnquiryById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};
