import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarCheck, Globe, MessageSquare,
  Stethoscope, Building2, Briefcase, FileText, BarChart3, Settings,
  LogOut, User, ClipboardList, Shield, Mail, UserCheck
} from "lucide-react";
import logo from "@/assets/rhh-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { logout } from "@/api/auth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/appointment-requests", icon: CalendarCheck, label: "Appointment Requests" },
  { to: "/medical-records-requests", icon: ClipboardList, label: "Medical Records Requests" },
  { to: "/international-patients", icon: Globe, label: "International Patients" },
  { to: "/al-safwa-enrollments", icon: Shield, label: "Al Safwa Enrollments" },
  { to: "/contact-messages", icon: Mail, label: "Contact Messages" },
  { to: "/job-applications", icon: UserCheck, label: "Job Applications" },
  { to: "/feedback", icon: MessageSquare, label: "Feedback & Reviews" },
  { to: "/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/departments", icon: Building2, label: "Departments" },
  { to: "/services", icon: Briefcase, label: "Hospitality Services" },
  { to: "/documents", icon: FileText, label: "Documents" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

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

  return (
    <aside className={`${collapsed ? "w-[72px]" : "w-64"} bg-sidebar min-h-screen flex flex-col transition-all duration-300 shrink-0 fixed ${isRTL ? "right-0" : "left-0"} top-0 z-30 h-screen border-${isRTL ? "l" : "r"} border-sidebar-border`}>
      <div className="h-20 flex items-center justify-center border-b border-sidebar-border px-3">
        <img src={logo} alt="Royale Hayat Hospital" className={collapsed ? "h-16 w-auto" : "h-20 w-auto object-contain"} />
      </div>

      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-sans transition-colors mb-0.5
                ${isActive
                  ? `bg-sidebar-accent text-burgundy font-medium ${isRTL ? "border-r-2" : "border-l-2"} border-burgundy`
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-burgundy"
                }
              `}
            >
              <item.icon size={17} className={isActive ? "text-burgundy" : ""} />
              {!collapsed && <span className="truncate">{t(item.label)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border py-2">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-sans transition-colors
            ${location.pathname === "/settings" ? "bg-sidebar-accent text-burgundy font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-burgundy"}`}
        >
          <Settings size={17} />
          {!collapsed && <span>{t("Settings")}</span>}
        </NavLink>
        {/* <div className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-sans text-sidebar-foreground">
          <User size={17} />
          {!collapsed && <span className="truncate">{t("Admin")}</span>}
        </div> */}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-sans transition-colors text-error hover:bg-error/5 w-full text-left">
          <LogOut size={17} />
          {!collapsed && <span>{t("Secure Logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
