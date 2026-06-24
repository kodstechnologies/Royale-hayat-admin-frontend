import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Calendar,
  Stethoscope,
  MessageSquare,
  Star,
  ClipboardList,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { exportDashboardDataToExcel } from "@/lib/exportDashboardDataToEcxel";
import {
  getDashboardStats,
  getCurrentWeekAppointmentRequests,
  getMonthlyAppointmentRequests,
  getFeedbackStarStats,
  getDoctorsCountByDepartment,
  type DashboardStats,
  type WeeklyAppointmentDay,
  type MonthlyAppointmentMonth,
  type FeedbackStarBreakdownItem,
  type DoctorsByDepartmentItem,
} from "@/api/dashboard";

const DEFAULT_WEEKLY: WeeklyAppointmentDay[] = [
  { day: "Sunday", requests: 0 },
  { day: "Monday", requests: 0 },
  { day: "Tuesday", requests: 0 },
  { day: "Wednesday", requests: 0 },
  { day: "Thursday", requests: 0 },
  { day: "Friday", requests: 0 },
  { day: "Saturday", requests: 0 },
];

const DEFAULT_FEEDBACK: FeedbackStarBreakdownItem[] = [
  { stars: 5, rating: "5 Stars", count: 0, percentage: "0.0%" },
  { stars: 4, rating: "4 Stars", count: 0, percentage: "0.0%" },
  { stars: 3, rating: "3 Stars", count: 0, percentage: "0.0%" },
  { stars: 2, rating: "2 Stars", count: 0, percentage: "0.0%" },
  { stars: 1, rating: "1 Star", count: 0, percentage: "0.0%" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyRequestsData, setWeeklyRequestsData] =
    useState<WeeklyAppointmentDay[]>(DEFAULT_WEEKLY);
  const [monthlyRequestsData, setMonthlyRequestsData] = useState<
    MonthlyAppointmentMonth[]
  >([]);
  const [feedbackByRating, setFeedbackByRating] =
    useState<FeedbackStarBreakdownItem[]>(DEFAULT_FEEDBACK);
  const [doctorsByDepartment, setDoctorsByDepartment] = useState<
    DoctorsByDepartmentItem[]
  >([]);
  const [totalDoctors, setTotalDoctors] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, weekRes, monthRes, feedbackRes, deptRes] =
          await Promise.all([
            getDashboardStats(),
            getCurrentWeekAppointmentRequests(),
            getMonthlyAppointmentRequests(7),
            getFeedbackStarStats(),
            getDoctorsCountByDepartment(),
          ]);

        setStats(statsRes.data);
        setWeeklyRequestsData(
          weekRes.data.dailyBreakdown?.length
            ? weekRes.data.dailyBreakdown
            : DEFAULT_WEEKLY
        );
        setMonthlyRequestsData(monthRes.data.monthlyBreakdown ?? []);
        setFeedbackByRating(
          feedbackRes.data.combined?.breakdown?.length
            ? feedbackRes.data.combined.breakdown
            : DEFAULT_FEEDBACK
        );
        setDoctorsByDepartment(
          (deptRes.data.breakdown ?? []).filter((item) => item.doctors > 0)
        );
        setTotalDoctors(deptRes.data.totalDoctors ?? 0);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error instanceof Error ? error.message : "Failed to load dashboard");
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const avgRating = useMemo(
    () => (stats?.averageRatings?.overall ?? 0).toFixed(1),
    [stats]
  );

  const statsCards = useMemo(
    () => [
      {
        title: t("Appointment Requests"),
        value: String(stats?.appointmentRequests ?? 0),
        icon: Calendar,
        link: "/appointment",
        color: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-600",
      },
      {
        title: t("Medical Records Requests"),
        value: String(stats?.medicalRecordRequests ?? 0),
        icon: ClipboardList,
        link: "/medical-records-requests",
        color: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-600",
      },
      {
        title: t("Feedback & Reviews"),
        value: String(stats?.feedbacksAndReviews?.total ?? 0),
        icon: MessageSquare,
        link: "/feedback",
        color: "from-orange-500/20 to-orange-500/5",
        iconColor: "text-orange-600",
      },
      {
        title: t("Avg Rating"),
        value: avgRating,
        icon: Star,
        link: "/feedback",
        color: "from-yellow-500/20 to-yellow-500/5",
        iconColor: "text-yellow-600",
      },
    ],
    [t, stats, avgRating]
  );

  const chartColor = "#8B1E3F";

  const formatDayLabel = (day: string) => day.slice(0, 3);

  const handleExportToExcel = () => {
    exportDashboardDataToExcel({
      stats,
      avgRating,
      totalDoctors,
      weeklyRequestsData,
      monthlyRequestsData,
      feedbackByRating,
      doctorsByDepartment,
    });
    toast.success("Dashboard data exported successfully");
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-3">
          <p className="text-xs font-semibold text-slate-800 mb-1">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-xs text-slate-600">
              {p.name}: <span className="font-semibold text-burgundy">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getFeedbackBarColor = (rating: string) => {
    if (rating === "5 Stars") return "#10b981";
    if (rating === "4 Stars") return "#34d399";
    if (rating === "3 Stars") return "#fbbf24";
    if (rating === "2 Stars") return "#f97316";
    return "#ef4444";
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-4 sm:space-y-6 -mx-1 sm:mx-0">
        <BreadCrumb />

        <div className="bg-gradient-to-r from-burgundy/5 via-white to-burgundy/3 rounded-xl border border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                Welcome back, Admin
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here&apos;s what&apos;s happening with your hospital today
              </p>
            </div>
            <div className="flex flex-col min-[420px]:flex-row items-stretch sm:items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={handleExportToExcel}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-burgundy hover:bg-burgundy/90 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <Download size={18} className="shrink-0" />
                <span className="whitespace-nowrap">Export to Excel</span>
              </button>
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg sm:rounded-full bg-white border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-xs text-slate-600 whitespace-nowrap">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {statsCards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.link)}
              className="group bg-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-burgundy/20 transition-all duration-200 active:scale-[0.99] sm:hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 sm:block sm:mb-3">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
                >
                  <card.icon size={18} className={card.iconColor} />
                </div>
                <div className="min-w-0 flex-1 sm:mt-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-none">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 sm:truncate">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                    Weekly Appointment Requests
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    Appointment request trends for the current week
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />
                  <span className="text-xs text-slate-600">Appointment Requests</span>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className="h-[220px] sm:h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyRequestsData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickFormatter={formatDayLabel}
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      width={36}
                      tickMargin={4}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="requests"
                      fill={chartColor}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                      name="Appointment Requests"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                Monthly Appointment Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly appointment requests</p>
            </div>
            <div className="p-3 sm:p-5">
              <div className="h-[220px] sm:h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRequestsData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      width={36}
                      tickMargin={4}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke={chartColor}
                      fill={chartColor}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Appointment Requests"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                    Feedback by Rating
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient satisfaction distribution
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{avgRating}</span>
                  <span className="text-xs text-slate-500">/ 5</span>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className="h-[240px] sm:h-[260px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feedbackByRating}
                    layout="vertical"
                    margin={{ left: 4, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="rating"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      width={52}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28} name="Count">
                      {feedbackByRating.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getFeedbackBarColor(entry.rating)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center gap-2 min-w-0">
                <Stethoscope className="h-4 w-4 text-burgundy shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                  Doctors by Department
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Number of doctors per department</p>
            </div>
            <div className="p-4 sm:p-5">
              {doctorsByDepartment.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No doctors found</p>
              ) : (
                <div className="space-y-4 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1">
                  {doctorsByDepartment.map((dept) => (
                    <div key={dept.departmentId ?? dept.dept}>
                      <div className="flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700 break-words">
                          {dept.dept}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-burgundy">
                            {dept.doctors} doctors
                          </span>
                          <span className="text-xs text-slate-400">({dept.percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-burgundy to-rose-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${dept.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-slate-500">Total Doctors</span>
                  <span className="text-sm font-bold text-slate-800">{totalDoctors}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
