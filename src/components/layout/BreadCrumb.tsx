import { useLocation, Link } from "react-router-dom";
import {
  FolderOpen,
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  Globe,
  Shield,
  Mail,
  UserCheck,
  MessageSquare,
  Stethoscope,
  Layers,
  ListTree,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  Home,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const pageMap: Record<string, { label: string; icon: any; description?: string }> = {
  "/":                          { label: "Dashboard",                icon: LayoutDashboard, description: "Overview of hospital operations and key metrics" },
  "/appointment-requests":      { label: "Appointment Requests",     icon: CalendarCheck, description: "Manage and review patient appointment requests" },
  "/medical-records-requests":  { label: "Medical Records Requests", icon: ClipboardList, description: "Handle medical record access requests" },
  "/international-patients":    { label: "International Patients",   icon: Globe, description: "Manage international patient inquiries and records" },
  "/al-safwa-enrollments":      { label: "Al Safwa Enrollments",     icon: Shield, description: "Process and manage Al Safwa program enrollments" },
  "/enquiries":                 { label: "Enquiries",                icon: Mail, description: "View and respond to patient enquiries" },
  "/job-applications":          { label: "Job Applications",         icon: UserCheck, description: "Review and manage job applications" },
  "/feedback":                  { label: "Feedback & Reviews",       icon: MessageSquare, description: "Monitor patient feedback and reviews" },
  "/doctors":                   { label: "Doctors",                  icon: Stethoscope, description: "Manage doctor profiles and schedules" },
  "/categories":                { label: "Categories",               icon: Layers, description: "Organize and manage content categories" },
  "/subspecialities":           { label: "Subspecialities",          icon: ListTree, description: "Manage medical subspecialties" },
  "/departments":               { label: "Departments",              icon: Building2, description: "Configure hospital departments" },
  "/services":                  { label: "Hospitality Services",     icon: Briefcase, description: "Manage hospitality services offered" },
  "/documents":                 { label: "Documents",                icon: FileText, description: "Upload and manage hospital documents" },
  "/reports":                   { label: "Reports",                  icon: BarChart3, description: "Generate and view analytics reports" },
  "/settings":                  { label: "Settings",                 icon: Settings, description: "Configure system preferences" },
};

// Add descriptions for nested routes
const nestedDescriptions: Record<string, string> = {
  "/doctors/create": "Add new doctor to the hospital",
  "/doctors/edit": "Update doctor information",
  "/categories/create": "Add new category",
  "/categories/edit": "Update category details",
  "/subspecialities/create": "Create new subspeciality",
  "/subspecialities/edit": "Update subspeciality details",
  "/departments/create": "Create new department",
  "/departments/edit": "Modify department settings",
  "/services/create": "Add new hospitality service",
  "/services/edit": "Update service details",
};

const BreadCrumb = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Get current path segments
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Match the most specific route first
  let match = pageMap[location.pathname];
  let description = match?.description;
  
  if (!match) {
    // Check for nested routes
    const basePath = `/${pathnames[0] || ""}`;
    match = pageMap[basePath];
    description = nestedDescriptions[location.pathname] || `Manage ${match?.label?.toLowerCase() || "items"}`;
  }
  
  const { label, icon: Icon } = match ?? { label: "Page", icon: FolderOpen };
  const pageDescription = description || `Manage and configure ${label.toLowerCase()} settings`;

  // Helper to format path segment
  const formatSegment = (segment: string) => {
    const specialSegments: Record<string, string> = {
      "appointment-requests": "Appointment Requests",
      "medical-records-requests": "Medical Records Requests",
      "international-patients": "International Patients",
      "al-safwa-enrollments": "Al Safwa Enrollments",
      "job-applications": "Job Applications",
      "subspecialities": "Subspecialities",
      "hospitality-services": "Hospitality Services",
      "create": "Create New",
      "edit": "Edit",
      "view": "View Details",
    };
    
    if (specialSegments[segment]) {
      return specialSegments[segment];
    }
    
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full">
      {/* Breadcrumb Card - With beautiful burgundy themed background */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-burgundy/5 via-white to-burgundy/3 border-2 border-burgundy/20 shadow-xl backdrop-blur-sm overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-burgundy/60 via-burgundy to-burgundy/60"></div>
        
        {/* Content */}
        <div className="px-8 py-6">
          {/* Breadcrumb navigation */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-sm text-slate-500 font-medium">Pages</span>
            <ChevronRight size={14} className="text-slate-400" />
            <div className="flex items-center flex-wrap gap-2">
              {/* Home Link */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-burgundy/10 text-slate-600 hover:text-burgundy transition-all duration-200 text-sm font-medium shadow-sm border border-slate-200/50 backdrop-blur-sm"
              >
                <Home size={14} />
                <span>Home</span>
              </Link>
              
              {pathnames.map((segment, index) => {
                const isLast = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isClickable = pageMap[to] && !isLast;
                const formattedLabel = formatSegment(segment);
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    {isClickable ? (
                      <Link
                        to={to}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/80 hover:bg-burgundy/10 text-slate-600 hover:text-burgundy transition-all duration-200 text-sm font-medium shadow-sm border border-slate-200/50 backdrop-blur-sm"
                      >
                        {formattedLabel}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-burgundy/20 to-burgundy/10 text-burgundy font-semibold text-sm border border-burgundy/40 shadow-md backdrop-blur-sm">
                        {formattedLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Page Title with Icon */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy/25 to-burgundy/10 border border-burgundy/30 flex items-center justify-center shadow-md">
              <Icon size={20} className="text-burgundy" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {t(label)}
            </h1>
          </div>
          
          {/* Page Description */}
          <p className="text-sm text-slate-500 ml-0">
            {pageDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreadCrumb;