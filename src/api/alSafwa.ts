import api from "./axiosInstance";

const BASE = "/api/v1/al-safwa";

export type AlSafwaEnrollment = {
  _id: string;
  firstName: string;
  familyName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  mobile: string;
  email: string;
  preferredAppointmentDate: string;
  previousMedicalCheckup: "less_than_1_year" | "more_than_1_year" | "never";
  diabetes: "yes" | "no" | "dont_know";
  highCholesterol: "yes" | "no" | "dont_know";
  bronchialAsthma: "yes" | "no" | "dont_know";
  hypertension: "yes" | "no" | "dont_know";
  heartDisease: "yes" | "no" | "dont_know";
  overweightObesity: "yes" | "no" | "dont_know";
  smoker: "yes" | "no";
  alcohol: "yes" | "no";
  isActive?: boolean;
  isViewed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AlSafwaListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isViewed?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const getAllAlSafwaEnrollments = async (
  params: AlSafwaListParams = {}
) => {
  return api.get(BASE, { params });
};

export const getAlSafwaEnrollmentById = async (id: string) => {
  return api.get(`${BASE}/${id}`);
};

export const createAlSafwaEnrollment = async (payload: {
  firstName: string;
  familyName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  mobile: string;
  email: string;
  preferredAppointmentDate: string;
  previousMedicalCheckup: "less_than_1_year" | "more_than_1_year" | "never";
  diabetes: "yes" | "no" | "dont_know";
  highCholesterol: "yes" | "no" | "dont_know";
  bronchialAsthma: "yes" | "no" | "dont_know";
  hypertension: "yes" | "no" | "dont_know";
  heartDisease: "yes" | "no" | "dont_know";
  overweightObesity: "yes" | "no" | "dont_know";
  smoker: "yes" | "no";
  alcohol: "yes" | "no";
}) => {
  return api.post(BASE, payload);
};
