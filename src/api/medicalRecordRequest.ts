import api from "./axiosInstance";

const BASE = "/api/v1/medical-record-requests";

// ================= GET ALL MEDICAL REQUESTS =================

export const getAllMedicalRequests = async () => {

  const response = await api.get(
    `${BASE}/all`
  );

  return response.data;
};

// ================= GET MEDICAL REQUEST BY ID =================

export const GetMedicalRequestById = async (
  id: string
) => {

  const response = await api.get(
    `${BASE}/${id}`
  );

  return response.data;
};

export const ShareViaMail = async (id: string, emailId: string) => {
  const response = await api.post(`${BASE}/share-via-email/${id}`, { emailId });
  return response.data;
};

export const deleteMedicalRecordRequest = async (id: string) => {
  const response = await api.delete(`${BASE}/delete/${id}`);
  return response.data;
};