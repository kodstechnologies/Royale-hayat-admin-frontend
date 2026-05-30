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
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Printer,
  ChevronRight,
  Users,
} from "lucide-react";
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
} from "@/api/job";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending Review" },
  reviewed: { icon: Eye, color: "bg-blue-100 text-blue-700", label: "Reviewed" },
  shortlisted: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Shortlisted" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  hired: { icon: CheckCircle, color: "bg-purple-100 text-purple-700", label: "Hired" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
};

// ── Map API application → local JobApplication shape ─────────────────────────

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
    status: app.status ?? "pending",
    isViewed: app.isViewed ?? false,
    experience: app.experience,
    currentCompany: app.currentCompany,
    noticePeriod: app.noticePeriod,
  };
};

// ── Application List ──────────────────────────────────────────────────────────

type ApplicationListProps = {
  jobMongoId: string;   // MongoDB _id of the job (from URL param)
  onSelect: (app: JobApplication) => void;
};

const ApplicationList = ({ jobMongoId, onSelect }: ApplicationListProps) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // ── Resolve job title ──────────────────────────────────────────────────
      let resolvedJobId = jobMongoId; // may be overwritten with jobId string
      try {
        const jobRes = await getJobByIdApi(jobMongoId);
        const apiJob = jobRes.data?.data;
        if (apiJob) {
          setJobTitle(apiJob.title);
          resolvedJobId = apiJob.jobId ?? jobMongoId;
        }
      } catch {
        // Fallback: check static dummy data
        const staticJob = adminJobs.find((j) => j.id === jobMongoId);
        if (staticJob) {
          setJobTitle(staticJob.title);
          resolvedJobId = staticJob.jobId;
        }
      }

      // ── Fetch applications ─────────────────────────────────────────────────
      try {
        const appRes = await getApplicationsByJobIdApi(jobMongoId);
        const apiApps: JobApplication[] = (appRes.data?.data ?? []).map(mapApiApplication);

        if (apiApps.length > 0) {
          setApplications(apiApps);
        } else {
          // API returned empty — show dummy fallback for the resolved jobId
          setApplications(getDummyApplicationsByJobId(resolvedJobId));
        }
      } catch {
        // API failed — fall back to dummy data
        setApplications(getDummyApplicationsByJobId(resolvedJobId));
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
  }, [jobMongoId]);

  const handleSelect = (app: JobApplication) => {
    onSelect({
      ...app,
      isViewed: true,
    });
  };

  const unviewedCount = applications.filter((app) => !app.isViewed).length;

  return (
    <div className="space-y-6">
      <BreadCrumb />

      <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/jobs/view/${jobMongoId}`)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800">Job Applications</h2>
              {jobTitle && (
                <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>{jobTitle}</span>
                  <span className="text-slate-400">&mdash;</span>
                  <span className="font-medium text-burgundy">
                    {applications.length} application{applications.length !== 1 ? "s" : ""}
                  </span>
                  {/* {unviewedCount > 0 && (
                    <span className="min-w-[1.375rem] h-5 px-1.5 rounded-full bg-burgundy text-white text-[11px] font-semibold leading-none inline-flex items-center justify-center">
                      {formatBadgeCount(unviewedCount)} new
                    </span>
                  )} */}
                </p>
              )}
            </div>
          </div>

          {/* Loading */}
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
              <p className="text-slate-500 font-medium">No applications yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Applications submitted for this job will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    {/* <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th> */}
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
                      {/* <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td> */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(app);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-burgundy hover:underline"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Application Detail ────────────────────────────────────────────────────────

type ApplicationDetailProps = {
  applicationId: string;   // _id of the selected application
  initialData: JobApplication; // pre-loaded from list (used as fallback)
  onBack: () => void;
};

const ApplicationDetail = ({ applicationId, initialData, onBack }: ApplicationDetailProps) => {
  const [application, setApplication] = useState<JobApplication>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasMarkedViewedRef = useRef(false);

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

  return (
    <div className="space-y-6">
      <BreadCrumb />

      <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Application Details</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Review applicant information and documents
                  {isRefreshing ? " — updating…" : ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-5">
              {/* Profile Card */}
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
                      <p className="text-sm text-slate-700">{application.email}</p>
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

              {/* Position & Status Card */}
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
                  {/* <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="mt-1">
                      <StatusBadge status={application.status} />
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Resume / CV */}
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

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-burgundy" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {(application.fullName || "applicant").replace(/\s/g, "_")}_CV.pdf
                      </p>
                      <p className="text-xs text-slate-400">PDF Document</p>
                    </div>
                  </div>
                  {application.cvUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(application.cvUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </Button>
                  )}
                </div>
              </div>

              {/* Cover Letter / Tell Us About Yourself */}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={onBack} variant="outline" className="flex-1">
                  Back to Applications
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

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
