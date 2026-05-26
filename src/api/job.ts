import api from "./axiosInstance";

const BASE = "/api/v1/jobs";

export interface CreateJobPayload {
  jobId?: string;
  title: string;
  description: string;
  classification: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  responsibilities: string[];
  requirements: string[];
  arabicTitle?: string;
  arabicDescription?: string;
  arabicResponsibilities?: string[];
  arabicRequirements?: string[];
  languages?: string[];
  closingDate?: string;
  isActive?: boolean;
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  salary?: string;
  contactEmail?: string;
}

export interface GetJobsParams {
  page?: number;
  limit?: number;
  classification?: string;
  location?: string;
  type?: string;
  urgency?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const createJob = async (payload: CreateJobPayload) => {
  return api.post(`${BASE}`, payload);
};

export const getAllJobs = async (params: GetJobsParams = {}) => {
  return api.get(`${BASE}`, { params });
};

export const getJobById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const updateJob = async (id: string, payload: UpdateJobPayload) => {
  return api.put(`${BASE}/${id}`, payload);
};

export const deleteJob = async (id: string) => {
  return api.delete(`${BASE}/${id}`);
};

export const getDepartments = async () => {
  return api.get(`${BASE}/departments`);
};

export const getLocations = async () => {
  return api.get(`${BASE}/locations`);
};

export const getTypes = async () => {
  return api.get(`${BASE}/types`);
};

// ── Job Applications ────────────────────────────────────────────────────────

const APP_BASE = "/api/v1/job-applications";

export const getApplicationsByJobId = async (jobId: string) => {
  return api.get(`${APP_BASE}/job/${jobId}`);
};

export const getJobApplicationById = async (id: string) => {
  return api.get(`${APP_BASE}/${id}`);
};

export const applyForJob = async (formData: FormData) => {
  return api.post(`${APP_BASE}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
