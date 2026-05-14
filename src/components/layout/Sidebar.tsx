import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarCheck, Globe, MessageSquare,
  Stethoscope, Building2, Briefcase, FileText, BarChart3, Settings,
  LogOut, User, ClipboardList, Shield, Mail, UserCheck,
  ChevronLeft, ChevronRight, Layers, ListTree,
} from "lucide-react";
import logo from "@/assets/rhh-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { logout } from "@/api/auth";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/appointment-requests", icon: CalendarCheck, label: "Appointment Requests" },
  { to: "/medical-records-requests", icon: ClipboardList, label: "Medical Records Requests" },
  { to: "/international-patients", icon: Globe, label: "International Patients" },
  { to: "/al-safwa-enrollments", icon: Shield, label: "Al Safwa Enrollments" },
  { to: "/enquiries", icon: Mail, label: "Enquiries" },
  { to: "/job-applications", icon: UserCheck, label: "Job Applications" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback & Reviews" },
  { to: "/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/categories", icon: Layers, label: "Categories" },
  { to: "/subspecialities", icon: ListTree, label: "Subspecialities" },
  { to: "/departments", icon: Building2, label: "Departments" },
  { to: "/services", icon: Briefcase, label: "Hospitality Services" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isRouteActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Clear local auth state even if API call fails.
    } finally {
      localStorage.removeItem("rhh_admin_auth");
      localStorage.removeItem("rhh_admin_access_token");
      localStorage.removeItem("rhh_admin_user");
      navigate("/login");
    }
  };

  // Group navigation items
  const mainNavItems = navItems.slice(0, 7);
  const managementNavItems = navItems.slice(7, 14);
  const reportsNavItem = navItems[14];

  const NavItem = ({ item, isActive }: { item: typeof navItems[0]; isActive: boolean }) => (
    <NavLink
      key={item.to}
      to={item.to}
      onMouseEnter={() => setHoveredItem(item.to)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
      group relative flex items-center gap-3 
      px-3 py-3 mx-3 mb-2
      rounded-2xl text-sm font-medium
      transition-all duration-300 ease-in-out
      border

      ${isActive
          ? `
          bg-gradient-to-r from-burgundy to-burgundy/90
          text-white
          border-burgundy/80
          shadow-lg shadow-burgundy/20
          scale-[1.02]
        `
          : `
          bg-white/60
          text-slate-700
          border-white/40
          hover:bg-white/80
          hover:border-burgundy/30
          hover:shadow-md
          hover:translate-x-1
          hover:text-burgundy
        `
        }

      ${collapsed ? "justify-center px-2" : ""}
    `}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white" />
      )}

      {/* Icon Container */}
      <div
        className={`
        flex items-center justify-center
        w-10 h-10 rounded-xl
        transition-all duration-300

        ${isActive
            ? "bg-white/20 text-white"
            : "bg-white/60 text-slate-500 group-hover:bg-burgundy/10 group-hover:text-burgundy"
          }
      `}
      >
        <item.icon size={18} />
      </div>

      {!collapsed && (
        <span
          className={`
    flex-1 text-[14px] leading-5
    whitespace-normal break-words
    transition-colors duration-300
    ${isActive ? "text-white" : "text-slate-700 group-hover:text-burgundy"}
  `}
        >
          {t(item.label)}
        </span>
      )}

      {/* Hover Glow */}
      {!isActive && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-burgundy/5 to-transparent pointer-events-none" />
      )}

      {/* Tooltip */}
      {collapsed && hoveredItem === item.to && (
        <div
          className={`fixed ${isRTL ? "right-20" : "left-20"
            } z-50 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-xl whitespace-nowrap`}
        >
          {t(item.label)}
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      <aside
        className={`
          ${collapsed ? "w-[80px]" : "w-[320px]"} 
          bg-white/70
          h-screen
          flex flex-col
          transition-all duration-500 ease-in-out
          shrink-0 fixed
          ${isRTL ? "right-3" : "left-3"}
          top-3
          z-30
          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
          backdrop-blur-2xl
          border border-white/30
          overflow-hidden
          rounded-[32px]
        `}
      >
        {/* Logo Section */}
        <div className="relative h-24 flex items-center justify-center border-b border-white/20 px-3 bg-white/50 backdrop-blur-sm shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl"></div>
            <img
              src={logo}
              alt="Royale Hayat Hospital"
              className={`transition-all duration-300 object-contain relative z-10 ${collapsed ? "h-12 w-auto" : "h-16 w-auto"
                }`}
            />
          </div>

          {/* Toggle Button */}
          {onToggle && (
            <button
              onClick={onToggle}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-slate-600 hover:bg-burgundy hover:text-white transition-all duration-200 shadow-md hover:shadow-lg z-20`}
            >
              {collapsed ? (
                <ChevronRight size={16} className={isRTL ? "rotate-180" : ""} />
              ) : (
                <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
              )}
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-burgundy/30">
            {/* Main Section */}
            {!collapsed && (
              <div className="px-4 mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {t("Main")}
                </p>
              </div>
            )}

            <div className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive = isRouteActive(item.to);
                return (
                  <NavItem
                    key={item.to}
                    item={item}
                    isActive={isActive}
                  />
                );
              })}
            </div>

            {/* Separator */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>

              {!collapsed && (
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white/70 text-slate-400">
                    {t("Management")}
                  </span>
                </div>
              )}
            </div>

            {/* Management Section */}
            <div className="space-y-0.5">
              {managementNavItems.map((item) => {
                const isActive = isRouteActive(item.to);
                return (
                  <NavItem
                    key={item.to}
                    item={item}
                    isActive={isActive}
                  />
                );
              })}
            </div>

            {/* Separator */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
            </div>

            {/* Reports */}
            <div className="space-y-0.5">
              {(() => {
                const isActive = isRouteActive(reportsNavItem.to);
                return (
                  <NavItem
                    item={reportsNavItem}
                    isActive={isActive}
                  />
                );
              })()}
            </div>
          </nav>

          {/* Footer Section */}
          <div className="border-t border-white/20 bg-white/50 backdrop-blur-sm shrink-0">
            {/* Settings */}
            <NavLink
              to="/settings"
              title={collapsed ? t("Settings") : undefined}
              aria-label={t("Settings")}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive || isRouteActive("/settings")
                  ? "bg-gradient-to-r from-burgundy/10 to-burgundy/5 text-burgundy"
                  : "text-slate-600 hover:bg-white/60 hover:text-burgundy"
                }
                ${collapsed ? "justify-center px-2" : ""}
              `}
            >
              <Settings size={20} className="transition-transform group-hover:rotate-90" />
              {!collapsed && <span>{t("Settings")}</span>}
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title={collapsed ? t("Secure Logout") : undefined}
              aria-label={t("Secure Logout")}
              className={`
                flex items-center gap-3 px-3 py-2.5 mx-2 mb-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 w-full group
                ${collapsed ? "justify-center px-2" : ""}
              `}
            >
              <LogOut size={20} className="transition-transform group-hover:translate-x-0.5" />
              {!collapsed && <span>{t("Secure Logout")}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Add custom styles for scrollbar */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 63, 0.2);
          border-radius: 20px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 30, 63, 0.4);
        }
      `}</style>
    </>
  );
};

export default Sidebar;