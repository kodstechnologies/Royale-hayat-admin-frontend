import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Download, ChevronLeft, Plus, X, CheckCircle, Clock, Briefcase, MapPin, Calendar } from "lucide-react";
import api from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const JobApplications = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/v1/job-applications");
        setApplications(response?.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load job applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const selected = applications.find((a) => a._id === selectedId);

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      new: "bg-amber-100 text-amber-700",
      shortlisted: "bg-blue-100 text-blue-700",
      interview: "bg-burgundy/10 text-burgundy",
      hired: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700"
    };
    const icons: Record<string, any> = {
      new: Clock,
      shortlisted: CheckCircle,
      interview: Briefcase,
      hired: CheckCircle,
      rejected: X
    };
    const Icon = icons[s] || Clock;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${colors[s] || "bg-slate-100 text-slate-600"}`}>
        <Icon className="h-3 w-3" />
        {t(s.charAt(0).toUpperCase() + s.slice(1))}
      </span>
    );
  };

  // Individual candidate page
  if (selected) {
    return (
      <AdminLayout title="Job Applications">
        <div className="space-y-6">
          <BreadCrumb />
          
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            
            <div className="p-6">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-burgundy transition-colors mb-6 group"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Applications
              </button>

              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/10 flex items-center justify-center border-2 border-burgundy/20">
                    <span className="text-burgundy font-bold text-2xl">
                      {selected.fullName?.charAt(0) || selected.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selected.fullName || selected.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selected.jobId?.title || "N/A"} · {selected.jobId?.department || "N/A"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {statusBadge(selected.status)}
                      <span className="text-xs text-slate-400">
                        Applied: {selected.appliedDate ? format(new Date(selected.appliedDate), "MMM dd, yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button className="gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Download size={14} />
                  Download CV
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Personal Details */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-burgundy rounded-full"></div>
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.fullName || selected.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                      <div className="mt-1">{statusBadge(selected.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-burgundy rounded-full"></div>
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Position</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.jobId?.title || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Department</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.jobId?.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Location
                      </p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.jobId?.location || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> Type
                      </p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selected.jobId?.type || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-burgundy rounded-full"></div>
                  Cover Letter
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selected.tellusUrself || selected.coverLetter || "No cover letter provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selected.status === "new" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Shortlist
                  </Button>
                )}
                {selected.status === "shortlisted" && (
                  <Button className="bg-burgundy hover:bg-burgundy/90">
                    Schedule Interview
                  </Button>
                )}
                {selected.status !== "hired" && selected.status !== "rejected" && (
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Job Applications">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Job Applications</h3>
                <p className="text-sm text-slate-500 mt-1">Manage job applications and create new job postings</p>
              </div>
              
              <Button
                onClick={() => navigate("/jobs/create")}
                className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create Job
              </Button>
            </div>

            {/* Table Section */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No job applications yet</p>
                <p className="text-sm text-slate-400 mt-1">Applications will appear here when candidates apply</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Applicant</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Experience</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a, index) => (
                      <tr
                        key={a._id}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                        onClick={() => setSelectedId(a._id)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-medium text-burgundy">
                            {a._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{a.fullName || a.name}</div>
                          <div className="text-xs text-slate-400">{a.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{a.jobId?.title || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-700">{a.jobId?.department || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-700">{a.phone || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {a.appliedDate ? format(new Date(a.appliedDate), "MMM dd, yyyy") : "N/A"}
                        </td>
                        <td className="py-3 px-4">{statusBadge(a.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedId(a._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10 transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          </div>
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
    </AdminLayout>
  );
};

export default JobApplications;