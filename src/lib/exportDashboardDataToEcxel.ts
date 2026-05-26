import * as XLSX from "xlsx";
import type {
  DashboardStats,
  WeeklyAppointmentDay,
  MonthlyAppointmentMonth,
  FeedbackStarBreakdownItem,
  DoctorsByDepartmentItem,
} from "@/api/dashboard";

export type ExportDashboardDataParams = {
  stats: DashboardStats | null;
  avgRating: string;
  totalDoctors: number;
  weeklyRequestsData: WeeklyAppointmentDay[];
  monthlyRequestsData: MonthlyAppointmentMonth[];
  feedbackByRating: FeedbackStarBreakdownItem[];
  doctorsByDepartment: DoctorsByDepartmentItem[];
};

export const exportDashboardDataToExcel = ({
  stats,
  avgRating,
  totalDoctors,
  weeklyRequestsData,
  monthlyRequestsData,
  feedbackByRating,
  doctorsByDepartment,
}: ExportDashboardDataParams) => {
  const wb = XLSX.utils.book_new();

  const weeklySheet = XLSX.utils.json_to_sheet(
    weeklyRequestsData.map((item) => ({
      Day: item.day,
      "Number of Requests": item.requests,
    }))
  );
  weeklySheet["!cols"] = [{ wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, weeklySheet, "Weekly Requests");

  const monthlySheet = XLSX.utils.json_to_sheet(
    monthlyRequestsData.map((item) => ({
      Month: item.month,
      Year: item.year,
      "Number of Requests": item.requests,
    }))
  );
  monthlySheet["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, monthlySheet, "Monthly Trends");

  const feedbackSheet = XLSX.utils.json_to_sheet(
    feedbackByRating.map((item) => ({
      Rating: item.rating,
      "Number of Reviews": item.count,
      Percentage: item.percentage,
    }))
  );
  feedbackSheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, feedbackSheet, "Feedback by Rating");

  const doctorsSheet = XLSX.utils.json_to_sheet(
    doctorsByDepartment.map((item) => ({
      Department: item.dept,
      "Number of Doctors": item.doctors,
      Percentage: `${item.percent}%`,
    }))
  );
  doctorsSheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, doctorsSheet, "Doctors by Department");

  const summarySheet = XLSX.utils.json_to_sheet([
    { Metric: "Total Appointment Requests", Value: stats?.appointmentRequests ?? 0 },
    {
      Metric: "Total Medical Record Requests",
      Value: stats?.medicalRecordRequests ?? 0,
    },
    {
      Metric: "Total Feedback Reviews",
      Value: stats?.feedbacksAndReviews?.total ?? 0,
    },
    { Metric: "Average Rating", Value: avgRating },
    { Metric: "Total Doctors", Value: totalDoctors },
    {
      Metric: "Doctor Feedback Reviews",
      Value: stats?.feedbacksAndReviews?.doctorFeedback ?? 0,
    },
    {
      Metric: "Hospital Feedback Reviews",
      Value: stats?.feedbacksAndReviews?.hospitalFeedback ?? 0,
    },
  ]);
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const fileName = `dashboard_data_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
