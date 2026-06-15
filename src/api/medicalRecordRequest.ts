import api from "./axiosInstance";

const BASE = "/api/v1/medical-record-requests";

export type MedicalRecordRequestsListMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  counts?: {
    total: number;
    pending: number;
    received: number;
  };
};

export type GetMedicalRecordRequestsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "pending" | "received";
};

type MedicalRecordRequestsListResponse = {
  success: boolean;
  message?: string;
  data: unknown[];
  meta?: MedicalRecordRequestsListMeta;
};

export const getAllMedicalRequests = async (
  params: GetMedicalRecordRequestsParams = {},
): Promise<MedicalRecordRequestsListResponse> => {
  const response = await api.get(`${BASE}/all`, { params });
  return response.data;
};

export const GetMedicalRequestById = async (id: string) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export type ShareViaMailPayload = {
  emailId: string;
  languages: ("en" | "ar")[];
};

export const ShareViaMail = async (id: string, payload: ShareViaMailPayload) => {
  const response = await api.post(`${BASE}/share-via-email/${id}`, payload);
  return response.data;
};

export const deleteMedicalRecordRequest = async (id: string) => {
  const response = await api.delete(`${BASE}/delete/${id}`);
  return response.data;
};
