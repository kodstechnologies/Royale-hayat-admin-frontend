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
  Bell,
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
import { getAppointmentCounts } from "@/api/appointmentRequest";
import { getSidebarCounts } from "@/api/dashboard";
import { getFeedbackCounts } from "@/api/feedback";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { isNavItemAllowed } from "@/utils/PermissionGate";
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";

const SIDEBAR_SCROLL_KEY = "rhh_admin_sidebar_scroll";

type SidebarBadgeCounts = {
  appointments: number;
  medicalRecordRequests: number;
  jobApplications: number;
  enquiries: number;
  feedback: number;
  alSafwaEnrollments: number;
};

const getBadgeCountForRoute = (to: string, counts: SidebarBadgeCounts | null): number => {
  if (!counts) return 0;

  switch (to) {
    case "/appointment":
      return counts.appointments;
    case "/medical-records-requests":
      return counts.medicalRecordRequests;
    case "/job-posts":
      return counts.jobApplications;
    case "/enquiries":
      return counts.enquiries;
    case "/feedback":
      return counts.feedback;
    case "/al-safwa-enrollments":
      return counts.alSafwaEnrollments;
    default:
      return 0;
  }
};

const formatBadgeCount = (count: number) => (count > 99 ? "99+" : String(count));

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

type NavItemConfig = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  permissions?: string[];
  excludeRoles?: string[];
};

