import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Globe,
  MessageSquare,
  Stethoscope,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ClipboardList,
  Shield,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  ListTree,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import logo from "@/assets/rhh-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { logout } from "@/api/auth";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/appointment-requests",
    icon: CalendarCheck,
    label: "Appointment Requests",
  },
  {
    to: "/medical-records-requests",
    icon: ClipboardList,
    label: "Medical Records Requests",
  },
  {
    to: "/international-patients",
    icon: Globe,
    label: "International Patients",
  },
  {
    to: "/al-safwa-enrollments",
    icon: Shield,
    label: "Al Safwa Enrollments",
  },
  { to: "/enquiries", icon: Mail, label: "Enquiries" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback & Reviews" },
  {
    to: "/services",
    icon: Briefcase,
    label: "Hospitality Services",
  },
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
  const [masterOpen, setMasterOpen] = useState(true);
  
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-expand master dropdown if any master item is active
  useEffect(() => {
    const masterPaths = [
      "/categories",
      "/subspecialities",
      "/departments",
      "/doctors",
      "/job-applications",
    ];
    const isMasterActive = masterPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    if (isMasterActive && !masterOpen) {
      setMasterOpen(true);
    }
  }, [location.pathname]);

  const isRouteActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
      location.pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem("rhh_admin_auth");
      localStorage.removeItem("rhh_admin_access_token");
      localStorage.removeItem("rhh_admin_user");
      navigate("/login");
    }
  };

  // Main section
  const mainNavItems = navItems.slice(0, 6);

  // Other management items
  const managementNavItems = [
    {
      to: "/feedback",
      icon: MessageSquare,
      label: "Feedback & Reviews",
    },
    {
      to: "/services",
      icon: Briefcase,
      label: "Hospitality Services",
    },
    {
      to: "/documents",
      icon: FileText,
      label: "Documents",
    },
  ];

  // Reports
  const reportsNavItem = navItems[9];

  const masterItems = [
    {
      to: "/categories",
      icon: Layers,
      label: "Categories",
    },
    {
      to: "/subspecialities",
      icon: ListTree,
      label: "Subspecialities",
    },
    {
      to: "/departments",
      icon: Building2,
      label: "Departments",
    },
    {
      to: "/doctors",
      icon: Stethoscope,
      label: "Doctors",
    },
    {
      to: "/job-applications",
      icon: UserCheck,
      label: "Job Applications",
    },
  ];

  const NavItem = ({
    item,
    isActive,
    showGoldenDot = false,
  }: {
    item: typeof navItems[0];
    isActive: boolean;
    showGoldenDot?: boolean;
  }) => (
    <NavLink
      key={item.to}
      to={item.to}
      onMouseEnter={() => setHoveredItem(item.to)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        group relative flex items-center gap-3
        px-3 py-2.5 mx-3 mb-1.5
        rounded-xl text-sm font-medium
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
            bg-white/50
            text-slate-600
            border-transparent
            hover:bg-white/80
            hover:border-burgundy/20
            hover:shadow-md
            hover:translate-x-1
            hover:text-burgundy
          `
        }

        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      {/* Active Indicator Bar */}
      {isActive && !showGoldenDot && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white shadow-sm" />
      )}
      
      {/* Golden Dot Indicator for Master Data Items */}
      {isActive && showGoldenDot && !collapsed && (
        <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 z-30">
          <div className="relative flex items-center justify-center">
            {/* thin connector line */}
            <div className="absolute left-[10px] w-[14px] h-[1.5px] bg-amber-400/70 rounded-full" />
            {/* golden dot */}
            <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-lg shadow-amber-400/70" />
          </div>
        </div>
      )}

      {/* Icon Container */}
      <div
        className={`
          flex items-center justify-center
          w-9 h-9 rounded-lg
          transition-all duration-300

          ${isActive
            ? "bg-white/20 text-white shadow-sm"
            : "bg-white/60 text-slate-500 group-hover:bg-burgundy/15 group-hover:text-burgundy group-hover:shadow-sm"
          }
        `}
      >
        <item.icon size={18} />
      </div>

      {!collapsed && (
        <span
          className={`
            flex-1 text-[13px] leading-5 font-medium
            whitespace-normal break-words
            transition-colors duration-300
            ${isActive
              ? "text-white"
              : "text-slate-700 group-hover:text-burgundy"
            }
          `}
        >
          {t(item.label)}
        </span>
      )}

      {/* Hover Glow Effect */}
      {!isActive && !collapsed && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-burgundy/5 to-transparent pointer-events-none" />
      )}

      {/* Tooltip for Collapsed State */}
      {collapsed && hoveredItem === item.to && (
        <div
          className={`fixed ${isRTL ? "right-20" : "left-20"
            } z-50 px-3 py-2 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200`}
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
          ${collapsed ? "w-[80px]" : "w-[300px]"}
          bg-gradient-to-b from-white/95 via-white/90 to-white/95
          flex flex-col
          transition-all duration-500 ease-in-out
          shrink-0 fixed
          ${isRTL ? "right-3" : "left-3"}
          top-3
          bottom-3
          z-30
          shadow-2xl
          backdrop-blur-xl
          border border-white/40
          overflow-hidden
          rounded-2xl
        `}
      >
        {/* Logo Section */}
        <div className="relative h-20 flex items-center justify-center border-b border-slate-100 px-3 bg-gradient-to-r from-white to-slate-50/50 shrink-0">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-xl animate-pulse"></div>
            
            <img
              src={logo}
              alt="Royale Hayat Hospital"
              className={`transition-all duration-300 object-contain relative z-10 ${collapsed ? "h-10 w-auto" : "h-12 w-auto"
                }`}
            />
          </div>

          {/* Toggle Button */}
          {onToggle && (
            <button
              onClick={onToggle}
              className={`absolute ${isRTL ? "left-3" : "right-3"
                } top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white text-slate-500 hover:bg-burgundy hover:text-white transition-all duration-200 shadow-md hover:shadow-lg z-20 border border-slate-100`}
            >
              {collapsed ? (
                <ChevronRight
                  size={14}
                  className={isRTL ? "rotate-180" : ""}
                />
              ) : (
                <ChevronLeft
                  size={14}
                  className={isRTL ? "rotate-180" : ""}
                />
              )}
            </button>
          )}
        </div>

        {/* Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <nav ref={navRef} className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-burgundy/30">
            {/* Dashboard */}
            <div className="space-y-0.5">
              {mainNavItems.slice(0, 1).map((item) => {
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

            {/* Master Dropdown Section */}
            <div className="px-3 mt-4 mb-2">
              <button
                onClick={() => setMasterOpen(!masterOpen)}
                className={`
                  w-full flex items-center justify-between
                  px-3 py-2.5 rounded-xl
                  bg-gradient-to-r from-burgundy/8 to-burgundy/3
                  border border-burgundy/10
                  hover:border-burgundy/25
                  hover:bg-burgundy/5
                  transition-all duration-300
                  group
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-burgundy/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4 text-burgundy" />
                  </div>

                  {!collapsed && (
                    <span className="text-sm font-semibold text-slate-700">
                      Master Data
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-all duration-300 ${masterOpen ? "rotate-180" : ""
                      }`}
                  />
                )}
              </button>

              {/* Dropdown Menu */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${masterOpen ? "max-h-[500px] mt-2" : "max-h-0"}
                `}
              >
                <div className="space-y-0.5 pl-2 border-l-2 border-burgundy/10 ml-3">
                  {masterItems.map((item) => {
                    const isActive = isRouteActive(item.to);
                    return (
                      <NavItem
                        key={item.to}
                        item={item}
                        isActive={isActive}
                        showGoldenDot={true}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Remaining Main Nav Items */}
            <div className="space-y-0.5 mt-2">
              {mainNavItems.slice(1).map((item) => {
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

            {/* Other Management Section */}
            <div className="space-y-0.5 mt-2">
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

            {/* Divider */}
            <div className="relative my-4 mx-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/50"></div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="space-y-0.5">
              <NavItem
                item={reportsNavItem}
                isActive={isRouteActive(reportsNavItem.to)}
              />
            </div>
          </nav>

          {/* Footer Section */}
          <div className="border-t border-slate-100 bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm shrink-0 mt-auto">
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
              <Settings
                size={18}
                className={`transition-all duration-300 ${!collapsed && "group-hover:rotate-90"}`}
              />

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
              <LogOut
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />

              {!collapsed && <span>{t("Secure Logout")}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 63, 0.25);
          border-radius: 20px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 30, 63, 0.45);
        }
        
        /* Fade-in animation for tooltips */
        @keyframes fadeInSlideLeft {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-in {
          animation: fadeInSlideLeft 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;