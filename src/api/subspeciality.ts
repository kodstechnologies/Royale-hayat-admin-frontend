import api from "./axiosInstance";

const BASE = "/api/v1/subspecialities";

export type CustomSubspecialityDoc = {
  _id: string;
  subHeading?: string;
  arabicSubHeading?: string;
  explanations?: string[];
  arabicExplanations?: string[];
  createdAt?: string;
  updatedAt?: string;

};

export type Subspeciality = {
  _id: string;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  department?: string | { _id?: string; name?: string; arabicName?: string };
  createdAt?: string;
  updatedAt?: string;
  customSubspecialities?: CustomSubspecialityDoc[];
};

export type SubspecialityListItem = {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  departmentId: string;
  departmentName: string;
  createdAt: string;
  updatedAt: string;
};

export type SubspecialityDetail = SubspecialityListItem & {
  customSubspecialities: CustomSubspecialityDoc[];
};

const resolveDepartment = (department: Subspeciality["department"]) => {
  if (department && typeof department === "object") {
    return {
      departmentId: String(department._id ?? ""),
      departmentName: String(department.name ?? department.arabicName ?? ""),
    };
  }
  if (typeof department === "string" && department.trim()) {
    return { departmentId: department.trim(), departmentName: "" };
  }
  return { departmentId: "", departmentName: "" };
};

export const mapApiSubspecialityToListItem = (row: Subspeciality): SubspecialityListItem => {
  const dept = resolveDepartment(row.department);
  return {
    id: String(row._id ?? ""),
    name: String(row.name ?? ""),
    arabicName: String(row.arabicName ?? ""),
    description: String(row.description ?? ""),
    arabicDescription: String(row.arabicDescription ?? ""),
    departmentId: dept.departmentId,
    departmentName: dept.departmentName,
    createdAt: String(row.createdAt ?? ""),
    updatedAt: String(row.updatedAt ?? ""),
  };
};

export const mapApiSubspecialityToDetail = (row: Subspeciality): SubspecialityDetail => ({
  ...mapApiSubspecialityToListItem(row),
  customSubspecialities: Array.isArray(row.customSubspecialities)
    ? row.customSubspecialities
    : [],
});

export type CustomSubspecialityInput = {
  subHeading?: string;
  arabicSubHeading?: string;
  explanations?: string[];
  arabicExplanations?: string[];
};

export type CreateSubspecialityPayload = {
  name: string;
  arabicName: String;
  description: string;
  arabicDescription: String
  customSubspecialities?: (string | CustomSubspecialityInput)[];
};

export type UpdateSubspecialityPayload = {
  name?: string;
  description?: string;
  customSubspecialities?: (string | CustomSubspecialityInput)[] | null;
};

export type SubspecialityListMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export type ListSubspecialitiesParams = {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  sortBy?: "name" | "arabicName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export const createSubspeciality = async (payload: CreateSubspecialityPayload) => {
  return api.post(BASE, payload);
};

export const getSubspecialities = async (params: ListSubspecialitiesParams = {}) => {
  return api.get(BASE, { params });
};

export const getSubspecialityById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const updateSubspeciality = async (id: string, payload: UpdateSubspecialityPayload) => {
  return api.put(`${BASE}/${id}`, payload);
};

export const deleteSubspeciality = async (id: string) => {
  return api.delete(`${BASE}/${id}`);
};

export const fetchAllSubspecialities = async (): Promise<Subspeciality[]> => {
  const limit = 100;
  const aggregated: Subspeciality[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await getSubspecialities({
      page,
      limit,
      sortBy: "name",
      sortOrder: "asc",
    });
    const rows: Subspeciality[] = res?.data?.data ?? [];
    const meta = res?.data?.meta as SubspecialityListMeta | undefined;
    aggregated.push(...rows);
    totalPages = meta?.totalPages ?? 1;
    page += 1;
    if (rows.length === 0) break;
  } while (page <= totalPages);
  return aggregated;
};
