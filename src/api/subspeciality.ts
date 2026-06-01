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
  arabicDescription: string
  createdAt?: string;
  updatedAt?: string;
  /** Populated from API as objects; may be absent. */
  customSubspecialities?: CustomSubspecialityDoc[];
};

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
  sortBy?: "name" | "createdAt" | "updatedAt";
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
