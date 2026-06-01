import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  Briefcase,
  Hash,
  Download,
  Calendar,
  Clock,
  Eye,
  Loader2,
  Printer,
  ChevronRight,
  Filter,
  Trash2,
  Users,
} from "lucide-react";
import AlertBox from "@/components/AlertBox";
import { toast } from "sonner";
import {
  JobApplication,
  getApplicationsByJobId as getDummyApplicationsByJobId,
  getApplicationById as getDummyApplicationById,
} from "@/data/dummyApplications";
import { adminJobs } from "@/data/adminJobs";
import {
  getJobById as getJobByIdApi,
  getApplicationsByJobId as getApplicationsByJobIdApi,
  getJobApplicationById as getJobApplicationByIdApi,
  deleteJobApplication as deleteJobApplicationApi,
  updateJobApplication as updateJobApplicationApi,
  type JobApplicationStatus,
  type JobApplicationStatusFilter,
} from "@/api/job";
import { scrollPageToTop, useScrollToTop } from "@/hooks/useScrollToTop";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

const formatBadgeCount = (count: number) => (count > 99 ? "99+" : String(count));

const notifyApplicationsUpdated = () => {
  window.dispatchEvent(new Event("jobApplicationsUpdated"));
};

const formatDate = (dateString: string) => {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (status?: string): JobApplicationStatus => {
  if (status === "reviewed") return "reviewed";
  return "pending";
};

const statusConfig: Record<
  JobApplicationStatus,
  {
    icon: React.ElementType;
    badgeClass: string;
    activeClass: string;
    inactiveClass: string;
    label: string;
    shortLabel: string;
    description: string;
  }
> = {
  pending: {
    icon: Clock,
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",
    activeClass:
      "bg-white text-amber-700 shadow-sm ring-1 ring-amber-200/80",
    inactiveClass: "text-slate-500 hover:text-amber-700 hover:bg-amber-50/60",
    label: "Pending Review",
    shortLabel: "Pending",
    description: "Application is waiting to be reviewed.",
  },
  reviewed: {
    icon: Eye,
    badgeClass: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70",
    activeClass: "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200/80",
    inactiveClass: "text-slate-500 hover:text-blue-700 hover:bg-blue-50/60",
    label: "Reviewed",
    shortLabel: "Reviewed",
    description: "Application has been reviewed by the team.",
  },
};

const statusOptions: JobApplicationStatus[] = ["pending", "reviewed"];

const StatusBadge = ({
  status,
  size = "sm",
}: {
  status: JobApplicationStatus;
  size?: "sm" | "md";
}) => {
  const normalized = normalizeStatus(status);
  const cfg = statusConfig[normalized];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.badgeClass} ${
        size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icon size={size === "md" ? 14 : 12} />
      {cfg.label}
    </span>
  );
};

type ApplicationStatusToggleProps = {
  value: JobApplicationStatus;
  onChange: (status: JobApplicationStatus) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  showDescription?: boolean;
  className?: string;
};

