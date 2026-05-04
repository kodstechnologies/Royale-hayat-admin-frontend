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
      className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-burgundy/10 to-burgundy/5 text-burgundy shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-burgundy"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
    >
      <item.icon 
        size={20} 
        className={`transition-all duration-200 ${
          isActive 
            ? "text-burgundy" 
            : "text-sidebar-foreground/70 group-hover:text-burgundy group-hover:scale-105"
        }`}
      />
      {!collapsed && (
        <span className="truncate">{t(item.label)}</span>
      )}
      
      {/* Tooltip for collapsed mode */}
      {collapsed && hoveredItem === item.to && (
        <div className={`fixed ${isRTL ? "right-20" : "left-20"} z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap`}>
          {t(item.label)}
        </div>
      )}
    </NavLink>
  );

  return (
    <aside 
      className={`${collapsed ? "w-20" : "w-64"} bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 min-h-screen flex flex-col transition-all duration-300 ease-in-out shrink-0 fixed ${isRTL ? "right-0" : "left-0"} top-0 z-30 h-screen shadow-2xl`}
    >
      {/* Logo Section */}
      <div className="relative h-24 flex items-center justify-center border-b border-sidebar-border/50 px-3 bg-white/5 backdrop-blur-sm">
        <div className="relative">
          <img 
            src={logo} 
            alt="Royale Hayat Hospital" 
            className={`transition-all duration-300 object-contain ${
              collapsed ? "h-12 w-auto" : "h-16 w-auto"
            }`} 
          />
        </div>
        
        {/* Toggle Button */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-burgundy hover:text-white transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {collapsed ? (
              <ChevronRight size={16} className={isRTL ? "rotate-180" : ""} />
            ) : (
              <ChevronLeft size={16} className={isRTL ? "rotate-180" : ""} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-accent">
        {/* Main Section */}
        {!collapsed && (
          <div className="px-4 mb-3">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              {t("Main")}
            </p>
          </div>
        )}
        <div className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = isRouteActive(item.to);
            return <NavItem key={item.to} item={item} isActive={isActive} />;
          })}
        </div>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sidebar-border/30"></div>
          </div>
          {!collapsed && (
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-sidebar text-sidebar-foreground/50">
                {t("Management")}
              </span>
            </div>
          )}
        </div>

        {/* Management Section */}
        <div className="space-y-0.5">
          {managementNavItems.map((item) => {
            const isActive = isRouteActive(item.to);
            return <NavItem key={item.to} item={item} isActive={isActive} />;
          })}
        </div>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sidebar-border/30"></div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="space-y-0.5">
          {(() => {
            const isActive = isRouteActive(reportsNavItem.to);
            return <NavItem item={reportsNavItem} isActive={isActive} />;
          })()}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-sidebar-border/50 bg-white/5 backdrop-blur-sm">
        {/* User Profile (Optional) */}
      

        {/* Settings */}
        <NavLink
          to="/settings"
          title={collapsed ? t("Settings") : undefined}
          aria-label={t("Settings")}
          className={({ isActive }) => `
            group flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-200
            ${isActive || isRouteActive("/settings")
              ? "bg-gradient-to-r from-burgundy/10 to-burgundy/5 text-burgundy"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-burgundy"
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
          className={`flex items-center gap-3 px-3 py-2.5 mx-2 mb-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full group
            ${collapsed ? "justify-center px-2" : ""}
          `}
        >
          <LogOut size={20} className="transition-transform group-hover:translate-x-0.5" />
          {!collapsed && <span>{t("Secure Logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;