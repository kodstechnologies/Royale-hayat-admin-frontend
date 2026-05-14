import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  deleteDepartment as deleteDepartmentApi,
  getDepartments,
} from "@/api/department";
import { Eye, Pencil, Trash2, Image as ImageIcon, Plus } from "lucide-react";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  description: string;
  catagory?: string | { _id: string; name?: string };
  subspecialities?: (string | { _id: string; name?: string; description?: string })[];
  subspeciality?: string | { _id: string; name?: string; description?: string };
  image?: string;
  subSpecialties?: string[];
  customExplainantions?: { _id?: string; subHeading?: string; explaination?: string[] }[];
  isActive?: boolean;
  order?: number;
};

const Departments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showSuccessToast = (text: string) => {
    toast.success(text, {
      position: "top-right",
      style: {
        background: "#16a34a",
        color: "#ffffff",
        border: "1px solid #15803d",
      },
    });
  };

  const showErrorToast = (text: string) => {
    toast.error(text, { position: "top-right" });
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments({
        page: currentPage,
        limit,
        sortBy: "order",
        sortOrder: "asc",
        ...(activeFilter === "all" ? {} : { isActive: activeFilter === "active" }),
      });
      setDepartments(response?.data?.data || []);
      setTotalPages(response?.data?.meta?.pages || 1);
      setTotalRecords(response?.data?.meta?.total || 0);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch departments.";
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, limit, activeFilter]);

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDepartmentApi(departmentToDelete._id);
      showSuccessToast("Department deleted successfully.");

      if (departments.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchDepartments();
      }

      setShowDeleteAlert(false);
      setDepartmentToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to delete department.";
      showErrorToast(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <AdminLayout title="Departments">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Departments Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage hospital departments and their details</p>
              </div>
              
              <Button
                onClick={() => navigate("/departments/create")}
                className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <select
                value={activeFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setActiveFilter(e.target.value as "all" | "active" | "inactive");
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              >
                <option value="all">All Departments</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-12">
                <Loader />
              </div>
            ) : (
              <>
                {/* Empty State */}
                {departments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No departments found</p>
                    <p className="text-sm text-slate-400 mt-1">Get started by creating your first department</p>
                    <Button
                      onClick={() => navigate("/departments/create")}
                      className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Plus className="h-4 w-4" />
                      Create Department
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Departments Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {departments.map((dept) => (
                        <div
                          key={dept._id}
                          className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div
                            className="relative h-40 cursor-pointer overflow-hidden"
                            onClick={() => navigate(`/departments/view/${dept._id}`)}
                          >
                            {dept.image ? (
                              <img
                                src={dept.image}
                                alt={dept.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-burgundy/60 to-burgundy/30 flex items-center justify-center">
                                <ImageIcon size={48} className="text-white/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs text-white/80 font-mono">{dept.departmentId}</p>
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {dept.name}
                              </h3>
                            </div>
                            {dept.isActive === false && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gray-900/80 text-white text-[10px] font-medium">
                                Inactive
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {dept.description}
                            </p>
                            {dept.subSpecialties && dept.subSpecialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {dept.subSpecialties.slice(0, 2).map((specialty) => (
                                  <span key={specialty} className="px-2 py-0.5 rounded-full text-[10px] bg-burgundy/10 text-burgundy">
                                    {specialty.length > 15 ? specialty.slice(0, 12) + '...' : specialty}
                                  </span>
                                ))}
                                {dept.subSpecialties.length > 2 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">
                                    +{dept.subSpecialties.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/departments/view/${dept._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate(`/departments/edit/${dept._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(dept)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{((currentPage - 1) * limit) + 1}</span> to{' '}
                            <span className="font-medium text-slate-700">{Math.min(currentPage * limit, totalRecords)}</span> of{' '}
                            <span className="font-medium text-slate-700">{totalRecords}</span> entries
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1 || loading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                              Previous
                            </button>
                            <div className="flex items-center gap-1">
                              {getPageNumbers().map((page, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                                  disabled={page === "..." || loading}
                                  className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                                    currentPage === page
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
                              disabled={currentPage === totalPages || loading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Alert */}
      <AlertBox
        isOpen={showDeleteAlert}
        onClose={() => {
          setShowDeleteAlert(false);
          setDepartmentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${departmentToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default Departments;