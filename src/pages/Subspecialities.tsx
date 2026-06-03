import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AlertBox from "@/components/AlertBox";
import { adminSubspecialities, AdminSubspeciality } from "@/data/subspeciality";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate from "@/utils/PermissionGate";

type Subspeciality = {
  id: string;
  name: string;
  arabicName: string;
  description?: string;
  arabicDescription?: string;
  departmentId: string;
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
};

const convertToSubspeciality = (sub: AdminSubspeciality): Subspeciality => {
  return {
    id: sub.id,
    name: sub.name,
    arabicName: sub.nameAr,
    description: "",
    arabicDescription: "",
    departmentId: sub.departmentId,
    departmentName: sub.departmentName,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
};

const initialSubspecialities: Subspeciality[] = adminSubspecialities.map(convertToSubspeciality);

const departmentNameMap: Record<string, string> = {
  "dept1": "Cardiology",
  "dept2": "Neurology",
  "dept3": "Pediatrics",
  "dept4": "Orthopedics",
  "dept5": "Dermatology",
  "dept6": "Ophthalmology",
  "dept7": "ENT",
  "dept8": "Urology",
  "dept9": "Internal Medicine",
  "dept10": "Radiology",
};

const loadSubspecialitiesFromStorage = () => {
  const stored = localStorage.getItem("rhh_subspecialities");
  if (stored) {
    const storedSubs = JSON.parse(stored);
    const formattedStoredSubs = storedSubs.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      arabicName: sub.arabicName,
      description: sub.description || "",
      arabicDescription: sub.arabicDescription || "",
      departmentId: sub.departmentId,
      departmentName: departmentNameMap[sub.departmentId] || sub.departmentId,
      createdAt: sub.createdAt || new Date().toISOString(),
      updatedAt: sub.updatedAt || new Date().toISOString(),
    }));

    const existingSubIds = new Set(formattedStoredSubs.map((sub: Subspeciality) => sub.id));
    const newSubsFromInitial = initialSubspecialities.filter(sub => !existingSubIds.has(sub.id));

    return [...formattedStoredSubs, ...newSubsFromInitial];
  }
  return initialSubspecialities;
};

const saveUserSubspecialitiesToStorage = (allSubspecialities: Subspeciality[]) => {
  const initialSubIds = new Set(initialSubspecialities.map(sub => sub.id));
  const userCreatedSubs = allSubspecialities.filter(sub => !initialSubIds.has(sub.id));

  const subsToStore = userCreatedSubs.map(sub => ({
    id: sub.id,
    name: sub.name,
    arabicName: sub.arabicName,
    description: sub.description,
    arabicDescription: sub.arabicDescription,
    departmentId: sub.departmentId,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  }));
  localStorage.setItem("rhh_subspecialities", JSON.stringify(subsToStore));
};

const Subspecialities = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<Subspeciality[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subspeciality | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const mergedSubs = loadSubspecialitiesFromStorage();
    setItems(mergedSubs);
    setTotalPages(Math.ceil(mergedSubs.length / limit));
  }, []);

  useEffect(() => {
    const handleSubspecialitiesUpdate = () => {
      const updatedSubs = loadSubspecialitiesFromStorage();
      setItems(updatedSubs);
      setTotalPages(Math.ceil(updatedSubs.length / limit));
      if (currentPage > Math.ceil(updatedSubs.length / limit)) {
        setCurrentPage(1);
      }
    };

    window.addEventListener("subspecialitiesUpdated", handleSubspecialitiesUpdate);

    return () => {
      window.removeEventListener("subspecialitiesUpdated", handleSubspecialitiesUpdate);
    };
  }, [currentPage, limit]);

  const departments = Array.from(new Set(items.map(item => item.departmentName))).filter(Boolean);

  const filteredItems = items.filter(item => {
    const matchesSearch = search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.arabicName.toLowerCase().includes(search.toLowerCase()) ||
      (item.departmentName && item.departmentName.toLowerCase().includes(search.toLowerCase()));

    const matchesDepartment = selectedDepartment === "all" || item.departmentId === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const paginatedItems = filteredItems.slice((currentPage - 1) * limit, currentPage * limit);
  const totalFilteredPages = Math.ceil(filteredItems.length / limit);

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(totalFilteredPages);
    }
  }, [filteredItems.length, totalFilteredPages, currentPage]);

  const confirmDelete = (row: Subspeciality) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = () => {
    if (!toDelete) return;

    setDeleting(true);
    setTimeout(() => {
      const initialSubIds = new Set(initialSubspecialities.map(sub => sub.id));
      const isUserCreated = !initialSubIds.has(toDelete.id);

      let updatedItems;
      if (isUserCreated) {
        updatedItems = items.filter(item => item.id !== toDelete.id);
      } else {
        updatedItems = items.filter(item => item.id !== toDelete.id);
      }

      setItems(updatedItems);
      saveUserSubspecialitiesToStorage(updatedItems);

      window.dispatchEvent(new Event("subspecialitiesUpdated"));

      toast.success("Subspeciality deleted successfully");
      setDeleteOpen(false);
      setToDelete(null);
      setDeleting(false);

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
      <div className="space-y-4 sm:space-y-6">
        
        <BreadCrumb />

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Subspecialities Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage medical subspecialities and organize your services</p>
              </div>

              <PermissionGate permission={PERMISSIONS.SUBSPECIALITY}>
                <Button
                  asChild
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90 shrink-0"
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
                  className="shadow-sm flex-1 min-[400px]:flex-none"
                >
                  Search
                </Button>
                {search && (
                  <Button
                    variant="ghost"
                    onClick={clearSearch}
                    className="text-slate-500 hover:text-slate-700 flex-1 min-[400px]:flex-none"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
                </div>
              </div>

              
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              
              
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
                    <p className="text-sm text-slate-400">Get started by creating your first subspeciality</p>
                    <PermissionGate permission={PERMISSIONS.SUBSPECIALITY}>
                      <Button asChild className="mt-4 gap-2 border-burgundy text-burgundy hover:bg-burgundy/5" variant="outline">
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
                          <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="text-burgundy hover:bg-burgundy/10"
                            >
                              <Link to={`/subspecialities/view/${row.id}`}>
                                <Eye className="h-4 w-4 mr-1.5" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </article>
                      ))}
                    </div>

                    
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                
                                Name
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                
                                Arabic Name
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                
                                Department
                              </div>
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                
                                Last Updated
                              </div>
                            </th>
                            <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider w-[100px]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedItems.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                                }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-burgundy/10 flex items-center justify-center">
                                    <span className="text-burgundy text-sm font-medium">
                                      {row.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-800">{row.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4" dir="rtl">
                                <span className="text-slate-700">{row.arabicName}</span>
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {row.departmentName}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-sm hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(row.updatedAt)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-burgundy hover:bg-burgundy/10 transition-all duration-200"
                                  >
                                    <Link to={`/subspecialities/view/${row.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  
                                  
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
                                    className={`min-w-[36px] ${currentPage === pageNum
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

      
      <AlertBox
        isOpen={deleteOpen}
        title="Delete Subspeciality"
        message={
          toDelete
            ? `Are you sure you want to delete "${toDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        isDeleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={runDelete}
      />
    </AdminLayout>
  );
};

export default Subspecialities;