const ApplicationStatusToggle = ({
  value,
  onChange,
  disabled = false,
  size = "sm",
  showDescription = false,
  className = "",
}: ApplicationStatusToggleProps) => {
  const normalized = normalizeStatus(value);
  const isCompact = size === "sm";

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <div
        className={`relative inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 ${
          isCompact ? "gap-0.5" : "gap-1 w-full"
        } ${disabled ? "opacity-70" : ""}`}
        role="group"
        aria-label="Application status"
      >
        {statusOptions.map((option) => {
          const cfg = statusConfig[option];
          const Icon = cfg.icon;
          const isActive = normalized === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (!disabled && option !== normalized) {
                  onChange(option);
                }
              }}
              disabled={disabled}
              aria-pressed={isActive}
              className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                isCompact ? "px-2.5 py-1.5 text-[11px]" : "flex-1 px-3 py-2.5 text-sm"
              } ${isActive ? cfg.activeClass : cfg.inactiveClass}`}
            >
              <Icon size={isCompact ? 12 : 14} />
              <span>{isCompact ? cfg.shortLabel : cfg.label}</span>
            </button>
          );
        })}

        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="h-4 w-4 animate-spin text-burgundy" />
          </div>
        )}
      </div>

      {showDescription && (
        <p className="text-xs leading-relaxed text-slate-500">
          {statusConfig[normalized].description}
        </p>
      )}
    </div>
  );
};

type StatusCounts = {
  all: number;
  pending: number;
  reviewed: number;
};

const defaultStatusCounts: StatusCounts = {
  all: 0,
  pending: 0,
  reviewed: 0,
};

type ApplicationStatusFilterBarProps = {
  value: JobApplicationStatusFilter;
  onChange: (value: JobApplicationStatusFilter) => void;
  counts: StatusCounts;
  disabled?: boolean;
};

const ApplicationStatusFilterBar = ({
  value,
  onChange,
  counts,
  disabled = false,
}: ApplicationStatusFilterBarProps) => {
  const filters: {
    key: JobApplicationStatusFilter;
    label: string;
    count: number;
    activeClass: string;
  }[] = [
    {
      key: "all",
      label: "All",
      count: counts.all,
      activeClass: "bg-burgundy text-white shadow-sm ring-1 ring-burgundy/30",
    },
    {
      key: "pending",
      label: "Pending",
      count: counts.pending,
      activeClass: "bg-amber-500 text-white shadow-sm ring-1 ring-amber-200",
    },
    {
      key: "reviewed",
      label: "Reviewed",
      count: counts.reviewed,
      activeClass: "bg-blue-600 text-white shadow-sm ring-1 ring-blue-200",
    },
  ];

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4 text-burgundy" />
          Filter by status
        </div>
        <div className="inline-flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = value === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                disabled={disabled}
                onClick={() => onChange(filter.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? filter.activeClass
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                    isActive ? "bg-white/20 text-inherit" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const resolveJobRef = (jobRef: unknown) => {
  if (!jobRef) {
    return { jobTitle: "", jobId: "" };
  }
  if (typeof jobRef === "string") {
    return { jobTitle: "", jobId: jobRef };
  }
  if (typeof jobRef === "object") {
    const job = jobRef as { title?: string; jobId?: string; _id?: string };
    return {
      jobTitle: job.title ?? "",
      jobId: job.jobId ?? (job._id ? String(job._id) : ""),
    };
  }
  return { jobTitle: "", jobId: String(jobRef) };
};

const mapApiApplication = (app: any): JobApplication => {
  const { jobTitle, jobId } = resolveJobRef(app.jobId);

  return {
    _id: String(app._id ?? ""),
    applicationId: app.applicationId ?? String(app._id ?? ""),
    fullName: app.fullName ?? "",
    email: app.email ?? "",
    phone: app.phone ?? "",
    cvUrl: app.resume ?? "",
    coverLetter: app.coverLetter ?? app.tellusUrself ?? "",
    jobTitle,
    jobId,
    appliedDate: app.appliedDate ?? app.createdAt ?? new Date().toISOString(),
    status: normalizeStatus(app.status),
    isViewed: app.isViewed ?? false,
    experience: app.experience,
    currentCompany: app.currentCompany,
    noticePeriod: app.noticePeriod,
  };
};

type ApplicationListProps = {
  jobMongoId: string;   // MongoDB _id of the job (from URL param)
  onSelect: (app: JobApplication) => void;
};

const ApplicationList = ({ jobMongoId, onSelect }: ApplicationListProps) => {
  const navigate = useNavigate();
  const canDeleteApplication = hasPermission(PERMISSIONS.JOB_APPLICATION_DELETE);
  const canUpdateApplication = hasPermission(PERMISSIONS.JOB_APPLICATION_UPDATE);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] =
    useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<JobApplicationStatusFilter>("all");
  const [statusCounts, setStatusCounts] =
    useState<StatusCounts>(defaultStatusCounts);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let resolvedJobId = jobMongoId; // may be overwritten with jobId string
      try {
        const jobRes = await getJobByIdApi(jobMongoId);
        const apiJob = jobRes.data?.data;
        if (apiJob) {
          setJobTitle(apiJob.title);
          resolvedJobId = apiJob.jobId ?? jobMongoId;
        }
      } catch {
        const staticJob = adminJobs.find((j) => j.id === jobMongoId);
        if (staticJob) {
          setJobTitle(staticJob.title);
          resolvedJobId = staticJob.jobId;
        }
      }

      try {
        const appRes = await getApplicationsByJobIdApi(
          jobMongoId,
          statusFilter === "all" ? undefined : { status: statusFilter },
        );
        const apiApps: JobApplication[] = (appRes.data?.data ?? []).map(
          mapApiApplication,
        );
        const counts = appRes.data?.meta?.counts;

        if (counts) {
          setStatusCounts({
            all: counts.all ?? 0,
            pending: counts.pending ?? 0,
            reviewed: counts.reviewed ?? 0,
          });
        }

        setApplications(apiApps);
      } catch {
        const dummyApps = getDummyApplicationsByJobId(resolvedJobId);
        const filteredDummy =
          statusFilter === "all"
            ? dummyApps
            : dummyApps.filter((app) => app.status === statusFilter);
        setApplications(filteredDummy);
        setStatusCounts({
          all: dummyApps.length,
          pending: dummyApps.filter((app) => app.status === "pending").length,
          reviewed: dummyApps.filter((app) => app.status === "reviewed").length,
        });
      } finally {
        setLoading(false);
      }
    };

    load();

    const handleApplicationsUpdated = () => {
      void load();
    };
    window.addEventListener("jobApplicationsUpdated", handleApplicationsUpdated);
    return () => window.removeEventListener("jobApplicationsUpdated", handleApplicationsUpdated);
  }, [jobMongoId, statusFilter]);

  const handleSelect = (app: JobApplication) => {
    scrollPageToTop();
    onSelect({
      ...app,
      isViewed: true,
    });
  };

  const handleDeleteClick = (app: JobApplication) => {
    if (!hasPermission(PERMISSIONS.JOB_APPLICATION_DELETE)) return;
    setApplicationToDelete(app);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!applicationToDelete?._id || !hasPermission(PERMISSIONS.JOB_APPLICATION_DELETE)) return;

    setIsDeleting(true);
    try {
      await deleteJobApplicationApi(applicationToDelete._id);
      toast.success("Job application deleted successfully");
      setDeleteOpen(false);
      setApplicationToDelete(null);
      notifyApplicationsUpdated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Failed to delete job application",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (
    appId: string,
    newStatus: JobApplicationStatus,
  ) => {
    if (!appId) return;
    if (!hasPermission(PERMISSIONS.JOB_APPLICATION_UPDATE)) {
      toast.error("You do not have permission to update job applications");
      return;
    }

    setUpdatingStatusId(appId);
    try {
      await updateJobApplicationApi(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app,
        ),
      );
      toast.success(
        newStatus === "reviewed"
          ? "Application marked as reviewed"
          : "Application marked as pending",
      );
      notifyApplicationsUpdated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const unviewedCount = applications.filter((app) => !app.isViewed).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <BreadCrumb />

      <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

        <div className="p-4 sm:p-6">
          
          <div className="flex items-start gap-3 mb-4 sm:mb-6 min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/jobs/view/${jobMongoId}`)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
              aria-label="Back to job"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
                Job Applications
              </h2>
              {jobTitle && (
                <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>{jobTitle}</span>
                  <span className="text-slate-400">&mdash;</span>
                  <span className="font-medium text-burgundy">
                    {statusCounts.all} application
                    {statusCounts.all !== 1 ? "s" : ""}
                    {statusFilter !== "all" && (
                      <span className="text-slate-500 font-normal">
                        {" "}
                        ({applications.length} shown)
                      </span>
                    )}
                  </span>
                  
                </p>
              )}
            </div>
          </div>

          <ApplicationStatusFilterBar
            value={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            disabled={loading}
          />

          
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {statusFilter === "all"
                  ? "No applications yet"
                  : `No ${statusFilter === "pending" ? "pending" : "reviewed"} applications`}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {statusFilter === "all"
                  ? "Applications submitted for this job will appear here."
                  : "Try another status filter or clear the filter to see all applications."}
              </p>
              {statusFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="mt-4 text-sm font-medium text-burgundy hover:underline"
                >
                  Show all applications
                </button>
              )}
            </div>
          ) : (
            <>
            
            <div className="md:hidden space-y-3">
              {applications.map((app) => (
                <article
                  key={app._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(app)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(app);
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-semibold text-burgundy bg-burgundy/10 px-2 py-1 rounded-md break-all">
                      {app.applicationId}
                    </span>
                    {!app.isViewed && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-burgundy shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                      <span className="text-burgundy text-sm font-semibold">
                        {(app.fullName || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {app.fullName}
                      </p>
                      {app.currentCompany && (
                        <p className="text-xs text-slate-500 truncate">
                          {app.currentCompany}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{app.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      {app.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(app.appliedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div
                    className="mb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canUpdateApplication ? (
                      <ApplicationStatusToggle
                        value={normalizeStatus(app.status)}
                        onChange={(status) =>
                          void handleStatusChange(app._id, status)
                        }
                        disabled={updatingStatusId === app._id}
                        size="sm"
                        className="w-full"
                      />
                    ) : (
                      <StatusBadge status={normalizeStatus(app.status)} />
                    )}
                  </div>
                  <div
                    className="flex gap-2 pt-3 border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(app)}
                      className={`${canDeleteApplication ? "flex-1" : "w-full"} inline-flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-burgundy bg-burgundy/10`}
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <PermissionGate permission={PERMISSIONS.JOB_APPLICATION_DELETE}>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(app)}
                        className="p-2 rounded-lg text-red-600 bg-red-50"
                        aria-label="Delete application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </PermissionGate>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Applied Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr
                      key={app._id}
                      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                      onClick={() => handleSelect(app)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-burgundy bg-burgundy/10 px-2 py-1 rounded-md">
                            {app.applicationId}
                          </span>
                          {!app.isViewed && (
                            <span className="min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-burgundy text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
                              1
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                            <span className="text-burgundy text-sm font-semibold">
                              {(app.fullName || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800 text-sm">{app.fullName}</p>
                              {!app.isViewed && (
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-burgundy">
                                  New
                                </span>
                              )}
                            </div>
                            {app.currentCompany && (
                              <p className="text-xs text-slate-500">{app.currentCompany}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {app.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {app.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(app.appliedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        {canUpdateApplication ? (
                          <ApplicationStatusToggle
                            value={normalizeStatus(app.status)}
                            onChange={(status) =>
                              void handleStatusChange(app._id, status)
                            }
                            disabled={updatingStatusId === app._id}
                            size="sm"
                          />
                        ) : (
                          <StatusBadge status={normalizeStatus(app.status)} />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="inline-flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelect(app)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-burgundy hover:underline"
                          >
                            View
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <PermissionGate permission={PERMISSIONS.JOB_APPLICATION_DELETE}>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(app)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setApplicationToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Job Application"
        message={`Are you sure you want to delete the application from "${applicationToDelete?.fullName}" (${applicationToDelete?.applicationId})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />
    </div>
  );
};

type ApplicationDetailProps = {
  applicationId: string;   // _id of the selected application
  initialData: JobApplication; // pre-loaded from list (used as fallback)
  onBack: () => void;
};

const ApplicationDetail = ({ applicationId, initialData, onBack }: ApplicationDetailProps) => {
  const canUpdateApplication = hasPermission(PERMISSIONS.JOB_APPLICATION_UPDATE);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [application, setApplication] = useState<JobApplication>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const hasMarkedViewedRef = useRef(false);

  useScrollToTop(applicationId);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsRefreshing(true);
      try {
        const res = await getJobApplicationByIdApi(applicationId);
        if (cancelled) return;

        const apiApp = res.data?.data;
        if (apiApp) {
          setApplication(mapApiApplication(apiApp));
          if (!hasMarkedViewedRef.current) {
            hasMarkedViewedRef.current = true;
            notifyApplicationsUpdated();
          }
          return;
        }
      } catch {
        if (cancelled) return;
      }

      const dummy = getDummyApplicationById(applicationId);
      if (!cancelled && dummy) {
        setApplication(dummy);
      }
    };

    void load().finally(() => {
      if (!cancelled) {
        setIsRefreshing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const handleStatusChange = async (newStatus: JobApplicationStatus) => {
    if (!application._id) return;
    if (!hasPermission(PERMISSIONS.JOB_APPLICATION_UPDATE)) {
      toast.error("You do not have permission to update job applications");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await updateJobApplicationApi(application._id, {
        status: newStatus,
      });
      const updated = res.data?.data;
      setApplication(
        updated
          ? mapApiApplication(updated)
          : { ...application, status: newStatus },
      );
      toast.success(
        newStatus === "reviewed"
          ? "Application marked as reviewed"
          : "Application marked as pending",
      );
      notifyApplicationsUpdated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!application._id || !hasPermission(PERMISSIONS.JOB_APPLICATION_DELETE)) return;

    setIsDeleting(true);
    try {
      await deleteJobApplicationApi(application._id);
      toast.success("Job application deleted successfully");
      setDeleteOpen(false);
      notifyApplicationsUpdated();
      onBack();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Failed to delete job application",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <BreadCrumb />

      <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

        <div className="p-4 sm:p-6">
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                aria-label="Back to applications"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
                  Application Details
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Review applicant information and documents
                  {isRefreshing ? " — updating…" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto shrink-0"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="lg:col-span-1 space-y-5">
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-burgundy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Applicant Information</h3>
                    <p className="text-xs text-slate-500">Personal and contact details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Full Name
                    </label>
                    <p className="text-sm font-medium text-slate-800 mt-1">{application.fullName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-sm text-slate-700 break-all">{application.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-sm text-slate-700">{application.phone}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Applied Date
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-sm text-slate-700">{formatDate(application.appliedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-burgundy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Position Details</h3>
                    <p className="text-xs text-slate-500">Job information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Application ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-sm font-semibold text-burgundy bg-burgundy/10 px-2 py-0.5 rounded-md">
                        {application.applicationId}
                      </span>
                    </div>
                  </div>
                  {application.jobTitle && (
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Job Title
                      </label>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {application.jobTitle}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Job ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-sm font-mono text-slate-700">{application.jobId}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Application Status
                    </label>
                    <div
                      className={`mt-3 rounded-xl border p-4 transition-colors ${
                        normalizeStatus(application.status) === "reviewed"
                          ? "border-blue-100 bg-gradient-to-br from-blue-50/80 to-white"
                          : "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <StatusBadge
                          status={normalizeStatus(application.status)}
                          size="md"
                        />
                        {canUpdateApplication && (
                          <span className="text-[11px] font-medium text-slate-400">
                            Tap to update
                          </span>
                        )}
                      </div>
                      {canUpdateApplication ? (
                        <ApplicationStatusToggle
                          value={normalizeStatus(application.status)}
                          onChange={(status) => void handleStatusChange(status)}
                          disabled={isUpdatingStatus}
                          size="md"
                          showDescription
                          className="w-full"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="lg:col-span-2 space-y-5">
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-burgundy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Resume / CV</h3>
                    <p className="text-xs text-slate-500">Uploaded document</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-burgundy" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {(application.fullName || "applicant").replace(/\s/g, "_")}_CV.pdf
                      </p>
                      <p className="text-xs text-slate-400">PDF Document</p>
                    </div>
                  </div>
                  {application.cvUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 w-full sm:w-auto shrink-0"
                      onClick={() => window.open(application.cvUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </Button>
                  )}
                </div>
              </div>

              
              {application.coverLetter && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Cover Letter</h3>
                      <p className="text-xs text-slate-500">Applicant's message</p>
                    </div>
                  </div>

                  <div className="bg-amber-50/30 rounded-lg p-5 border border-amber-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button onClick={onBack} variant="outline" className="w-full sm:flex-1">
                  Back to Applications
                </Button>
                <PermissionGate permission={PERMISSIONS.JOB_APPLICATION_DELETE}>
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Application
                  </Button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertBox
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Job Application"
        message={`Are you sure you want to delete the application from "${application.fullName}" (${application.applicationId})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={isDeleting}
      />
    </div>
  );
};

const ViewJobApplications = () => {
  const { id } = useParams<{ id: string }>();
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleBackToList = useCallback(() => {
    setSelected(null);
    setListRefreshKey((key) => key + 1);
  }, []);

  return (
    <AdminLayout title="Job Applications">
      {selected ? (
        <ApplicationDetail
          applicationId={selected._id}
          initialData={selected}
          onBack={handleBackToList}
        />
      ) : (
        <ApplicationList
          key={listRefreshKey}
          jobMongoId={id ?? ""}
          onSelect={setSelected}
        />
      )}
    </AdminLayout>
  );
};

export default ViewJobApplications;
