import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Calendar,
  X,
  Loader2,
  Eye,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getDepartments,
  mapApiDepartmentToListItem,
  type Department,
} from "@/api/department";
import {
  getSubspecialities,
  mapApiSubspecialityToListItem,
  type Subspeciality,
  type SubspecialityListItem,
} from "@/api/subspeciality";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate from "@/utils/PermissionGate";

const matchesMultiWordSearch = (fields: string[], query: string): boolean => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
};

const Subspecialities = () => {
  const [items, setItems] = useState<SubspecialityListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await getDepartments({
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        });
        const list = Array.isArray(response.data?.data)
          ? (response.data.data as Department[])
          : [];
        setDepartments(
          list.map((row) => {
            const item = mapApiDepartmentToListItem(row);
            return { id: item._id, name: item.name };
          }),
        );
      } catch (error) {
        console.error("Error loading departments:", error);
        toast.error("Failed to load departments");
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    void loadDepartments();
  }, []);

  const fetchSubspecialities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (selectedDepartment !== "all") {
        params.department = selectedDepartment;
      }

      const response = await getSubspecialities(params);
      const body = response.data;
      const list = Array.isArray(body?.data) ? (body.data as Subspeciality[]) : [];

      setItems(list.map(mapApiSubspecialityToListItem));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error loading subspecialities:", error);
      toast.error(err?.response?.data?.message || "Failed to load subspecialities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchSubspecialities();
  }, [fetchSubspecialities]);

  const filteredItems = items.filter((row) =>
    matchesMultiWordSearch(
      [row.name, row.arabicName, row.departmentName ?? ""],
      search,
    ),
  );

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );
  const totalFilteredPages = Math.max(1, Math.ceil(filteredItems.length / limit));

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredItems.length, totalFilteredPages, currentPage]);

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout title="Subspecialities">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  Subspecialities Management
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Manage medical subspecialities and organize your services
                </p>
              </div>
              <PermissionGate permission={PERMISSIONS.SUBSPECIALITY}>
                <Button
                  asChild
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link to="/subspecialities/create">
                    <Plus className="h-4 w-4" />
                    Add Subspeciality
                  </Link>
                </Button>
              </PermissionGate>
            </div>

            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div className="flex flex-col min-[400px]:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search subspecialities by name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-10 w-full"
                  />
                </div>
                {search && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={clearSearch}
                      className="text-slate-500 hover:text-slate-700 flex-1 min-[400px]:flex-none"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loadingDepartments}
                dir="ltr"
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="all">All Departments</option>
                {loadingDepartments ? (
                  <option value="" disabled>
                    Loading departments...
                  </option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select> */}
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
              </div>
            ) : (
              <>
                {paginatedItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No subspecialities found</p>
                    <p className="text-sm text-slate-400">
                      Try adjusting your search or filters
                    </p>
                    <PermissionGate permission={PERMISSIONS.SUBSPECIALITY}>
                      <Button
                        asChild
                        className="mt-4 gap-2 border-burgundy text-burgundy hover:bg-burgundy/5"
                        variant="outline"
                      >
                        <Link to="/subspecialities/create">
                          <Plus className="h-4 w-4" />
                          Add your first subspeciality
                        </Link>
                      </Button>
                    </PermissionGate>
                  </div>
                ) : (
                  <>
                    <div className="md:hidden space-y-3">
                      {paginatedItems.map((row) => (
                        <article
                          key={row.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-burgundy/10 flex items-center justify-center shrink-0">
                              <span className="text-burgundy text-sm font-medium">
                                {row.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 text-sm leading-snug">
                                {row.name}
                              </p>
                              <p className="text-sm text-slate-600 mt-0.5" dir="rtl">
                                {row.arabicName}
                              </p>
                            </div>
                          </div>
                          {row.departmentName && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                              {row.departmentName}
                            </span>
                          )}
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {formatDate(row.updatedAt)}
                          </p>
                          <div className="flex items-center gap-2 justify-end pt-3 mt-3 border-t border-slate-100">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-slate-600 hover:bg-slate-50"
                            >
                              <Link to={`/subspecialities/view/${row.id}`}>
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Link>
                            </Button>
                            <PermissionGate permission={PERMISSIONS.SUBSPECIALITY_UPDATE}>
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-burgundy hover:bg-burgundy/10"
                              >
                                <Link to={`/subspecialities/edit/${row.id}`}>
                                  <Pencil className="h-4 w-4 mr-1.5" />
                                  Edit
                                </Link>
                              </Button>
                            </PermissionGate>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                              Arabic Name
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">
                              Department
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                              Last Updated
                            </th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider w-[120px]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedItems.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 group ${
                                index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-burgundy/10 flex items-center justify-center">
                                    <span className="text-burgundy text-sm font-medium">
                                      {row.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-800">
                                    {row.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4" dir="rtl">
                                <span className="text-slate-700">{row.arabicName}</span>
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {row.departmentName || "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-sm hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(row.updatedAt)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10 transition-all duration-200"
                                    title="View"
                                  >
                                    <Link to={`/subspecialities/view/${row.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  {/* <PermissionGate permission={PERMISSIONS.SUBSPECIALITY_UPDATE}>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10 transition-all duration-200"
                                      title="Edit"
                                    >
                                      <Link to={`/subspecialities/edit/${row.id}`}>
                                        <Pencil className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </PermissionGate> */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
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
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`min-w-[36px] ${
                                    currentPage === pageNum
                                      ? "bg-burgundy hover:bg-burgundy/90 text-white"
                                      : "hover:border-burgundy/30 hover:text-burgundy"
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="gap-1"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
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

export default Subspecialities;
