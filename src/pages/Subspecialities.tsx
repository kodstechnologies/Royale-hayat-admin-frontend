import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  deleteSubspeciality as deleteSubspecialityApi,
  getSubspecialities,
  type Subspeciality,
} from "@/api/subspeciality";
import {
  Pencil,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";

const Subspecialities = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<Subspeciality[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subspeciality | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [listNonce, setListNonce] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getSubspecialities({
        page: currentPage,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
      });

      setItems(res?.data?.data ?? []);
      setTotalPages(res?.data?.meta?.totalPages ?? 1);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to load subspecialities"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList, listNonce]);

  const confirmDelete = (row: Subspeciality) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteSubspecialityApi(toDelete._id);
      toast.success(t("Subspeciality deleted successfully"));
      setDeleteOpen(false);
      setToDelete(null);
      setListNonce((n) => n + 1);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        t("Failed to delete")
      );
    } finally {
      setDeleting(false);
    }
  };

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout title="Subspecialities">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {/* Card Header */}
        

          {/* Search Bar Section with Add Button */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t("Search subspecialities by name...")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 h-10"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={applySearch}
                  className="shadow-sm"
                >
                  {t("Search")}
                </Button>
                {search && (
                  <Button
                    variant="ghost"
                    onClick={clearSearch}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t("Clear")}
                  </Button>
                )}
              </div>
              
              {/* Add Button - Extreme Right */}
              <Button asChild className="gap-2 bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200 shrink-0">
                <Link to="/subspecialities/create">
                  <Plus className="h-4 w-4" />
                  {t("Add Subspeciality")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="p-8">
              <Loader />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
                        <div className="flex items-center gap-2">
                          <span>📚</span>
                          {t("Name")}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
                        <div className="flex items-center gap-2">
                          <span>🇸🇦</span>
                          {t("Arabic Name")}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t("Last Updated")}
                        </div>
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm w-[100px]">
                        {t("Actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                              <FolderOpen className="h-10 w-10 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">{t("No subspecialities found")}</p>
                            <p className="text-sm text-slate-400">Get started by creating your first subspeciality</p>
                            <Button asChild className="mt-4 gap-2 border-burgundy text-burgundy hover:bg-burgundy/5" variant="outline">
                              <Link to="/subspecialities/create">
                                <Plus className="h-4 w-4" />
                                {t("Add your first subspeciality")}
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      items.map((row, index) => (
                        <tr 
                          key={row._id} 
                          className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 group ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-burgundy/10 flex items-center justify-center">
                                <span className="text-burgundy text-sm font-medium">
                                  {row.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-800">{row.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6" dir="rtl">
                            <span className="text-slate-700">{row.arabicName}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-sm hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(row.updatedAt)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10 transition-all duration-200"
                              >
                                <Link to={`/subspecialities/edit/${row._id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                onClick={() => confirmDelete(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Showing <span className="font-medium text-slate-700">{((currentPage - 1) * limit) + 1}</span> to{' '}
                      <span className="font-medium text-slate-700">{Math.min(currentPage * limit, items.length)}</span> of{' '}
                      <span className="font-medium text-slate-700">{items.length}</span> entries
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("Previous")}
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
                        {t("Next")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* DELETE ALERT */}
      <AlertBox
        isOpen={deleteOpen}
        title={t("Delete subspeciality")}
        message={
          toDelete
            ? `${t("Delete subspeciality confirm")} "${toDelete.name}"?`
            : ""
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={runDelete}
      />
    </AdminLayout>
  );
};

export default Subspecialities;