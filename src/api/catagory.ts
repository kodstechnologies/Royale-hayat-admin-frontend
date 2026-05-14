import api from "./axiosInstance";

const BASE = "/api/v1/catagories";

export type Catagory = {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  arabicName: string;
};

export type CatagoryListMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export type CreateCatagoryPayload = {
  name: string;
  arabicName: string;
};

export type UpdateCatagoryPayload = {
  name: string;
  arabicName: string;
};

export type ListCatagoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export const createCatagory = async (payload: CreateCatagoryPayload) => {
  return api.post(BASE, payload);
};

export const getCatagories = async (params: ListCatagoriesParams = {}) => {
  return api.get(BASE, { params });
};

/** Loads every category (paginates with limit 100 — backend Joi max per request). */
export const fetchAllCatagories = async (): Promise<Catagory[]> => {
  const limit = 100;
  const aggregated: Catagory[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await getCatagories({
      page,
      limit,
      sortBy: "name",
      sortOrder: "asc",
    });
    const rows: Catagory[] = res?.data?.data ?? [];
    const meta = res?.data?.meta as CatagoryListMeta | undefined;
    aggregated.push(...rows);
    totalPages = meta?.totalPages ?? 1;
    page += 1;
    if (rows.length === 0) break;
  } while (page <= totalPages);
  return aggregated;
};

export const getCatagoryById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const updateCatagory = async (id: string, payload: UpdateCatagoryPayload) => {
  return api.put(`${BASE}/${id}`, payload);
};

export const deleteCatagory = async (id: string) => {
  return api.delete(`${BASE}/${id}`);
};
