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
  Award,
  Heart,
  Users,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLayoutControls } from "./LayoutControlsContext";

const pageMap: Record<string, { label: string; icon: any; description?: string }> = {
  "/":                          { label: "Dashboard",                icon: LayoutDashboard, description: "Overview of hospital operations and key metrics" },
  "/appointment":      { label: "Appointments",     icon: CalendarCheck, description: "Manage and review patient appointments" },
  "/medical-records-requests":  { label: "Medical Records Requests", icon: ClipboardList, description: "Handle medical record access requests" },
  "/medical-record":            { label: "Medical Records Requests", icon: ClipboardList, description: "Handle medical record access requests" },
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
  "/job-posts":                 { label: "Job Posts",                icon: UserCheck, description: "Manage job postings and track applications" },
  "/jobs":                      { label: "Job Posts",                icon: UserCheck, description: "Manage job postings and track applications" },
  "/achievements":              { label: "Achievements",             icon: Award, description: "Manage employee achievements and recognitions" },
  "/csr":                       { label: "CSR Initiatives",          icon: Heart, description: "Manage CSR initiatives and Celebrating Life content" },
  "/work-culture":              { label: "Work Culture",             icon: Sparkles, description: "Manage work culture events and Life at RHH content" },
  "/leadership":                { label: "Leadership Team",          icon: Users, description: "Manage leadership team members" },
  "/life-at-rhh":               { label: "Life at RHH",              icon: Sparkles, description: "Manage Life at RHH content" },
};

// Add descriptions for nested routes
const nestedDescriptions: Record<string, string> = {
  "/medical-record/view": "View medical record request details",
  "/enquiries/view": "View enquiry details",
  "/doctors/edit": "Update doctor information",
  "/categories/create": "Add new category",
  "/categories/edit": "Update category details",
  "/subspecialities/create": "Create new subspeciality",
  "/subspecialities/edit": "Update subspeciality details",
  "/departments/create": "Create new department",
  "/departments/edit": "Modify department settings",
  "/services/create": "Add new hospitality service",
  "/services/edit": "Update service details",
  "/job-posts/create": "Create a new job posting",
  "/job-posts/edit": "Update job posting details",
  "/job-posts/view": "View job posting details",
  "/jobs/create": "Create a new job posting",
  "/jobs/edit": "Update job posting details",
  "/jobs/view": "View job posting details",
  "/jobs/view-applications": "View job applications",
  "/achievements/create": "Add a new employee achievement",
  "/achievements/edit": "Update achievement details",
  "/achievements/view": "View achievement details",
  "/csr/create": "Add a new CSR initiative",
  "/csr/view": "View CSR initiative details",
  "/csr/edit": "Update CSR initiative",
  "/work-culture/create": "Add a new work culture event",
  "/work-culture/view": "View work culture event details",
  "/work-culture/edit": "Update work culture event",
  "/leadership/create": "Add a new leadership team member",
  "/leadership/view": "View leadership member details",
  "/leadership/edit": "Update leadership team member",
};

const nestedPageLabels: Record<string, { label: string; description: string }> = {
  "/csr/create": { label: "Add CSR Initiative", description: "Create a new CSR initiative" },
  "/csr/view": { label: "View CSR Initiative", description: "View CSR initiative details" },
  "/csr/edit": { label: "Edit CSR Initiative", description: "Update CSR initiative" },
  "/work-culture/create": { label: "Add Work Culture Event", description: "Create a new work culture event" },
  "/work-culture/view": { label: "View Work Culture", description: "View work culture event details" },
  "/work-culture/edit": { label: "Edit Work Culture", description: "Update work culture event" },
  "/leadership/create": { label: "Add Leadership Member", description: "Add a new leadership team member" },
  "/leadership/view": { label: "View Leadership", description: "View leadership member details" },
  "/leadership/edit": { label: "Edit Leadership", description: "Update leadership team member" },
  "/jobs/view": { label: "View Job Post", description: "View job posting details" },
  "/jobs/edit": { label: "Edit Job Post", description: "Update job posting details" },
  "/jobs/create": { label: "Create Job Post", description: "Create a new job posting" },
  "/jobs/view-applications": { label: "Job Applications", description: "View job applications" },
  "/job-posts/view": { label: "View Job Post", description: "View job posting details" },
  "/job-posts/edit": { label: "Edit Job Post", description: "Update job posting details" },
  "/job-posts/create": { label: "Create Job Post", description: "Create a new job posting" },
};

/** When nested routes use a different prefix than the list page (e.g. /jobs/* → /job-posts) */
const breadcrumbLinkOverrides: Record<string, string> = {
  jobs: "/job-posts",
};

