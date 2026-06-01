import api from "./axiosInstance";

export type DashboardStats = {
  appointmentRequests: number;
  medicalRecordRequests: number;
  feedbacksAndReviews: {
    total: number;
    doctorFeedback: number;
    hospitalFeedback: number;
  };
  averageRatings: {
    overall: number;
    doctorFeedback: number;
    hospitalFeedback: number;
  };
};

export type WeeklyAppointmentDay = {
  day: string;
  requests: number;
};

export type CurrentWeekAppointmentRequests = {
  weekStart: string;
  weekEnd: string;
  total: number;
  dailyBreakdown: WeeklyAppointmentDay[];
};

export type MonthlyAppointmentMonth = {
  month: string;
  year: number;
  requests: number;
};

export type MonthlyAppointmentRequests = {
  rangeStart: string;
  rangeEnd: string;
  months: number;
  total: number;
  monthlyBreakdown: MonthlyAppointmentMonth[];
};

export type FeedbackStarBreakdownItem = {
  stars: number;
  rating: string;
  count: number;
  percentage: string;
};

export type FeedbackStarStats = {
  doctorFeedback: {
    total: number;
    breakdown: FeedbackStarBreakdownItem[];
  };
  hospitalFeedback: {
    total: number;
    breakdown: FeedbackStarBreakdownItem[];
  };
  combined: {
    total: number;
    breakdown: FeedbackStarBreakdownItem[];
  };
};

export type DoctorsByDepartmentItem = {
  departmentId: string | null;
  departmentCode: string | null;
  dept: string;
  arabicName?: string | null;
  doctors: number;
  percent: number;
};

export type DoctorsByDepartment = {
  totalDoctors: number;
  breakdown: DoctorsByDepartmentItem[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getDashboardStats = async () => {
  const response = await api.get<ApiResponse<DashboardStats>>("/api/v1/dashboard/stats");
  return response.data;
};

export const getCurrentWeekAppointmentRequests = async () => {
  const response = await api.get<ApiResponse<CurrentWeekAppointmentRequests>>(
    "/api/v1/dashboard/current-week-appointment-requests"
  );
  return response.data;
};

export const getMonthlyAppointmentRequests = async (months = 7) => {
  const response = await api.get<ApiResponse<MonthlyAppointmentRequests>>(
    "/api/v1/dashboard/monthly-appointment-requests",
    { params: { months } }
  );
  return response.data;
};

export const getFeedbackStarStats = async () => {
  const response = await api.get<ApiResponse<FeedbackStarStats>>(
    "/api/v1/dashboard/feedback-star-stats"
  );
  return response.data;
};

export const getDoctorsCountByDepartment = async () => {
  const response = await api.get<ApiResponse<DoctorsByDepartment>>(
    "/api/v1/dashboard/doctors-by-department"
  );
  return response.data;
};

export type SidebarCounts = {
  enquiries: number;
  doctorFeedbacks: number;
  hospitalFeedbacks: number;
  jobApplications: number;
  medicalRecordRequests: number;
  appointmentRequests: number;
  appointmentBookingRecords: number;
  alSafwaEnrollments: number;
};

export const getSidebarCounts = async () => {
  const response = await api.get<ApiResponse<SidebarCounts>>(
    "/api/v1/dashboard/sidebar-counts"
  );
  return response.data;
};