import api from "./axiosInstance";

export type DepartmentPayload = {
  departmentId: string;
  name: string;
  description: string;
  image?: string;
  subSpecialties: string[];
  isActive?: boolean;
  order?: number;
};

export const createDepartment = async (payload: DepartmentPayload | FormData) => {
  if (payload instanceof FormData) {
    return api.post("/api/v1/departments", payload);
  }
  return api.post("/api/v1/departments", payload);
};

export const getDepartments = async (params: Record<string, string | number | boolean> = {}) => {
  return api.get("/api/v1/departments", { params });
};

export const getDepartmentById = async (id: string) => {
  return api.get(`/api/v1/departments/${id}`);
};

export const updateDepartment = async (id: string, payload: DepartmentPayload | FormData) => {
  return api.put(`/api/v1/departments/${id}`, payload);
};

export const deleteDepartment = async (id: string) => {
  return api.delete(`/api/v1/departments/${id}`);
};

export const getDoctorsByDepartment = async (department: string) => {
  return api.get("/api/v1/doctors", { params: { department } });
};
