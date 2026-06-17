import { useState, useCallback, useMemo, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  CheckCircle,
  Clock,
  XCircle,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import AppointmentRequestsTab, {
  type AppointmentRequestStats,
} from "@/components/appointment/AppointmentRequestsTab";
import AppointmentSectionNav from "@/components/appointment/AppointmentSectionNav";
import { APPOINTMENT_REQUEST_TYPE, getAppointmentCounts } from "@/api/appointmentRequest";

const defaultStats: AppointmentRequestStats = {
  pending: 0,
  confirmed: 0,
  cancelled: 0,
};

type RequestSubTab = "appointment_request" | "first_time_visitor";

const REQUEST_CATEGORIES: {
  id: RequestSubTab;
  label: string;
  description: string;
  emptyMessage: string;
  requestType: (typeof APPOINTMENT_REQUEST_TYPE)[keyof typeof APPOINTMENT_REQUEST_TYPE];
  icon: typeof Stethoscope;
  accent: string;
  iconBg: string;
}[] = [
  {
    id: "appointment_request",
    label: "Appointment Request",
    description:
      "Appointment requests — review, confirm, or cancel",
    emptyMessage: "No appointment requests found matching filters",
    requestType: APPOINTMENT_REQUEST_TYPE.APPOINTMENT_REQUEST,
    icon: Stethoscope,
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    id: "first_time_visitor",
    label: "First Time Visitor",
    description:
      "First-time visitor appointment requests — review, confirm, or cancel",
    emptyMessage: "No first time visitor requests found matching filters",
    requestType: APPOINTMENT_REQUEST_TYPE.FIRST_TIME_VISITOR,
    icon: UserPlus,
    accent: "text-sky-600",
    iconBg: "bg-sky-100",
  },
];

const AppointmentRequests = () => {
  const [requestSubTab, setRequestSubTab] =
    useState<RequestSubTab>("appointment_request");
  const [countsBySubTab, setCountsBySubTab] = useState<
    Record<RequestSubTab, number>
  >({
    appointment_request: 0,
    first_time_visitor: 0,
  });
  const [totalUnviewedRequests, setTotalUnviewedRequests] = useState(0);
  const [statsBySubTab, setStatsBySubTab] = useState<
    Record<RequestSubTab, AppointmentRequestStats>
  >({
    appointment_request: defaultStats,
    first_time_visitor: defaultStats,
  });

  const activeRequestSubTab = useMemo(
    () =>
      REQUEST_CATEGORIES.find((cat) => cat.id === requestSubTab) ??
      REQUEST_CATEGORIES[0],
    [requestSubTab],
  );

  const handleRequestStatsChange = useCallback(
    (stats: AppointmentRequestStats) => {
      setStatsBySubTab((prev) => ({
        ...prev,
        [requestSubTab]: stats,
      }));
    },
    [requestSubTab],
  );

  const fetchUnviewedCounts = useCallback(async () => {
    try {
      const res = await getAppointmentCounts();
      if (res?.success && res.data) {
        setTotalUnviewedRequests(res.data.appointmentRequests ?? 0);
        setCountsBySubTab({
          appointment_request: res.data.appointmentRequestTypeRequests ?? 0,
          first_time_visitor: res.data.firstTimeVisitorRequests ?? 0,
        });
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    void fetchUnviewedCounts();
    const handleAppointmentsUpdated = () => {
      void fetchUnviewedCounts();
    };
    window.addEventListener("appointmentsUpdated", handleAppointmentsUpdated);
    return () => {
      window.removeEventListener(
        "appointmentsUpdated",
        handleAppointmentsUpdated,
      );
    };
  }, [fetchUnviewedCounts]);

  const handleRequestCountChange = useCallback(
    (count: number) => {
      setCountsBySubTab((prev) => ({
        ...prev,
        [requestSubTab]: count,
      }));
    },
    [requestSubTab],
  );

  return (
    <AdminLayout title="Appointment Requests">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Appointment Requests
              </h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                {totalUnviewedRequests} new
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage incoming appointment requests
            </p>
          </div>

          <AppointmentSectionNav />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUEST_CATEGORIES.map((category) => {
            const isActive = requestSubTab === category.id;
            const stats = statsBySubTab[category.id];
            const count = countsBySubTab[category.id];
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setRequestSubTab(category.id)}
                className={`group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-burgundy bg-gradient-to-br from-burgundy/[0.06] via-white to-white shadow-md shadow-burgundy/5"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-burgundy to-transparent" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isActive
                          ? `${category.iconBg} scale-105`
                          : `${category.iconBg} group-hover:scale-105`
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${category.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`font-semibold text-base leading-tight ${
                          isActive ? "text-burgundy" : "text-slate-800"
                        }`}
                      >
                        {category.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-full tabular-nums ${
                      isActive
                        ? "bg-burgundy text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/80"
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    {stats.pending} pending
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    {stats.confirmed} confirmed
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                    <XCircle className="h-3 w-3" />
                    {stats.cancelled} cancelled
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <h3 className="text-lg font-semibold text-slate-800">
              {activeRequestSubTab.label}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeRequestSubTab.description}
            </p>
          </div>

          <div className="p-6">
            <AppointmentRequestsTab
              requestType={activeRequestSubTab.requestType}
              emptyMessage={activeRequestSubTab.emptyMessage}
              onCountChange={handleRequestCountChange}
              onStatsChange={handleRequestStatsChange}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppointmentRequests;
