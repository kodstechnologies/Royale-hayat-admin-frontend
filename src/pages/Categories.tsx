import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createCatagory,
  deleteCatagory as deleteCatagoryApi,
  getCatagories,
  updateCatagory as updateCatagoryApi,
  type Catagory,
} from "@/api/catagory";
import { Pencil, Plus, Trash2, Search, X, Check, ArrowLeft, ChevronLeft, ChevronRight,FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";

const Categories = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<Catagory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Catagory | null>(null);

  const [nameDraft, setNameDraft] = useState("");
  const [arabicNameDraft, setArabicNameDraft] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Catagory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [listNonce, setListNonce] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getCatagories({
        page: currentPage,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setItems(res?.data?.data ?? []);
      setTotalPages(res?.data?.meta?.totalPages ?? 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      const msg =
        err?.response?.data?.message ??
        "Failed to load categories.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search]);

  useEffect(() => {
    if (!isFormVisible) {
      fetchList();
    }
  }, [fetchList, listNonce, isFormVisible]);

  const openCreateForm = () => {
    setNameDraft("");
    setArabicNameDraft("");
    setEditingItem(null);
    setIsFormVisible(true);
  };

  const openEditForm = (row: Catagory) => {
    setEditingItem(row);
    setNameDraft(row.name);
    setArabicNameDraft(row.arabicName || "");
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingItem(null);
    setNameDraft("");
    setArabicNameDraft("");
  };

  const submitForm = async () => {
    const name = nameDraft.trim();
    const arabicName = arabicNameDraft.trim();

    if (!name) {
      toast.error(t("Name is required"));
      return;
    }

    if (!arabicName) {
      toast.error(t("Arabic name is required"));
      return;
    }

    setSaving(true);

    try {
      if (editingItem) {
        await updateCatagoryApi(editingItem._id, {
          name,
          arabicName,
        });
        toast.success(t("Category updated successfully"));
      } else {
        await createCatagory({
          name,
          arabicName,
        });
        toast.success(t("Category created successfully"));
        
        setCurrentPage(1);
        setSearch("");
        setSearchInput("");
      }

      setIsFormVisible(false);
      setEditingItem(null);
      setNameDraft("");
      setArabicNameDraft("");
      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err?.response?.data?.message ??
        t("Failed to save")
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: Catagory) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteCatagoryApi(toDelete._id);

      toast.success(
        t("Category deleted successfully")
      );

      setDeleteOpen(false);
      setToDelete(null);

      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err?.response?.data?.message ??
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

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <BreadCrumb />
        
        {/* Form View - Add/Edit Category */}
        {isFormVisible && (
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white to-burgundy/5 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={cancelForm}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingItem ? t("Edit Category") : t("Add New Category")}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingItem 
                    ? t("Update the category details below") 
                    : t("Fill in the details to create a new category")}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("English Name")} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={t("Enter category name")}
                  autoFocus
                  className="h-11 border-slate-200 focus:border-burgundy focus:ring-burgundy/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t("Arabic Name")} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={arabicNameDraft}
                  onChange={(e) => setArabicNameDraft(e.target.value)}
                  placeholder={t("Enter Arabic category name")}
                  dir="rtl"
                  className="h-11 border-slate-200 focus:border-burgundy focus:ring-burgundy/20 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={cancelForm}
                className="gap-2 h-11 px-6"
              >
                <X className="h-4 w-4" />
                {t("Cancel")}
              </Button>
              <Button
                onClick={submitForm}
                disabled={saving}
                className="gap-2 h-11 px-6 bg-burgundy hover:bg-burgundy/90"
              >
                <Check className="h-4 w-4" />
                {saving ? t("Saving...") : (editingItem ? t("Update Category") : t("Create Category"))}
              </Button>
            </div>
          </div>
        )}

       

        {/* Main Card - Search, Add Button & Table */}
        {!isFormVisible && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Card Header with Search and Add Button */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Section */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder={t("Search categories...")}
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
                      {t("Search")}
                    </Button>
                    {search && (
                      <Button
                        variant="ghost"
                        onClick={clearSearch}
                        size="sm"
                      >
                        {t("Clear")}
                      </Button>
                    )}
                  </div>

                  {/* Add Category Button */}
                  <Button
                    onClick={openCreateForm}
                    className="gap-2 bg-burgundy hover:bg-burgundy/90"
                    size="default"
                  >
                    <Plus className="h-4 w-4" />
                    {t("Add category")}
                  </Button>
                </div>
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
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
                          {t("English Name")}
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
                          {t("Arabic Name")}
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm hidden md:table-cell">
                          {t("Last Updated")}
                        </th>
                        <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm w-[120px]">
                          {t("Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FolderOpen className="h-12 w-12 text-slate-300" />
                              <p className="text-slate-500">{t("No data available")}</p>
                              <Button
                                variant="outline"
                                onClick={openCreateForm}
                                className="mt-2 gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                {t("Add your first category")}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        items.map((row) => (
                          <tr key={row._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6">
                              <span className="font-medium text-slate-800">{row.name}</span>
                            </td>
                            <td className="py-3 px-6" dir="rtl">
                              <span className="text-slate-700">{row.arabicName}</span>
                            </td>
                            <td className="py-3 px-6 text-slate-500 text-sm hidden md:table-cell">
                              {row.updatedAt
                                ? new Date(row.updatedAt).toLocaleString()
                                : "—"}
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10"
                                  onClick={() => openEditForm(row)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
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
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, items.length)} of {items.length} entries
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
                        <div className="flex items-center gap-2">
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
                                className={currentPage === pageNum ? "bg-burgundy hover:bg-burgundy/90" : ""}
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
        )}
      </div>

      {/* DELETE ALERT */}
      <AlertBox
        isOpen={deleteOpen}
        title={t("Delete category")}
        message={
          toDelete
            ? `${t("Delete category confirm")} "${toDelete.name}"?`
            : ""
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setToDelete(null);
          }
        }}
        onConfirm={runDelete}
      />
    </AdminLayout>
  );
};

export default Categories;

// Import missing icon
