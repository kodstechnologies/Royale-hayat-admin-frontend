import { useLocation, useNavigate } from "react-router-dom";
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
  BriefcaseBusiness
} from "lucide-react";

import logo from "@/assets/rhh-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { logout } from "@/api/auth";
import { isCallCenterUser } from "@/lib/userRole";
import { useState, useRef, useLayoutEffect, useCallback } from "react";

const SIDEBAR_SCROLL_KEY = "rhh_admin_sidebar_scroll";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/appointment",
    icon: CalendarCheck,
    label: "Appointments",
  },
  {
    to: "/medical-records-requests",
    icon: ClipboardList,
    label: "Medical Records Requests",
  },
  { to: "/enquiries", icon: Mail, label: "Enquiries" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback & Reviews" },
];

interface SidebarProps {
  collapsed: boolean;
}

type NavItemConfig = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
};

const SidebarNavItem = ({
  item,
  isActive,
  showGoldenDot = false,
  collapsed,
  isRTL,
  hoveredItem,
  setHoveredItem,
  t,
  onNavigate,
}: {
  item: NavItemConfig;
  isActive: boolean;
  showGoldenDot?: boolean;
  collapsed: boolean;
  isRTL: boolean;
  hoveredItem: string | null;
  setHoveredItem: (value: string | null) => void;
  t: (key: string) => string;
  onNavigate: (to: string) => void;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      if (e.button !== 0) return;
      e.preventDefault();
    }}
    onClick={() => onNavigate(item.to)}
    onMouseEnter={() => setHoveredItem(item.to)}
    onMouseLeave={() => setHoveredItem(null)}
    className={`
      box-border w-full max-w-full text-left
      group relative flex items-center gap-3
      px-3 py-2.5 mb-1.5
      rounded-xl text-sm font-medium
      transition-all duration-300 ease-in-out
      border

      ${isActive
        ? `
          bg-gradient-to-r from-burgundy to-burgundy/90
          text-white
          border-burgundy/80
          shadow-lg shadow-burgundy/20
        `
        : `
          bg-white/50
          text-slate-600
          border-transparent
          hover:bg-white/80
          hover:border-burgundy/20
          hover:shadow-md
          hover:text-burgundy
        `
      }

      ${collapsed ? "justify-center px-2" : ""}
    `}
  >
    {isActive && !showGoldenDot && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white shadow-sm" />
    )}

    {isActive && showGoldenDot && !collapsed && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30">
        <div className="w-1.5 h-8 rounded-r-full bg-amber-400 shadow-sm" />
      </div>
    )}

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
          ${isActive ? "text-white" : "text-slate-700 group-hover:text-burgundy"}
        `}
      >
        {t(item.label)}
      </span>
    )}

    {!isActive && !collapsed && (
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-burgundy/5 to-transparent pointer-events-none" />
    )}

    {collapsed && hoveredItem === item.to && (
      <div
        className={`fixed ${isRTL ? "right-20" : "left-20"
          } z-50 px-3 py-2 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200`}
      >
        {t(item.label)}
      </div>
    )}
  </button>
);

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const isCallCenter = isCallCenterUser();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const pendingScrollRestore = useRef<number | null>(null);

  const persistNavScroll = useCallback(() => {
    const nav = navContainerRef.current;
    if (!nav) return;
    pendingScrollRestore.current = nav.scrollTop;
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(nav.scrollTop));
  }, []);

  const applySavedNavScroll = useCallback(() => {
    const nav = navContainerRef.current;
    if (!nav || pendingScrollRestore.current === null) return;
    nav.scrollTop = pendingScrollRestore.current;
  }, []);

  const masterPaths = [
    "/categories",
    "/departments",
    "/subspecialities",
  ];

  const isMasterPath = (path: string) =>
    masterPaths.some(
      (masterPath) => path === masterPath || path.startsWith(`${masterPath}/`)
    );

  // Start open only if the current page is already a master path
  const [masterOpen, setMasterOpen] = useState(() =>
    isMasterPath(window.location.pathname)
  );

  const handleMasterToggle = () => {
    persistNavScroll();
    setMasterOpen((prev) => !prev);
  };

  useLayoutEffect(() => {
    if (pendingScrollRestore.current === null) return;

    applySavedNavScroll();
    const raf1 = requestAnimationFrame(applySavedNavScroll);
    const raf2 = requestAnimationFrame(() => {
      requestAnimationFrame(applySavedNavScroll);
    });
    const t1 = window.setTimeout(applySavedNavScroll, 0);
    const t2 = window.setTimeout(applySavedNavScroll, 50);
    const t3 = window.setTimeout(() => {
      applySavedNavScroll();
      pendingScrollRestore.current = null;
    }, 150);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [location.pathname, applySavedNavScroll, masterOpen, collapsed]);

  useLayoutEffect(() => {
    const nav = navContainerRef.current;
    if (!nav) return;

    const saved = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0);
    if (saved > 0 && pendingScrollRestore.current === null) {
      pendingScrollRestore.current = saved;
      applySavedNavScroll();
    }

    const onScroll = () => {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(nav.scrollTop));
    };
    nav.addEventListener("scroll", onScroll, { passive: true });
    return () => nav.removeEventListener("scroll", onScroll);
  }, [applySavedNavScroll]);

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

  // Top-level nav items (in order)
  const mainNavItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/appointment", icon: CalendarCheck, label: "Appointments" },
    { to: "/medical-records-requests", icon: ClipboardList, label: "Medical Records Requests" },
    { to: "/job-posts", icon: UserCheck, label: "Jobs" },
    { to: "/enquiries", icon: Mail, label: "Enquiries" },
    { to: "/feedback", icon: MessageSquare, label: "Feedback & Reviews" },
    { to: "/achievements", icon: Sparkles, label: "Employee Recognition" },
    { to: "/doctors", icon: Stethoscope, label: "Doctors" },
    { to: "/leadership", icon: UserCheck, label: "Leadership Team" },
    { to: "/csr", icon: Globe, label: "CSR" },
    { to: "/work-culture", icon: BriefcaseBusiness , label: "Work Culture" },
  ];
  const visibleMainNavItems = isCallCenter
    ? mainNavItems.filter((item) => item.to === "/appointment")
    : mainNavItems;

  // Other management items
  const managementNavItems = [
    {
      to: "/documents",
      icon: FileText,
      label: "Documents",
    },
  ];

  const masterItems = [
    {
      to: "/categories",
      icon: Layers,
      label: "Categories",
    },
    {
      to: "/departments",
      icon: Building2,
      label: "Departments",
    },
    {
      to: "/subspecialities",
      icon: ListTree,
      label: "Subspecialities",
    },
  ];

  const handleNavClick = useCallback(
    (to: string) => {
      persistNavScroll();
      navigate(to, { preventScrollReset: true });
    },
    [navigate, persistNavScroll],
  );

  const renderNavItem = (
    item: NavItemConfig,
    isActive: boolean,
    showGoldenDot = false,
  ) => (
    <SidebarNavItem
      key={item.to}
      item={item}
      isActive={isActive}
      showGoldenDot={showGoldenDot}
      collapsed={collapsed}
      isRTL={isRTL}
      hoveredItem={hoveredItem}
      setHoveredItem={setHoveredItem}
      t={t}
      onNavigate={handleNavClick}
    />
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
        <div className="relative h-28 flex items-center justify-center border-b border-slate-100 px-2 bg-gradient-to-r from-white to-slate-50/50 shrink-0">
          <div className="relative w-full flex justify-center px-0">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-xl animate-pulse"></div>

            <img
              src={logo}
              alt="Royale Hayat Hospital"
              className={`
        transition-all duration-300
        object-contain
        relative z-10
        ${collapsed ? "h-14 w-44 max-w-full" : "h-24 w-full max-w-full"}
      `}
            />
          </div>
        </div>
        {/* Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden overflow-y-hidden">
          <nav
            ref={navContainerRef}
            className="sidebar-nav-scroll flex-1 min-h-0 overflow-x-hidden overflow-y-auto [overflow-anchor:none] px-3"
          >
            {/* Main Nav Items */}
            <div className="space-y-0.5 min-w-0">
              {visibleMainNavItems.map((item) =>
                renderNavItem(item, isRouteActive(item.to)),
              )}
            </div>

            {/* Master Data Dropdown Section */}
            {!isCallCenter && (collapsed ? (
              /* Collapsed: show master items flat */
              <div className="space-y-0.5 mt-2">
                {masterItems.map((item) =>
                  renderNavItem(item, isRouteActive(item.to), false),
                )}
              </div>
            ) : (
              /* Expanded: collapsible dropdown */
              <div className="mt-4 mb-2 min-w-0">
                <button
                  onClick={handleMasterToggle}
                  className="
                    box-border w-full max-w-full flex items-center justify-between
                    px-3 py-2.5 rounded-xl
                    bg-gradient-to-r from-burgundy/8 to-burgundy/3
                    border border-burgundy/10
                    hover:border-burgundy/25
                    hover:bg-burgundy/5
                    transition-all duration-300
                    group
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-burgundy/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles className="h-4 w-4 text-burgundy" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      Master Data
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-all duration-300 ${masterOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${masterOpen ? "max-h-[500px] mt-2" : "max-h-0"}
                  `}
                >
                  <div className="space-y-0.5 pl-2 border-l-2 border-burgundy/10 ml-3">
                    {masterItems.map((item) =>
                      renderNavItem(item, isRouteActive(item.to), true),
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Other Management Section */}
            {!isCallCenter && (
              <div className="space-y-0.5 mt-2">
                {managementNavItems.map((item) =>
                  renderNavItem(item, isRouteActive(item.to)),
                )}
              </div>
            )}
          </nav>

          {/* Footer Section */}
          <div className="border-t border-slate-100 bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm shrink-0 mt-auto overflow-x-hidden px-3">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title={collapsed ? t("Secure Logout") : undefined}
              aria-label={t("Secure Logout")}
              className={`
                box-border flex w-full max-w-full items-center gap-3 px-3 py-2.5 mb-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 group
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

      <style>{`
        .sidebar-nav-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 30, 63, 0.25) transparent;
        }

        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 4px;
          height: 0;
        }

        .sidebar-nav-scroll::-webkit-scrollbar:horizontal {
          display: none;
          height: 0;
        }

        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 63, 0.25);
          border-radius: 20px;
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