const BreadCrumb = ({ lastCrumbLabel }: { lastCrumbLabel?: string } = {}) => {
  const location = useLocation();
  const { t } = useLanguage();
  const layoutControls = useLayoutControls();

  // Get current path segments
  const pathnames = location.pathname.split("/").filter((x) => x);

  const nestedKey = Object.keys(nestedPageLabels)
    .filter((key) => location.pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  // Match the most specific route first
  let match = pageMap[location.pathname];
  let description = match?.description;
  let pageLabel = match?.label;

  if (!match) {
    const basePath = `/${pathnames[0] || ""}`;
    match = pageMap[basePath];

    const descKey = Object.keys(nestedDescriptions)
      .filter((key) => location.pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    description =
      (descKey ? nestedDescriptions[descKey] : undefined) ||
      `Manage ${match?.label?.toLowerCase() || "items"}`;
    pageLabel = match?.label;
  }

  if (nestedKey) {
    pageLabel = nestedPageLabels[nestedKey].label;
    description = nestedPageLabels[nestedKey].description;
  }

  const { icon: Icon } = match ?? { icon: FolderOpen };
  const label = pageLabel ?? "Page";
  const pageDescription =
    description || `Manage and configure ${label.toLowerCase()} settings`;

  // Breadcrumb trail (hide MongoDB ObjectId segments)
  const breadcrumbItems: { segment: string; to: string; parentSegment?: string }[] = [];
  let pathSoFar = "";
  pathnames.forEach((segment, index) => {
    pathSoFar += `/${segment}`;
    if (/^[0-9a-fA-F]{24}$/.test(segment)) return;
    breadcrumbItems.push({
      segment,
      to: breadcrumbLinkOverrides[segment] ?? pathSoFar,
      parentSegment: index > 0 ? pathnames[index - 1] : undefined,
    });
  });

  // Helper to format path segment
  const formatSegment = (segment: string, parentSegment?: string) => {
    // MongoDB ObjectId — replace with a readable label based on context
    if (/^[0-9a-fA-F]{24}$/.test(segment)) {
      const contextLabels: Record<string, string> = {
        "view": "Details",
        "edit": "Edit",
        "view-applications": "Applications",
        "apply": "Apply",
        "jobs": "Details",
        "medical-record": "Details",
        "doctors": "Details",
        "departments": "Details",
        "subspecialities": "Details",
        "achievements": "Details",
        "enquiries": "Details",
        "csr": "Details",
        "leadership": "Details",
        "work-culture": "Details",
      };
      return contextLabels[parentSegment ?? ""] ?? "Details";
    }

    const specialSegments: Record<string, string> = {
      "appointment-requests": "Appointment Requests",
      "medical-records-requests": "Medical Records Requests",
      "medical-record": "Medical Records Requests",
      "international-patients": "International Patients",
      "al-safwa-enrollments": "Al Safwa Enrollments",
      "job-applications": "Job Applications",
      "job-posts": "Job Posts",
      "jobs": "Job Posts",
      "view-applications": "View Applications",
      "subspecialities": "Subspecialities",
      "hospitality-services": "Hospitality Services",
      "achievements": "Achievements",
      "csr": "CSR Initiatives",
      "work-culture": "Work Culture",
      "leadership": "Leadership Team",
      "life-at-rhh": "Life at RHH",
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
            {layoutControls && (
              <button
                onClick={layoutControls.toggleSidebar}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-burgundy/25 bg-white/90 text-burgundy shadow-sm transition-all duration-200 hover:scale-105 hover:bg-burgundy/10"
                aria-label={layoutControls.collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={layoutControls.collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {layoutControls.collapsed ? (
                  <PanelLeftOpen size={16} />
                ) : (
                  <PanelLeftClose size={16} />
                )}
              </button>
            )}
            <span className="text-sm text-slate-500 font-medium">{t("Pages")}</span>
            <ChevronRight size={14} className="text-slate-400" />
            <div className="flex items-center flex-wrap gap-2">
              {/* Home Link */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-burgundy/10 text-slate-600 hover:text-burgundy transition-all duration-200 text-sm font-medium shadow-sm border border-slate-200/50 backdrop-blur-sm"
              >
                <Home size={14} />
                <span>{t("Home")}</span>
              </Link>
              
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                const isClickable = !!pageMap[item.to] && !isLast;
                const formattedLabel =
                  isLast && lastCrumbLabel
                    ? lastCrumbLabel
                    : t(formatSegment(item.segment, item.parentSegment));

                return (
                  <div key={item.to} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    {isClickable ? (
                      <Link
                        to={item.to}
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
            {t(pageDescription)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreadCrumb;