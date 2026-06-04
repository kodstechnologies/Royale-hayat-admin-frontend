import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { Eye, Image as ImageIcon, Pencil, Plus, Search } from "lucide-react";
import Loader from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDepartments,
  mapApiDepartmentToListItem,
  normalizeDepartmentCategory,
  type DepartmentListItem,
} from "@/api/department";
import { fetchAllCatagories, type Catagory } from "@/api/catagory";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate from "@/utils/PermissionGate";

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Catagory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const list = await fetchAllCatagories();
        setCategories(list);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await getDepartments(params);
      const body = response.data;
      const list = Array.isArray(body?.data) ? body.data : [];

      setDepartments(list.map(mapApiDepartmentToListItem));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error loading departments:", error);
      toast.error(err?.response?.data?.message || "Failed to load departments");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter((dept) => {
    const matchesCategory =
      selectedCategory === "all" ||
      normalizeDepartmentCategory(dept.category).toLowerCase() ===
        normalizeDepartmentCategory(selectedCategory).toLowerCase();
    return matchesCategory;
  });

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );
  const totalFilteredPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / limit),
  );

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredDepartments.length, totalFilteredPages, currentPage]);

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const getCategoryBadgeLabel = (category: string) => {
    const normalized = normalizeDepartmentCategory(category);
    switch (normalized) {
      case "CLINICAL SPECIALITY":
        return "Clinical";
      case "CLINICAL SUPPORT SERVICE":
        return "Support";
      case "HOME CARE SERVICE":
        return "Home Care";
      default:
        return normalized.length > 14 ? `${normalized.slice(0, 14)}…` : normalized;
    }
  };
  const getCategoryColor = (category: string) => {
    switch (normalizeDepartmentCategory(category)) {
      case "CLINICAL SPECIALITY":
        return "bg-blue-100 text-blue-700";
      case "CLINICAL SUPPORT SERVICE":
        return "bg-green-100 text-green-700";
      case "HOME CARE SERVICE":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout title="Departments">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  Departments Management
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Manage hospital departments and their details
                </p>
              </div>
              {/* <PermissionGate permission={PERMISSIONS.DEPARTMENT}>
                <Button
                  type="button"
                  onClick={() => navigate("/departments/create")}
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Department
                </Button>
              </PermissionGate> */}
            </div>

            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div className="flex flex-col min-[400px]:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search departments..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 h-10 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={applySearch}
                    size="sm"
                    className="flex-1 min-[400px]:flex-none"
                  >
                    Search
                  </Button>
                  {search && (
                    <Button
                      variant="ghost"
                      onClick={clearSearch}
                      size="sm"
                      className="flex-1 min-[400px]:flex-none"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loadingCategories}
                dir="ltr"
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="all">All Categories</option>
                {loadingCategories ? (
                  <option value="" disabled>
                    Loading categories...
                  </option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {loading ? (
              <div className="py-12">
                <Loader />
              </div>
            ) : (
              <>
                {paginatedDepartments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No departments found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                    <PermissionGate permission={PERMISSIONS.DEPARTMENT}>
                      <Button
                        type="button"
                        onClick={() => navigate("/departments/create")}
                        className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                      >
                        <Plus className="h-4 w-4" />
                        Create Department
                      </Button>
                    </PermissionGate>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {paginatedDepartments.map((dept) => (
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
                              <p className="text-xs text-white/80 font-mono">
                                {dept.departmentId}
                              </p>
                              <h3 className="font-semibold text-white text-lg leading-tight">
                                {dept.name}
                              </h3>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(dept.category)}`}
                              >
                                {getCategoryBadgeLabel(dept.category)}
                              </span>
                            </div>
                            {dept.isActive === false && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gray-900/80 text-white text-[10px] font-medium">
                                Inactive
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {dept.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/departments/view/${dept._id}`)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              {/* <PermissionGate permission={PERMISSIONS.DEPARTMENT_UPDATE}>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/departments/edit/${dept._id}`)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-burgundy/30 text-burgundy text-xs font-medium hover:bg-burgundy/5 transition-colors"
                                >
                                  <Pencil size={12} />
                                  Edit
                                </button>
                              </PermissionGate> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                                    currentPage === pageNum
                                      ? "bg-burgundy text-white border-burgundy shadow-sm"
                                      : "border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage === totalPages || loading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                          >
                            Next
                          </button>
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
    </AdminLayout>
  );
};

export default Departments;
