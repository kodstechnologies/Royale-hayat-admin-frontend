import api from "./axiosInstance";

const BASE = "/api/v1/appointment";


// ================= GET APPOINTMENT REQUESTS =================

export const getAppointmentRequests = async (
  page = 1,
  limit = 10,
  status?: "received" | "accepted" | "cancelled"
) => {

  const params: Record<string, string | number> = {
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  if (status) {
    params.status = status;
  }

  const response = await api.get(
    BASE,
    { params }
  );

  return response.data;
};


// ================= GET APPOINTMENT REQUEST BY ID =================

export const getAppointmentRequestById = async (
  id: string
) => {

  const response = await api.get(
    `${BASE}/${id}`
  );

  return response.data;
};


// ================= ACCEPT REQUEST =================

export const acceptRequest = async (
  id: string
) => {

  const response = await api.patch(
    `${BASE}/accept/${id}`
  );

  return response.data;
};


// ================= CANCEL REQUEST =================

export const cancelRequest = async (
  id: string
) => {

  const response = await api.patch(
    `${BASE}/cancel/${id}`
  );

  return response.data;
};