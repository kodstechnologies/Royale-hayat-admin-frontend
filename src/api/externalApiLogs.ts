import api from "./axiosInstance";

const BASE = "/api/v1/external-api-logs";

export type ExternalApiLogFilters = {
  page?: number;
  limit?: number;
  service?: "identity" | "royalhayat";
  civilId?: string;
  patientId?: string;
  success?: "true" | "false";
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type ExternalApiLogRecord = {
  _id: string;
  service: "identity" | "royalhayat";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  civilId?: string;
  patientId?: string;
  requestData?: any;
  responseData?: any;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
  responseTime?: number;
  clientIp?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExternalApiLogListMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ExternalApiLogStats = {
  total: number;
  successCount: number;
  failureCount: number;
  identityCount: number;
  royalhayatCount: number;
};

export const getAllExternalApiLogs = async (params: ExternalApiLogFilters = {}) => {
  const response = await api.get(BASE, { params });
  return response.data as {
    success: boolean;
    message: string;
    data: ExternalApiLogRecord[];
    meta: ExternalApiLogListMeta;
  };
};

export const getExternalApiLogById = async (id: string) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ExternalApiLogRecord;
  };
};

export const getExternalApiLogsByCivilId = async (civilId: string) => {
  const response = await api.get(`${BASE}/civil/${encodeURIComponent(civilId)}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ExternalApiLogRecord[];
  };
};

export const getExternalApiLogsByPatientId = async (patientId: string) => {
  const response = await api.get(`${BASE}/patient/${encodeURIComponent(patientId)}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ExternalApiLogRecord[];
  };
};

export const getExternalApiLogStats = async () => {
  const response = await api.get(`${BASE}/stats`);
  return response.data as {
    success: boolean;
    message: string;
    data: ExternalApiLogStats;
  };
};
