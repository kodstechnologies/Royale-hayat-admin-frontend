import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  TrendingUp,
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
        title: t("Appointments"),
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
      <div className="space-y-6">
        <BreadCrumb />

        <div className="bg-gradient-to-r from-burgundy/5 via-white to-burgundy/3 rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome back, Admin</h2>
              <p className="text-sm text-slate-500 mt-1">
                Here&apos;s what&apos;s happening with your hospital today
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Export to Excel
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-600">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.link)}
              className="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-burgundy/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <card.icon size={18} className={card.iconColor} />
                </div>
               
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{card.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-semibold text-slate-800">Weekly Requests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Appointment request trends for the current week
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />
                  <span className="text-xs text-slate-600">Requests</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyRequestsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="requests"
                    fill={chartColor}
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    name="Requests"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <h3 className="text-md font-semibold text-slate-800">Monthly Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly appointment requests</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyRequestsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
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
                    name="Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-semibold text-slate-800">Feedback by Rating</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Patient satisfaction distribution
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{avgRating}</span>
                  <span className="text-xs text-slate-500">/ 5</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={feedbackByRating} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={65}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32} name="Count">
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

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-burgundy" />
                <h3 className="text-md font-semibold text-slate-800">Doctors by Department</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Number of doctors per department</p>
            </div>
            <div className="p-5">
              {doctorsByDepartment.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No doctors found</p>
              ) : (
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                  {doctorsByDepartment.map((dept) => (
                    <div key={dept.departmentId ?? dept.dept}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{dept.dept}</span>
                        <div className="flex items-center gap-2">
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
                <div className="flex justify-between items-center">
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
