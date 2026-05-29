import api from "./axiosInstance";

const REQUESTS_BASE = "/api/v1/appointment-requests";
const BOOKINGS_BASE = "/api/v1/appointment-booking-records";

export type AppointmentListFilters = {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  fromTime?: string;
  toTime?: string;
  department?: string;
  doctor?: string;
  /** `pending` maps to API `received`; use `all` to fetch every status */
  status?: "pending" | "received" | "accepted" | "cancelled" | "all";
};

const buildListParams = (
  page = 1,
  limit = 10,
  filters: AppointmentListFilters = {},
) => {
  const params: Record<string, string | number> = { page, limit };

  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.fromTime) params.fromTime = filters.fromTime;
  if (filters.toTime) params.toTime = filters.toTime;
  if (filters.department) params.department = filters.department;
  if (filters.doctor) params.doctor = filters.doctor;
  if (filters.status) params.status = filters.status;

  return params;
};

// ================= GET APPOINTMENT REQUESTS =================

export const getAppointmentRequests = async (
  page = 1,
  limit = 10,
  filters: AppointmentListFilters = {},
) => {
  const response = await api.get(REQUESTS_BASE, {
    params: buildListParams(page, limit, filters),
  });

  return response.data;
};

// ================= GET APPOINTMENT BOOKINGS =================

export const getAppointmentBookings = async (
  page = 1,
  limit = 10,
  filters: Omit<AppointmentListFilters, "status"> = {},
) => {
  const response = await api.get(BOOKINGS_BASE, {
    params: buildListParams(page, limit, filters),
  });

  return response.data;
};

// ================= GET APPOINTMENT REQUEST BY ID =================

export const getAppointmentRequestById = async (id: string) => {
  const response = await api.get(`${REQUESTS_BASE}/${id}`);
  return response.data;
};

// ================= ACCEPT REQUEST =================

export const acceptRequest = async (id: string, note?: string) => {
  const response = await api.patch(`${REQUESTS_BASE}/accept/${id}`, {
    note: note?.trim() || undefined,
  });
  return response.data;
};

// ================= CANCEL REQUEST =================

export const cancelRequest = async (id: string, note?: string) => {
  const response = await api.patch(`${REQUESTS_BASE}/cancel/${id}`, {
    note: note?.trim() || undefined,
  });
  return response.data;
};