const SidebarNavItem = ({
  item,
  isActive,
  showGoldenDot = false,
  badgeCount = 0,
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
  badgeCount?: number;
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
        relative flex items-center justify-center
        w-9 h-9 rounded-lg
        transition-all duration-300
        ${isActive
          ? "bg-white/20 text-white shadow-sm"
          : "bg-white/60 text-slate-500 group-hover:bg-burgundy/15 group-hover:text-burgundy group-hover:shadow-sm"
        }
      `}
    >
      <item.icon size={18} />
      {collapsed && badgeCount > 0 && (
        <span
          className={`absolute -top-1 ${isRTL ? "-left-1" : "-right-1"} min-w-[1.125rem] h-[1.125rem] px-1 rounded-full text-[10px] font-semibold leading-none flex items-center justify-center ${isActive ? "bg-white text-burgundy" : "bg-burgundy text-white"
            }`}
          aria-hidden
        >
          {formatBadgeCount(badgeCount)}
        </span>
      )}
    </div>

    {!collapsed && (
      <span
        className={`
          flex-1 min-w-0 text-[13px] leading-5 font-medium
          whitespace-normal break-words
          transition-colors duration-300
          ${isActive ? "text-white" : "text-slate-700 group-hover:text-burgundy"}
        `}
      >
        {t(item.label)}
      </span>
    )}

    {!collapsed && badgeCount > 0 && (
      <span
        className={`flex-shrink-0 min-w-[1.375rem] h-5 px-1.5 rounded-full text-[11px] font-semibold leading-none flex items-center justify-center ${isActive ? "bg-white text-burgundy" : "bg-burgundy text-white"
          }`}
        aria-label={`${badgeCount} new`}
      >
        {formatBadgeCount(badgeCount)}
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
        {badgeCount > 0 ? ` (${formatBadgeCount(badgeCount)})` : ""}
      </div>
    )}
  </button>
);

const Sidebar = ({
  collapsed,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const effectiveCollapsed = isMobile ? false : collapsed;
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [sidebarCounts, setSidebarCounts] = useState<SidebarBadgeCounts | null>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const masterBlockRef = useRef<HTMLDivElement>(null);
  const pendingScrollRestore = useRef<number | null>(null);
  const pendingScrollToMaster = useRef(false);

  const fetchSidebarCounts = useCallback(async () => {
    try {
      const [sidebarResult, appointmentResult, feedbackResult] = await Promise.allSettled([
        getSidebarCounts(),
        getAppointmentCounts(),
        getFeedbackCounts(),
      ]);

      setSidebarCounts((prev) => {
        const next: SidebarBadgeCounts = {
          appointments: prev?.appointments ?? 0,
          medicalRecordRequests: prev?.medicalRecordRequests ?? 0,
          jobApplications: prev?.jobApplications ?? 0,
          enquiries: prev?.enquiries ?? 0,
          feedback: prev?.feedback ?? 0,
          alSafwaEnrollments: prev?.alSafwaEnrollments ?? 0,
        };

        if (sidebarResult.status === "fulfilled" && sidebarResult.value.success) {
          const data = sidebarResult.value.data;
          next.medicalRecordRequests = data.medicalRecordRequests;
          next.jobApplications = data.jobApplications;
          next.enquiries = data.enquiries;
          next.alSafwaEnrollments = data.alSafwaEnrollments ?? 0;
        }

        if (appointmentResult.status === "fulfilled" && appointmentResult.value.success) {
          next.appointments = appointmentResult.value.data.total;
        }

        if (feedbackResult.status === "fulfilled" && feedbackResult.value.success) {
          next.feedback = feedbackResult.value.data.total;
        }

        return next;
      });
    } catch {
      // keep previous counts on failure
    }
  }, []);

  useEffect(() => {
    void fetchSidebarCounts();
    const interval = window.setInterval(() => {
      void fetchSidebarCounts();
    }, 60_000);
    const handleCountsRefresh = () => {
      void fetchSidebarCounts();
    };
    window.addEventListener("jobApplicationsUpdated", handleCountsRefresh);
    window.addEventListener("appointmentsUpdated", handleCountsRefresh);
    window.addEventListener("feedbackUpdated", handleCountsRefresh);
    window.addEventListener("alSafwaUpdated", handleCountsRefresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("jobApplicationsUpdated", handleCountsRefresh);
      window.removeEventListener("appointmentsUpdated", handleCountsRefresh);
      window.removeEventListener("feedbackUpdated", handleCountsRefresh);
      window.removeEventListener("alSafwaUpdated", handleCountsRefresh);
    };
  }, [fetchSidebarCounts, location.pathname]);

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

  /** Keep Master Data block (and items below) inside the nav viewport after expand. */
  const ensureMasterBlockVisible = useCallback(() => {
    const nav = navContainerRef.current;
    const block = masterBlockRef.current;
    if (!nav || !block) return;

    const padding = 16;
    const navRect = nav.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();

    if (blockRect.bottom > navRect.bottom - padding) {
      nav.scrollTop += blockRect.bottom - navRect.bottom + padding;
    }

    if (blockRect.top < navRect.top + padding) {
      nav.scrollTop -= navRect.top - blockRect.top + padding;
    }

    const maxScroll = Math.max(0, nav.scrollHeight - nav.clientHeight);
    nav.scrollTop = Math.min(nav.scrollTop, maxScroll);
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
    setMasterOpen((prev) => {
      const next = !prev;
      if (next) {
        pendingScrollToMaster.current = true;
        pendingScrollRestore.current = null;
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!masterOpen || !pendingScrollToMaster.current) return;

    pendingScrollToMaster.current = false;
    ensureMasterBlockVisible();

    const raf = requestAnimationFrame(ensureMasterBlockVisible);
    const t1 = window.setTimeout(ensureMasterBlockVisible, 50);
    const t2 = window.setTimeout(ensureMasterBlockVisible, 320);
    const t3 = window.setTimeout(ensureMasterBlockVisible, 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [masterOpen, ensureMasterBlockVisible]);

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
  }, [location.pathname, applySavedNavScroll, effectiveCollapsed]);

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
  const mainNavItems: NavItemConfig[] = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      excludeRoles: ["call_center"],
    },
    {
      to: "/appointment",
      icon: CalendarCheck,
      label: "Appointments",
      permissions: [
        PERMISSIONS.APPOINTMENT_REQUEST_VIEW,
        PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT,
        PERMISSIONS.APPOINTMENT_REQUEST_REJECT,
      ],
    },
    {
      to: "/medical-records-requests",
      icon: ClipboardList,
      label: "Medical Records Requests",
      permissions: [PERMISSIONS.MRR_VIEW],
    },
    {
      to: "/job-posts",
      icon: UserCheck,
      label: "Jobs",
      permissions: [PERMISSIONS.JOB_VIEW],
    },
    {
      to: "/enquiries",
      icon: Mail,
      label: "Enquiries",
      permissions: [PERMISSIONS.ENQUIRY_VIEW],
    },
    {
      to: "/al-safwa-enrollments",
      icon: Shield,
      label: "Al Safwa Enrollments",
      permissions: [PERMISSIONS.AL_SAFWA_VIEW],
    },
    {
      to: "/feedback",
      icon: MessageSquare,
      label: "Feedback & Reviews",
      permissions: [PERMISSIONS.FEEDBACK_VIEW],
    },
    {
      to: "/achievements",
      icon: Sparkles,
      label: "Employee Recognition",
      permissions: [PERMISSIONS.ACHIEVEMENT_VIEW],
    },
    {
      to: "/doctors",
      icon: Stethoscope,
      label: "Doctors",
      permissions: [PERMISSIONS.DOCTOR_VIEW],
    },
    {
      to: "/leadership",
      icon: UserCheck,
      label: "Leadership Team",
      permissions: [PERMISSIONS.LEADERSHIP_VIEW],
    },
    {
      to: "/csr",
      icon: Globe,
      label: "CSR",
      permissions: [PERMISSIONS.CSR_VIEW],
    },
    {
      to: "/work-culture",
      icon: BriefcaseBusiness,
      label: "Work Culture",
      permissions: [PERMISSIONS.WORK_CULTURE_VIEW],
    },
  ];

  // Other management items
  const managementNavItems: NavItemConfig[] = [
    {
      to: "/documents",
      icon: FileText,
      label: "Documents",
      permissions: [PERMISSIONS.DOCUMENT_VIEW],
    },
    {
      to: "/user-management",
      icon: Shield,
      label: "User Management",
      permissions: [PERMISSIONS.USER_VIEW],
    },
  ];

  const footerNavItems: NavItemConfig[] = [
    // {
    //   to: "/notifications",
    //   icon: Bell,
    //   label: "Notifications",
    // },
    {
      to: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const masterItems: NavItemConfig[] = [
    {
      to: "/categories",
      icon: Layers,
      label: "Categories",
      permissions: [PERMISSIONS.CATAGORY_VIEW],
    },
    {
      to: "/departments",
      icon: Building2,
      label: "Departments",
      permissions: [PERMISSIONS.DEPARTMENT_VIEW],
    },
    {
      to: "/subspecialities",
      icon: ListTree,
      label: "Subspecialities",
      permissions: [PERMISSIONS.SUBSPECIALITY_VIEW],
    },
  ];

  const showMasterSection =
    masterItems.some(isNavItemAllowed) ||
    managementNavItems.some(isNavItemAllowed);

  const handleNavClick = useCallback(
    (to: string) => {
      persistNavScroll();
      navigate(to, { preventScrollReset: true });
      if (isMobile) {
        onMobileClose?.();
      }
    },
    [navigate, persistNavScroll, isMobile, onMobileClose],
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
      badgeCount={getBadgeCountForRoute(item.to, sidebarCounts)}
      collapsed={effectiveCollapsed}
      isRTL={isRTL}
      hoveredItem={hoveredItem}
      setHoveredItem={setHoveredItem}
      t={t}
      onNavigate={handleNavClick}
    />
  );

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          bg-gradient-to-b from-white/95 via-white/90 to-white/95
          flex flex-col
          shrink-0 fixed
          shadow-2xl
          backdrop-blur-xl
          border border-white/40
          overflow-hidden
          transition-transform duration-300 ease-out
          ${
            isMobile
              ? `
                top-0 bottom-0 z-50 w-[min(300px,88vw)] max-w-[300px] h-[100dvh]
                rounded-none
                ${isRTL ? "right-0 border-l" : "left-0 border-r"}
                ${mobileOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}
                ${mobileOpen ? "" : "pointer-events-none"}
              `
              : `
                transition-all duration-500 ease-in-out
                ${effectiveCollapsed ? "w-[80px]" : "w-[300px]"}
                ${isRTL ? "right-3" : "left-3"}
                top-3 bottom-3 z-30 rounded-2xl
              `
          }
        `}
      >
        {/* Logo Section */}
        <div
          className={`relative flex items-center justify-center border-b border-slate-100 px-2 bg-gradient-to-r from-white to-slate-50/50 shrink-0 ${
            isMobile ? "h-20" : "h-28"
          }`}
        >
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
        ${effectiveCollapsed ? "h-14 w-44 max-w-full" : isMobile ? "h-16 w-full max-w-full" : "h-24 w-full max-w-full"}
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
              {mainNavItems.map((item) => (
                <PermissionGate
                  key={item.to}
                  permissions={item.permissions}
                  excludeRoles={item.excludeRoles}
                >
                  {renderNavItem(item, isRouteActive(item.to))}
                </PermissionGate>
              ))}
            </div>

            {/* Master Data + Documents — scroll target when dropdown opens */}
            {showMasterSection && (effectiveCollapsed ? (
              <div ref={masterBlockRef} className="space-y-0.5 mt-2">
                {masterItems.map((item) => (
                  <PermissionGate
                    key={item.to}
                    permissions={item.permissions}
                    excludeRoles={item.excludeRoles}
                  >
                    {renderNavItem(item, isRouteActive(item.to), false)}
                  </PermissionGate>
                ))}
                {managementNavItems.map((item) => (
                  <PermissionGate
                    key={item.to}
                    permissions={item.permissions}
                    excludeRoles={item.excludeRoles}
                  >
                    {renderNavItem(item, isRouteActive(item.to))}
                  </PermissionGate>
                ))}
              </div>
            ) : (
              <div ref={masterBlockRef} className="min-w-0">
                {masterItems.some(isNavItemAllowed) && (
                  <div className="mt-4 mb-2">
                    <button
                      type="button"
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

                    {masterOpen && (
                      <div className="mt-2 space-y-0.5 pl-2 border-l-2 border-burgundy/10 ml-3">
                        {masterItems.map((item) => (
                          <PermissionGate
                            key={item.to}
                            permissions={item.permissions}
                            excludeRoles={item.excludeRoles}
                          >
                            {renderNavItem(item, isRouteActive(item.to), true)}
                          </PermissionGate>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-0.5 mt-2 pb-2">
                  {managementNavItems.map((item) => (
                    <PermissionGate
                      key={item.to}
                      permissions={item.permissions}
                      excludeRoles={item.excludeRoles}
                    >
                      {renderNavItem(item, isRouteActive(item.to))}
                    </PermissionGate>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer Section */}
          <div className="border-t border-slate-100 bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm shrink-0 mt-auto overflow-x-hidden px-3">
            <div className="space-y-0.5 pt-3">
              {footerNavItems.map((item) => renderNavItem(item, isRouteActive(item.to)))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title={effectiveCollapsed ? t("Secure Logout") : undefined}
              aria-label={t("Secure Logout")}
              className={`
                box-border flex w-full max-w-full items-center gap-3 px-3 py-2.5 mb-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 group
                ${effectiveCollapsed ? "justify-center px-2" : ""}
              `}
            >
              <LogOut
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />

              {!effectiveCollapsed && <span>{t("Secure Logout")}</span>}
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