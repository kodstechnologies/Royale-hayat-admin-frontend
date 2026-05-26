import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Plus, X, CheckCircle, Briefcase, Pencil, Trash2, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import AlertBox from "@/components/AlertBox";
import { adminJobs, AdminJob } from "@/data/adminJobs";
import { dummyApplications } from "@/data/dummyApplications";
import { getAllJobs, deleteJob as deleteJobApi } from "@/api/job";

const getApplicationsCount = (jobId: string) =>
  dummyApplications.filter((a) => a.jobId === jobId).length;

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
  source: "api" | "dummy"; // track origin so we know which delete path to use
};

// ── Dummy data as fallback ──────────────────────────────────────────────────
const dummyJobPosts: JobPost[] = adminJobs.map((job: AdminJob) => ({
  _id: job.id,
  jobId: job.jobId,
  title: job.title,
  classification: job.category,
  location: job.location,
  type: job.type,
  description: job.description,
  responsibilities: job.responsibilities,
  requirements: job.requirements,
  closingDate: job.closingDate,
  isActive: job.isActive,
  postedDate: job.createdAt.split("T")[0],
  applicationsCount: getApplicationsCount(job.jobId),
  source: "dummy",
}));

// ── Map a raw API job object to JobPost ────────────────────────────────────
const mapApiJob = (job: any): JobPost => ({
  _id: job._id,
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
  source: "api",
});

const JobPosts = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // ── Fetch from API and merge with dummy data ──────────────────────────────
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getAllJobs({ limit: 100, sortBy: "postedDate", sortOrder: "desc" });
      const apiJobs: JobPost[] = (res.data?.data ?? []).map(mapApiJob);

      // Merge: API jobs first, then dummy jobs whose jobId isn't already in API results
      const apiJobIds = new Set(apiJobs.map((j) => j.jobId));
      const fallbackDummy = dummyJobPosts.filter((j) => !apiJobIds.has(j.jobId));
      setJobs([...apiJobs, ...fallbackDummy]);
    } catch {
      // API unavailable — fall back entirely to dummy data
      setJobs(dummyJobPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Listen for job created/updated events (from create/edit pages)
  useEffect(() => {
    const handleJobsUpdate = () => fetchJobs();
    window.addEventListener("jobsUpdated", handleJobsUpdate);
    return () => window.removeEventListener("jobsUpdated", handleJobsUpdate);
  }, []);

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.jobId.toLowerCase().includes(search.toLowerCase()) ||
    job.classification.toLowerCase().includes(search.toLowerCase())
  );

  // Update pagination when filtered jobs change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredJobs.length / limit));
    setTotalRecords(filteredJobs.length);
    if (currentPage > Math.ceil(filteredJobs.length / limit) && Math.ceil(filteredJobs.length / limit) > 0) {
      setCurrentPage(1);
    }
  }, [filteredJobs.length, limit, currentPage]);

  // Get current page items
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * limit, currentPage * limit);

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleDeleteClick = (job: JobPost) => {
    setJobToDelete(job);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      if (jobToDelete.source === "api") {
        await deleteJobApi(jobToDelete._id);
        // Refresh from API after deletion
        await fetchJobs();
      } else {
        // Dummy job — just remove from local state
        setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      }
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
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            {/* Header with Create Button and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Job Posts</h3>
                <p className="text-sm text-slate-500 mt-1">Manage job postings and track applications</p>
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 w-64"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={applySearch}
                  size="sm"
                >
                  Search
                </Button>
                {search && (
                  <Button
                    variant="ghost"
                    onClick={clearSearch}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
                <Button
                  onClick={() => navigate("/jobs/create")}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
              </div>
            </div>

            {/* Table Section */}
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No job posts found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or create a new job posting</p>
                <Button
                  onClick={() => navigate("/jobs/create")}
                  className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                >
                  <Plus className="h-4 w-4" />
                  Create Job
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                      {paginatedJobs.map((job, index) => (
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
                            <button
                              onClick={() => navigate(`/jobs/view-applications/${job._id}`)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-burgundy/10 text-burgundy text-xs font-medium hover:bg-burgundy/20 transition-colors"
                            >
                              <FileText size={12} />
                              {job.applicationsCount} Application{job.applicationsCount !== 1 ? "s" : ""}
                            </button>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(job.isActive)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => navigate(`/jobs/view/${job._id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => navigate(`/jobs/edit/${job._id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                                title="Edit Job"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(job)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Job"
                              >
                                <Trash2 size={14} />
                              </button>
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
                    <div className="flex justify-end">
                      <div className="flex gap-2">
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
                <div className="mt-4 text-right text-xs text-slate-400">
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