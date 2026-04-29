import api from "./axiosInstance";

export type DoctorPayload = {
  doctorId?: string;
  name: string;
  specialty: string;
  department?: string;
  title: string;
  bio: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  image?: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  isActive: boolean;
};

export const getDoctors = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get("/api/v1/doctors", { params });
};

export const getDoctorById = async (id: string) => {
  return api.get(`/api/v1/doctors/${id}`);
};

export const createDoctor = async (payload: DoctorPayload | FormData) => {
  return api.post("/api/v1/doctors", payload);
};

export const editDoctor = async (id: string, payload: DoctorPayload) => {
  return api.put(`/api/v1/doctors/${id}`, payload);
};

export const deleteDoctor = async (id: string) => {
  return api.delete(`/api/v1/doctors/${id}`);
};