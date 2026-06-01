import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil, Plus, Trash2, Search, X, Check, ArrowLeft, ChevronLeft, ChevronRight, FolderOpen, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlertBox from "@/components/AlertBox";

type Category = {
  _id: string;
  name: string;
  arabicName: string;
  createdAt: string;
  updatedAt: string;
};

// Initial categories data
const initialCategories: Category[] = [
  {
    _id: "1",
    name: "Clinical speciality",
    arabicName: "التخصصات السريرية",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    name: "Clinical Support Service",
    arabicName: "خدمات الدعم السريري",
    createdAt: "2024-01-16T11:30:00Z",
    updatedAt: "2024-01-16T11:30:00Z",
  },
  {
    _id: "3",
    name: "Home Care Service",
    arabicName: "خدمات الرعاية المنزلية",
    createdAt: "2024-01-17T12:30:00Z",
    updatedAt: "2024-01-17T12:30:00Z",
  },
];

const Categories = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialCategories.length / 10));

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");

  const [nameDraft, setNameDraft] = useState("");
  const [arabicNameDraft, setArabicNameDraft] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.arabicName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);
  const totalFilteredPages = Math.ceil(filteredItems.length / limit);

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredItems.length, totalFilteredPages, currentPage]);

  const openCreateForm = () => {
    setNameDraft("");
    setArabicNameDraft("");
    setEditingItem(null);
    setActiveTab("english");
    setIsFormVisible(true);
  };

  const openEditForm = (row: Category) => {
    setEditingItem(row);
    setNameDraft(row.name);
    setArabicNameDraft(row.arabicName);
    setActiveTab("english");
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingItem(null);
    setNameDraft("");
    setArabicNameDraft("");
    setActiveTab("english");
  };

  const submitForm = () => {
    const name = nameDraft.trim();
    const arabicName = arabicNameDraft.trim();

    if (!name) {
      toast.error("English Name is required");
      return;
    }

    if (!arabicName) {
      toast.error("Arabic Name is required");
      return;
    }

    setSaving(true);

    setTimeout(() => {
      if (editingItem) {
        const updatedItems = items.map(item =>
          item._id === editingItem._id
            ? { ...item, name, arabicName, updatedAt: new Date().toISOString() }
            : item
        );
        setItems(updatedItems);
        toast.success("Category updated successfully");
      } else {
        const newCategory: Category = {
          _id: Date.now().toString(),
          name,
          arabicName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems([newCategory, ...items]);
        toast.success("Category created successfully");
        
        setCurrentPage(1);
        setSearch("");
        setSearchInput("");
      }

      setIsFormVisible(false);
      setEditingItem(null);
      setNameDraft("");
      setArabicNameDraft("");
      setSaving(false);
    }, 500);
  };

  const confirmDelete = (row: Category) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = () => {
    if (!toDelete) return;

    setDeleting(true);

    setTimeout(() => {
      const updatedItems = items.filter(item => item._id !== toDelete._id);
      setItems(updatedItems);
      toast.success("Category deleted successfully");
      setDeleteOpen(false);
      setToDelete(null);
      setDeleting(false);

      // Adjust pagination if needed
      const newTotalPages = Math.ceil(updatedItems.length / limit);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }, 500);
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
    <AdminLayout title="Categories">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />
        
        {/* Form View - Add/Edit Category */}
        {isFormVisible && (
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-6 min-w-0">
                <button
                  onClick={cancelForm}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    {editingItem ? "Edit Category" : "Add New Category"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingItem 
                      ? "Update the category details below" 
                      : "Fill in the details to create a new category"}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex w-full sm:w-fit gap-2 sm:gap-4 p-1 bg-slate-100/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab("english")}
                    className={`
                      flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeTab === "english"
                        ? "bg-white text-burgundy shadow-md"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Globe className="h-4 w-4" />
                    English Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("arabic")}
                    className={`
                      flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeTab === "arabic"
                        ? "bg-white text-burgundy shadow-md"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Languages className="h-4 w-4" />
                    Arabic Name
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                {activeTab === "english" && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-sm font-semibold text-slate-700">
                      English Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      placeholder="Enter category name in English"
                      autoFocus
                      className="h-11"
                    />
                  </div>
                )}
                
                {activeTab === "arabic" && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-sm font-semibold text-slate-700">
                      Arabic Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={arabicNameDraft}
                      onChange={(e) => setArabicNameDraft(e.target.value)}
                      placeholder="Enter category name in Arabic"
                      dir="rtl"
                      className="h-11"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={cancelForm}
                  className="gap-2 w-full sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={submitForm}
                  disabled={saving}
                  className="gap-2 bg-burgundy hover:bg-burgundy/90 w-full sm:w-auto"
                >
                  <Check className="h-4 w-4" />
                  {saving ? "Saving..." : (editingItem ? "Update Category" : "Create Category")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Card - Search, Add Button & Table */}
        {!isFormVisible && (
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Categories Management</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage your product categories</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Section */}
                  <div className="flex flex-col min-[400px]:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search categories..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applySearch()}
                        className="pl-9 w-full"
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

                  {/* Add Category Button */}
                  {/* <Button
                    onClick={openCreateForm}
                    className="gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button> */}
                </div>
              </div>

              {/* Table Section */}
              {paginatedItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No categories found</p>
                  <p className="text-sm text-slate-400 mt-1">Try adjusting your search or create a new category</p>
                  <Button
                    variant="outline"
                    onClick={openCreateForm}
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add your first category
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {paginatedItems.map((item) => (
                      <article
                        key={item._id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <p className="font-medium text-slate-800 text-sm leading-snug">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-600 mt-1" dir="rtl">
                          {item.arabicName}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Updated {formatDate(item.updatedAt)}
                        </p>
                      </article>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                            English Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                            Arabic Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">
                            Last Updated
                          </th>
                          {/* <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider w-[100px]">
                            Actions
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item, index) => (
                          <tr
                            key={item._id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors group ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-800">{item.name}</span>
                            </td>
                            <td className="py-3 px-4" dir="rtl">
                              <span className="text-slate-700">{item.arabicName}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-sm hidden md:table-cell">
                              {formatDate(item.updatedAt)}
                            </td>
                            {/* <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10"
                                  onClick={() => openEditForm(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => confirmDelete(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination - Bottom Right */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                        <div className="flex flex-wrap justify-center gap-2">
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
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DELETE ALERT */}
      <AlertBox
        isOpen={deleteOpen}
        title="Delete Category"
        message={
          toDelete
            ? `Are you sure you want to delete "${toDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
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