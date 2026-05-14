import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Calendar, FolderOpen, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { getDepartmentById } from "@/api/department";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  description: string;
  image?: string;
  catagory?: string | { _id?: string; name?: string };
  subspecialities?: (string | { _id?: string; name?: string })[];
  customExplainantions?: { _id?: string; subHeading?: string; explaination?: string[] }[];
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const ViewDepartment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const response = await getDepartmentById(id);
        if (cancelled) return;
        setDepartment(response?.data?.data || null);
      } catch (err: any) {
        if (!cancelled) {
          setDepartment(null);
          setError(err?.response?.data?.message || "Failed to load department details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const catName = typeof department?.catagory === "object" 
    ? department.catagory?.name || "-" 
    : department?.catagory || "-";
  
  const subs = (department?.subspecialities || [])
    .map((s) => (typeof s === "string" ? s : s?.name || ""))
    .filter(Boolean);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="View Department">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/departments")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                
              </div>
              
              {department?._id && (
                <Button
                  onClick={() => navigate(`/departments/edit/${department._id}`)}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Department
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="py-12">
                <Loader />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  onClick={() => navigate("/departments")}
                  variant="outline"
                  className="mt-4"
                >
                  Back to Departments
                </Button>
              </div>
            )}

            {/* Department Details */}
            {!loading && !error && department && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Image & Basic Info */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Image Card */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      {department.image ? (
                        <img 
                          src={department.image} 
                          alt={department.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Info Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department ID</label>
                      <p className="text-sm font-mono text-slate-800 mt-1">{department.departmentId || "-"}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                      <div className="mt-1">
                        {department.isActive === false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Display Order</label>
                      <p className="text-sm text-slate-800 mt-1">{department.order ?? 0}</p>
                    </div>

                    {department.createdAt && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created At</label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">{formatDate(department.createdAt)}</p>
                        </div>
                      </div>
                    )}

                    {department.updatedAt && department.createdAt !== department.updatedAt && (
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</label>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600">{formatDate(department.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Name Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department Name</label>
                    <h1 className="text-2xl font-bold text-slate-800 mt-1">{department.name}</h1>
                  </div>

                  {/* Category Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy/10 text-burgundy text-sm font-medium">
                        <FolderOpen className="h-3.5 w-3.5" />
                        {catName}
                      </span>
                    </div>
                  </div>

                  {/* Description Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                      {department.description || "-"}
                    </p>
                  </div>

                  {/* Subspecialities Card */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subspecialities</label>
                    <div className="mt-3">
                      {subs.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No subspecialities linked to this department.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {subs.map((name) => (
                            <span key={name} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Sections Card */}
                  {department.customExplainantions && department.customExplainantions.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                        Custom Sections
                      </label>
                      <div className="space-y-4">
                        {department.customExplainantions.map((block, index) => (
                          <div key={block._id || index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                            {block.subHeading && (
                              <h3 className="font-semibold text-slate-800 mb-3">{block.subHeading}</h3>
                            )}
                            {block.explaination?.length ? (
                              <ul className="space-y-2">
                                {block.explaination.map((line, li) => (
                                  <li key={li} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-burgundy mt-1">•</span>
                                    <span>{line}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No explanation lines provided.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewDepartment;