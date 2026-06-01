import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Plus, X, CheckCircle, Briefcase, Pencil, Trash2, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import AlertBox from "@/components/AlertBox";
import { getAllJobs, deleteJob as deleteJobApi } from "@/api/job";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasAnyPermission, hasPermission } from "@/utils/PermissionGate";

type JobPost = {
  _id: string;
  jobId: string;
  title: string;
  classification: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  description: string;
  responsibilities: string[];
  requirements: string[];
  closingDate: string;
  isActive: boolean;
  postedDate: string;
  applicationsCount: number;
  unviewedApplicationsCount: number;
};

const formatBadgeCount = (count: number) => (count > 99 ? "99+" : String(count));

const mapApiJob = (job: any): JobPost => ({
  _id: job._id ?? job.id,
  jobId: job.jobId ?? "",
  title: job.title,
  classification: job.classification ?? "",
  location: job.location,
  type: job.type,
  description: job.description,
  responsibilities: job.responsibilities ?? [],
  requirements: job.requirements ?? [],
  closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split("T")[0] : "",
  isActive: job.isActive ?? true,
  postedDate: job.postedDate ? new Date(job.postedDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  applicationsCount: job.applicationsCount ?? 0,
  unviewedApplicationsCount: job.unviewedApplicationsCount ?? 0,
});

const JobPosts = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalUnviewedApplications, setTotalUnviewedApplications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const canCreateJob = hasPermission(PERMISSIONS.JOB_CREATE);
  const canUpdateJob = hasPermission(PERMISSIONS.JOB_UPDATE);
  const canDeleteJob = hasPermission(PERMISSIONS.JOB_DELETE);
  const canViewApplications = hasAnyPermission([
    PERMISSIONS.JOB_APPLICATION_VIEW,
    PERMISSIONS.JOB_VIEW,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const effectiveSearch =
        debouncedSearch.length >= 2 ? debouncedSearch : "";
      const res = await getAllJobs({
        page: currentPage,
        limit,
        sortBy: "postedDate",
        sortOrder: "desc",
        ...(effectiveSearch ? { search: effectiveSearch } : {}),
      });
      const apiJobs: JobPost[] = (res.data?.data ?? []).map(mapApiJob);
      setJobs(apiJobs);
      setTotalPages(res.data?.meta?.pages ?? 1);
      setTotalRecords(res.data?.meta?.total ?? 0);
      setTotalUnviewedApplications(res.data?.meta?.totalUnviewedApplications ?? 0);
    } catch {
      setJobs([]);
      setTotalPages(1);
      setTotalRecords(0);
      setTotalUnviewedApplications(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs, location.pathname]);

  // Listen for job created/updated and application viewed events
  useEffect(() => {
    const handleJobsUpdate = () => {
      void fetchJobs();
    };
    window.addEventListener("jobsUpdated", handleJobsUpdate);
    window.addEventListener("jobApplicationsUpdated", handleJobsUpdate);
    return () => {
      window.removeEventListener("jobsUpdated", handleJobsUpdate);
      window.removeEventListener("jobApplicationsUpdated", handleJobsUpdate);
    };
  }, [fetchJobs]);

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleDeleteClick = (job: JobPost) => {
    if (!hasPermission(PERMISSIONS.JOB_DELETE)) return;
    setJobToDelete(job);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete || !hasPermission(PERMISSIONS.JOB_DELETE)) return;
    setIsDeleting(true);
    try {
      await deleteJobApi(jobToDelete._id);
      await fetchJobs();
    } catch (err: any) {
      // Keep the dialog open on error — user can retry or cancel
      console.error("Delete failed:", err);
    } finally {
      setDeleteOpen(false);
      setJobToDelete(null);
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Active</span>
      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"><X className="h-3 w-3" />Closed</span>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const isClosingSoon = (closingDate: string) => {
    const today = new Date();
    const closing = new Date(closingDate);
    const daysDiff = Math.ceil((closing.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  const getPageNumbers = () => {
    const pageNumbers: Array<number | string> = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pageNumbers;
  };

  return (
    <AdminLayout title="Jobs">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            {/* Header with Create Button and Search */}
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Job Posts</h3>
                <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Manage job postings and track applications</span>
                  {totalUnviewedApplications > 0 && (
                    <span className="min-w-[1.375rem] h-5 px-1.5 rounded-full bg-burgundy text-white text-[11px] font-semibold leading-none inline-flex items-center justify-center">
                      {formatBadgeCount(totalUnviewedApplications)} unviewed
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col min-[480px]:flex-row gap-2 sm:gap-3 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by Job ID or title..."
                    value={search}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setSearch(e.target.value);
                    }}
                    className="pl-9 w-full"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  {search && (
                    <Button
                      variant="ghost"
                      onClick={clearSearch}
                      size="sm"
                      className="flex-1 min-[480px]:flex-none"
                    >
                      <X className="h-4 w-4" />
                      <span className="min-[480px]:sr-only">Clear</span>
                    </Button>
                  )}
                  <PermissionGate permission={PERMISSIONS.JOB_CREATE}>
                    <Button
                      onClick={() => navigate("/jobs/create")}
                      className="gap-2 flex-1 min-[480px]:flex-none bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">Create Job</span>
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>

            {/* Table Section */}
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No job posts found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {debouncedSearch.length >= 2
                    ? "No jobs match your Job ID or title search."
                    : "Create a new job posting to get started."}
                </p>
                {canCreateJob && (
                  <Button
                    onClick={() => navigate("/jobs/create")}
                    className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create Job
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {jobs.map((job) => (
                    <article
                      key={job._id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold text-burgundy break-all">
                          {job.jobId}
                        </span>
                        {getStatusBadge(job.isActive)}
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm leading-snug mb-1">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {job.description?.substring(0, 80)}...
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
                        <div>
                          <span className="text-slate-400 block">Posted</span>
                          {formatDate(job.postedDate)}
                        </div>
                        <div>
                          <span className="text-slate-400 block">Closes</span>
                          <span
                            className={
                              isClosingSoon(job.closingDate)
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            {formatDate(job.closingDate)}
                          </span>
                        </div>
                      </div>
                      {canViewApplications && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/jobs/view-applications/${job._id}`)
                          }
                          className="w-full mb-3 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-burgundy/10 text-burgundy text-xs font-medium hover:bg-burgundy/20 transition-colors"
                        >
                          <FileText size={12} />
                          {job.applicationsCount} Application
                          {job.applicationsCount !== 1 ? "s" : ""}
                          {job.unviewedApplicationsCount > 0 && (
                            <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-burgundy text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
                              {formatBadgeCount(job.unviewedApplicationsCount)}
                            </span>
                          )}
                        </button>
                      )}
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/view/${job._id}`)}
                          className={`${canUpdateJob || canDeleteJob ? "flex-1" : "w-full"} inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-burgundy bg-burgundy/10 hover:bg-burgundy/15`}
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <PermissionGate permission={PERMISSIONS.JOB_UPDATE}>
                          <button
                            type="button"
                            onClick={() => navigate(`/jobs/edit/${job._id}`)}
                            className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-slate-100"
                            aria-label="Edit job"
                          >
                            <Pencil size={16} />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission={PERMISSIONS.JOB_DELETE}>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(job)}
                            className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100"
                            aria-label="Delete job"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGate>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Job ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Posted Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Closing Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Applications</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, index) => (
                        <tr
                          key={job._id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-semibold text-burgundy">{job.jobId}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 break-words whitespace-normal leading-5 max-w-[220px]">
                              {job.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{job.description?.substring(0, 50)}...</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">{formatDate(job.postedDate)}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm ${isClosingSoon(job.closingDate) ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                              {formatDate(job.closingDate)}
                              {isClosingSoon(job.closingDate) && <span className="ml-1 text-[10px]">(Soon)</span>}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {canViewApplications ? (
                              <button
                                type="button"
                                onClick={() => navigate(`/jobs/view-applications/${job._id}`)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-burgundy/10 text-burgundy text-xs font-medium hover:bg-burgundy/20 transition-colors"
                              >
                                <FileText size={12} />
                                <span>
                                  {job.applicationsCount} Application{job.applicationsCount !== 1 ? "s" : ""}
                                </span>
                                {job.unviewedApplicationsCount > 0 && (
                                  <span
                                    className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-burgundy text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center"
                                    title={`${job.unviewedApplicationsCount} unviewed application${job.unviewedApplicationsCount !== 1 ? "s" : ""}`}
                                  >
                                    {formatBadgeCount(job.unviewedApplicationsCount)}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span className="text-sm text-slate-400">
                                {job.applicationsCount} Application{job.applicationsCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(job.isActive)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => navigate(`/jobs/view/${job._id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <PermissionGate permission={PERMISSIONS.JOB_UPDATE}>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/jobs/edit/${job._id}`)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                                  title="Edit Job"
                                >
                                  <Pencil size={14} />
                                </button>
                              </PermissionGate>
                              <PermissionGate permission={PERMISSIONS.JOB_DELETE}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(job)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Job"
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

                {/* Pagination - Bottom Right */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-center sm:justify-end overflow-x-auto">
                      <div className="flex flex-wrap justify-center sm:justify-end gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => typeof page === "number" && setCurrentPage(page)}
                              disabled={page === "..."}
                              className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${currentPage === page
                                ? "bg-burgundy text-white border-burgundy shadow-sm"
                                : page === "..."
                                  ? "border-transparent cursor-default"
                                  : "border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Showing entries info */}
                <div className="mt-4 text-center sm:text-right text-xs text-slate-400">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Alert */}
      <AlertBox
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Job Post"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default JobPosts;