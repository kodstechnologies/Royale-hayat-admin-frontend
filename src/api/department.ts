import api from "./axiosInstance";
export type Department = {
  _id: string;
  departmentId?: string;
  name?: string;
  arabicName?: string;
  description?: string;
  arabicDescription?: string;
  catagory?: string | any;
  subspecialities?: any[];
  image?: string;
  subSpecialties?: string[];
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  customExplainantions?: any[];
};
export type DepartmentPayload = {
  departmentId: string;
  name: string;
  description: string;
  catagory?: string;
  subspecialities?: string[];
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

export type DepartmentListItem = {
  _id: string;
  departmentId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  order: number;
};

export type DepartmentDetail = DepartmentListItem & {
  customExplainantions?: {
    _id?: string;
    id?: string;
    subHeading?: string;
    arabicSubHeading?: string;
    explaination?: string[];
    arabicExplaination?: string[];
  }[];
};

const resolveCategoryName = (catagory: unknown): string => {
  if (catagory && typeof catagory === "object" && "name" in catagory) {
    const name = (catagory as { name?: string }).name;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  if (typeof catagory === "string" && catagory.trim()) return catagory.trim();
  return "Clinical Speciality";
};

export const mapApiDepartmentToListItem = (row: Department): DepartmentListItem => ({
  _id: String(row._id ?? ""),
  departmentId: String(row.departmentId ?? ""),
  name: String(row.name ?? ""),
  nameAr: String(row.arabicName ?? row.name ?? ""),
  description: String(row.description ?? ""),
  descriptionAr: String(row.arabicDescription ?? row.description ?? ""),
  image: row.image,
  category: resolveCategoryName(row.catagory),
  createdAt: String(row.createdAt ?? ""),
  updatedAt: String(row.updatedAt ?? ""),
  isActive: row.isActive !== false,
  order: typeof row.order === "number" ? row.order : 0,
});

export const mapApiDepartmentToDetail = (row: Department): DepartmentDetail => ({
  ...mapApiDepartmentToListItem(row),
  customExplainantions: Array.isArray(row.customExplainantions)
    ? row.customExplainantions
    : [],
});

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
