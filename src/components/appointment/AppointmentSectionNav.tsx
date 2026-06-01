import { Link, useLocation } from "react-router-dom";
import { CalendarDays, ListChecks } from "lucide-react";
import { PERMISSIONS } from "@/constants/permissions";
import { hasAnyPermission } from "@/utils/PermissionGate";

const tabs = [
  {
    to: "/appointment",
    label: "Requests",
    description: "Review incoming requests",
    icon: ListChecks,
    permissions: [PERMISSIONS.APPOINTMENT_REQUEST_VIEW],
    isActive: (pathname: string) =>
      !pathname.startsWith("/appointment/bookings"),
  },
  {
    to: "/appointment/bookings",
    label: "Bookings",
    description: "View patient bookings",
    icon: CalendarDays,
    permissions: [PERMISSIONS.APPOINTMENT_BOOKING_VIEW],
    isActive: (pathname: string) =>
      pathname.startsWith("/appointment/bookings"),
  },
] as const;

const AppointmentSectionNav = () => {
  const { pathname } = useLocation();
  const visibleTabs = tabs.filter((tab) => hasAnyPermission(tab.permissions));

  if (visibleTabs.length === 0) return null;

  return (
    <div
      className={`w-full sm:w-auto grid gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner min-w-[min(100%,320px)] sm:min-w-[420px] ${
        visibleTabs.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.isActive(pathname);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`group relative flex flex-col items-center justify-center gap-2 px-5 py-4 sm:px-6 sm:py-5 rounded-xl text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-burgundy text-white shadow-lg shadow-burgundy/25 scale-[1.02]"
                : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-md border border-transparent hover:border-slate-200/80"
            }`}
          >
            {isActive && (
              <span className="absolute inset-x-4 top-0 h-1 rounded-full bg-white/40" />
            )}

            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-white/20"
                  : "bg-burgundy/10 group-hover:bg-burgundy/15"
              }`}
            >
              <Icon
                className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${
                  isActive ? "text-white" : "text-burgundy"
                }`}
              />
            </div>

            <div>
              <span
                className={`block text-base sm:text-lg font-bold tracking-tight ${
                  isActive ? "text-white" : "text-slate-800"
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`block text-[11px] sm:text-xs mt-0.5 font-medium ${
                  isActive ? "text-white/80" : "text-slate-500"
                }`}
              >
                {tab.description}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default AppointmentSectionNav;
