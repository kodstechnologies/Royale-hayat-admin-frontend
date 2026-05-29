import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  Tag,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { getJobById as getJobByIdApi } from "@/api/job";

// ── Types ────────────────────────────────────────────────────────────────────

type JobPost = {
  _id: string;
  jobId: string;
  title: string;
  arabicTitle: string;
  classification: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  description: string;
  arabicDescription: string;
  responsibilities: string[];
  arabicResponsibilities: string[];
  requirements: string[];
  arabicRequirements: string[];
  closingDate: string;
  isActive: boolean;
  postedDate: string;
  applicationsCount: number;
};

// ── Mappers ──────────────────────────────────────────────────────────────────

/** Map a raw API response to JobPost */
const mapApiJob = (job: any, applicationsCount = 0): JobPost => ({
  _id: job._id,
  jobId: job.jobId ?? "",
  title: job.title,
  arabicTitle: job.arabicTitle ?? "",
  classification: job.classification ?? "",
  location: job.location,
  type: job.type,
  description: job.description,
  arabicDescription: job.arabicDescription ?? "",
  responsibilities: job.responsibilities ?? [],
  arabicResponsibilities: job.arabicResponsibilities ?? [],
  requirements: job.requirements ?? [],
  arabicRequirements: job.arabicRequirements ?? [],
  closingDate: job.closingDate
    ? new Date(job.closingDate).toISOString().split("T")[0]
    : "",
  isActive: job.isActive ?? true,
  postedDate: job.postedDate
    ? new Date(job.postedDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0],
  applicationsCount: job.applicationsCount ?? applicationsCount,
});

// ── Component ────────────────────────────────────────────────────────────────

const ViewJobPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getJobByIdApi(id);
        const apiJob = res.data?.data;
        if (apiJob) {
          setJob(mapApiJob(apiJob, apiJob.applicationsCount ?? 0));
          return;
        }
      } catch {
        // API failed — show not found state
      }

      setJob(null);
    };

    load().finally(() => setLoading(false));
  }, [id]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="h-3 w-3" />
        {activeLanguage === "english" ? "Active" : "نشط"}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="h-3 w-3" />
        {activeLanguage === "english" ? "Closed" : "مغلق"}
      </span>
    );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const isClosingSoon = (closingDate: string) => {
    const today = new Date();
    const closing = new Date(closingDate);
    const daysDiff = Math.ceil(
      (closing.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );
    return daysDiff <= 7 && daysDiff > 0;
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout title="View Job">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500">Loading job details...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (!job) {
    return (
      <AdminLayout title="View Job">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
            <div className="p-6 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Job not found</p>
              <Button
                onClick={() => navigate("/job-posts")}
                className="mt-4 gap-2"
                variant="outline"
              >
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="View Job">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/job-posts")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeLanguage === "english" ? "Job Details" : "تفاصيل الوظيفة"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeLanguage === "english"
                      ? "View complete job posting information"
                      : "عرض معلومات الوظيفة الكاملة"}
                  </p>
                </div>
              </div>

              {/* Language Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setActiveLanguage("english")}
                  className={`min-w-[96px] px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeLanguage === "english"
                      ? "bg-white text-burgundy shadow-sm border border-burgundy/20"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLanguage("arabic")}
                  className={`min-w-[96px] px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeLanguage === "arabic"
                      ? "bg-white text-burgundy shadow-sm border border-burgundy/20"
                      : "text-slate-700 hover:text-slate-900 hover:bg-white/70"
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-5">
                {/* Job Header Card */}
                <div
                  className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${
                    activeLanguage === "arabic" ? "rtl-text" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {activeLanguage === "english" ? job.title : job.arabicTitle || job.title}
                      </h3>
                      <p className="text-xs text-slate-500">{job.jobId}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeLanguage === "english" ? "Classification:" : "التصنيف:"}
                      </span>
                      <span className="font-medium text-slate-800">{job.classification}</span>
                    </div> */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeLanguage === "english" ? "Location:" : "الموقع:"}
                      </span>
                      <span className="font-medium text-slate-800">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeLanguage === "english" ? "Employment Type:" : "نوع التوظيف:"}
                      </span>
                      <span className="font-medium text-slate-800">{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeLanguage === "english" ? "Posted Date:" : "تاريخ النشر:"}
                      </span>
                      <span className="font-medium text-slate-800">
                        {formatDate(job.postedDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeLanguage === "english" ? "Closing Date:" : "تاريخ الإغلاق:"}
                      </span>
                      <span
                        className={`font-medium ${
                          isClosingSoon(job.closingDate) ? "text-red-600" : "text-slate-800"
                        }`}
                      >
                        {formatDate(job.closingDate)}
                        {isClosingSoon(job.closingDate) && (
                          <span className="ml-1 text-xs text-red-500">
                            ({activeLanguage === "english" ? "Closing soon!" : "ينتهي قريباً!"})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div
                  className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${
                    activeLanguage === "arabic" ? "rtl-text" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {activeLanguage === "english" ? "Job Status" : "حالة الوظيفة"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeLanguage === "english"
                          ? "Current posting status"
                          : "حالة النشر الحالية"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeLanguage === "english" ? "Post Status" : "حالة النشر"}
                      </span>
                      {getStatusBadge(job.isActive)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeLanguage === "english"
                          ? "Applications Received"
                          : "الطلبات المستلمة"}
                      </span>
                      <span className="font-semibold text-burgundy">
                        {job.applicationsCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    {activeLanguage === "english" ? "Quick Actions" : "إجراءات سريعة"}
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate(`/jobs/edit/${job._id}`)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      {activeLanguage === "english" ? "Edit Job Posting" : "تعديل الوظيفة"}
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/jobs/view-applications/${job._id}`)}
                      className="w-full gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Users className="h-4 w-4" />
                      {activeLanguage === "english"
                        ? `View Applications (${job.applicationsCount})`
                        : `عرض الطلبات (${job.applicationsCount})`}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div
                className={`lg:col-span-2 space-y-5 ${
                  activeLanguage === "arabic" ? "rtl-text" : ""
                }`}
              >
                {/* Description */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-burgundy" />
                    {activeLanguage === "english" ? "Job Description" : "وصف الوظيفة"}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeLanguage === "english"
                      ? job.description
                      : job.arabicDescription || job.description}
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-burgundy" />
                    {activeLanguage === "english"
                      ? "Key Responsibilities"
                      : "المسؤوليات الرئيسية"}
                  </h3>
                  <ul className="space-y-2">
                    {(activeLanguage === "english"
                      ? job.responsibilities
                      : job.arabicResponsibilities.length
                      ? job.arabicResponsibilities
                      : job.responsibilities
                    ).map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-burgundy mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-burgundy" />
                    {activeLanguage === "english"
                      ? "Requirements & Qualifications"
                      : "المتطلبات والمؤهلات"}
                  </h3>
                  <ul className="space-y-2">
                    {(activeLanguage === "english"
                      ? job.requirements
                      : job.arabicRequirements.length
                      ? job.arabicRequirements
                      : job.requirements
                    ).map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-burgundy mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => navigate("/job-posts")}
                    variant="outline"
                    className="flex-1"
                  >
                    {activeLanguage === "english" ? "Back to Jobs" : "العودة إلى الوظائف"}
                  </Button>
                  <Button
                    onClick={() => navigate(`/jobs/edit/${job._id}`)}
                    className="flex-1 gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Pencil className="h-4 w-4" />
                    {activeLanguage === "english" ? "Edit Job" : "تعديل الوظيفة"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rtl-text { direction: rtl; text-align: right; }
      `}</style>
    </AdminLayout>
  );
};

export default ViewJobPost;
