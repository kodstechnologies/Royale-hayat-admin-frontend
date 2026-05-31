import type {
  AppointmentListFilters,
  AppointmentRequestType,
} from "@/api/appointmentRequest";
import { APPOINTMENT_REQUEST_TYPE } from "@/api/appointmentRequest";

export { APPOINTMENT_REQUEST_TYPE };
export type { AppointmentRequestType };

export type AppointmentRequestItem = {
  id: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  department?: string;
  doctorName?: string;
  symptoms?: string;
  status: "pending" | "confirmed" | "cancelled";
  requestType?: AppointmentRequestType;
  preferredDate?: string;
  additionalNotes?: string;
  comments?: string;
  timeSlot?: { period: string; time: string };
  isViewed?: boolean;
};

export const getRequestTypeLabel = (requestType?: AppointmentRequestType) => {
  if (requestType === APPOINTMENT_REQUEST_TYPE.FIRST_TIME_VISITOR) {
    return "First Time Visitor";
  }
  if (requestType === APPOINTMENT_REQUEST_TYPE.DOCTOR_UNAVAILABILITY) {
    return "Doctor Unavailability";
  }
  return "Appointment Request";
};

export type BookingItem = {
  id: string;
  civilId: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  passportNumber: string;
  symptoms?: string;
  department?: string;
  doctorName?: string;
  appointmentDate?: string;
  timeSlot?: string;
  isViewed?: boolean;
};

export type AppointmentListFiltersState = {
  fromDate: string;
  toDate: string;
  department: string;
  doctor: string;
  status: string;
};

export type BookingListFiltersState = Omit<
  AppointmentListFiltersState,
  "status"
>;

export const defaultRequestFilters: AppointmentListFiltersState = {
  fromDate: "",
  toDate: "",
  department: "",
  doctor: "",
  status: "",
};

export const defaultBookingFilters: BookingListFiltersState = {
  fromDate: "",
  toDate: "",
  department: "",
  doctor: "",
};

const formatDob = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().split("T")[0];
};

const formatSymptoms = (symptoms?: string[] | string) => {
  if (!symptoms) return "";
  return Array.isArray(symptoms) ? symptoms.join(", ") : symptoms;
};

const mapApiStatusToUi = (
  status?: string,
): AppointmentRequestItem["status"] => {
  if (status === "accepted") return "confirmed";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

export const mapUiStatusToApi = (
  status: string,
): AppointmentListFilters["status"] => {
  if (!status) return "all";
  if (status === "confirmed") return "accepted";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

export const mapRequestFromApi = (
  row: Record<string, unknown>,
): AppointmentRequestItem => ({
  id: String(row._id ?? row.id ?? ""),
  fullName: String(row.fullname ?? row.fullName ?? ""),
  phone: String(row.phone ?? row.mobile_number ?? ""),
  dateOfBirth: formatDob(String(row.dob ?? row.dateOfBirth ?? "")),
  gender: String(row.gender ?? ""),
  department: row.department ? String(row.department) : undefined,
  doctorName: row.doctor ? String(row.doctor) : undefined,
  symptoms: formatSymptoms(row.symptoms as string[] | string | undefined),
  status: mapApiStatusToUi(row.status ? String(row.status) : undefined),
  preferredDate: row.date ? String(row.date) : undefined,
  timeSlot: row.time
    ? { period: "", time: String(row.time) }
    : undefined,
  additionalNotes: row.additionalNotes
    ? String(row.additionalNotes)
    : undefined,
  comments: row.note ? String(row.note) : undefined,
  requestType: row.requestType
    ? (String(row.requestType) as AppointmentRequestType)
    : undefined,
  isViewed: row.isViewed === true,
});

export const mapBookingFromApi = (row: Record<string, unknown>): BookingItem => ({
  id: String(row._id ?? row.id ?? ""),
  civilId: String(row.national_id ?? row.civilId ?? ""),
  fullName: String(row.fullname ?? row.fullName ?? ""),
  dateOfBirth: formatDob(String(row.dob ?? row.dateOfBirth ?? "")),
  nationality: String(row.nationality ?? ""),
  gender: String(row.gender ?? ""),
  passportNumber: String(row.passportNumber ?? ""),
  symptoms: formatSymptoms(row.symptoms as string[] | string | undefined),
  department: row.department ? String(row.department) : undefined,
  doctorName: row.doctor ? String(row.doctor) : undefined,
  appointmentDate: row.date ? String(row.date) : undefined,
  timeSlot: row.time ? String(row.time) : undefined,
  isViewed: row.isViewed === true,
});

export const formatTableDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getAgeFromDob = (dateOfBirth: string) => {
  if (!dateOfBirth) return "—";
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
