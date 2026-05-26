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
  console.log(payload,"------------");
  return api.post("/api/v1/doctors", payload);
};

export const editDoctor = async (id: string, payload: DoctorPayload | FormData) => {
  return api.put(`/api/v1/doctors/${id}`, payload);
};

export const deleteDoctor = async (id: string) => {
  return api.delete(`/api/v1/doctors/${id}`);
};

export type FeaturedDoctorPayload = {
  doctor: string;
};

export type ApiFeaturedDoctorRecord = {
  _id: string;
  doctor: DoctorPayload & {
    _id: string;
    department?: string | { _id?: string; name?: string };
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type FeaturedDoctorsResponse = {
  success: boolean;
  count: number;
  data: ApiFeaturedDoctorRecord[];
};

export type FeaturedDoctorResponse = {
  success: boolean;
  message: string;
  data: ApiFeaturedDoctorRecord;
};

export const getFeaturedDoctors = async () => {
  const response = await api.get<FeaturedDoctorsResponse>("/api/v1/featured-doctors");
  return response.data;
};

export const createFeaturedDoctor = async (payload: FeaturedDoctorPayload) => {
  const response = await api.post<FeaturedDoctorResponse>("/api/v1/featured-doctors", payload);
  return response.data;
};

export const updateFeaturedDoctor = async (id: string, payload: FeaturedDoctorPayload) => {
  const response = await api.put<FeaturedDoctorResponse>(`/api/v1/featured-doctors/${id}`, payload);
  return response.data;
};