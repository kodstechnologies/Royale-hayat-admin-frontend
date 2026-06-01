import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Edit, Eye, Trash2,
  ChevronLeft, ChevronRight, X,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { getLeadership, deleteLeadership } from "@/api/leadership";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type Leadership = {
  _id: string;
  initials: string;
  initialsArabic: string;
  name: string;
  nameArabic: string;
  title: string;
  titleArabic: string;
  description: string;
  descriptionArabic: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
};

const uiText = {
  pageTitle: "Leadership Team",
  pageDescription: "Manage your organization's leadership team members",
  addLeadership: "Add Leadership",
  searchPlaceholder: "Search by name or title...",
  name: "Name",
  title: "Title",
  actions: "Actions",
  view: "View",
  edit: "Edit",
  delete: "Delete",
  noData: "No leadership members found",
  adjustFilters: "Try adjusting your search or filters",
  deleteConfirm: "Are you sure you want to delete this leadership member?",
  cancel: "Cancel",
  confirmDelete: "Delete",
};

const displayName = (item: Leadership) => item.name?.trim() || item.nameArabic || "—";
const displayTitle = (item: Leadership) => item.title?.trim() || item.titleArabic || "—";

const AllLeadership = () => {
  const navigate = useNavigate();
  const [leadershipData, setLeadershipData] = useState<Leadership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount and listen for updates
  useEffect(() => {
    loadLeadershipData();
    
    // Listen for updates from Add/Edit pages
    const handleUpdate = () => {
      loadLeadershipData();
    };
    
    window.addEventListener("leadershipUpdated", handleUpdate);
    return () => {
      window.removeEventListener("leadershipUpdated", handleUpdate);
    };
  }, []);

  const loadLeadershipData = async () => {
    setLoading(true);
    try {
      const response = await getLeadership();
      const data = response.data || response;
      if (Array.isArray(data)) {
        setLeadershipData(data);
      } else {
        setLeadershipData([]);
      }
    } catch (error: any) {
      console.error("Error loading leadership data:", error);
      toast.error(error?.response?.data?.message || "Failed to load leadership data");
      setLeadershipData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredData = leadershipData.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    if (!searchValue) return true;
    return (
      item.name.toLowerCase().includes(searchValue) ||
      item.nameArabic.toLowerCase().includes(searchValue) ||
      item.title.toLowerCase().includes(searchValue) ||
      item.titleArabic.toLowerCase().includes(searchValue)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!hasPermission(PERMISSIONS.LEADERSHIP_DELETE)) return;
    try {
      await deleteLeadership(id);
      await loadLeadershipData();
      window.dispatchEvent(new Event("leadershipUpdated"));
      toast.success("Leadership member deleted successfully");
      setShowDeleteConfirm(null);
      
      // Adjust pagination if needed
      const newTotalPages = Math.ceil((filteredData.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error: any) {
      console.error("Error deleting leadership:", error);
      toast.error(error?.response?.data?.message || "Failed to delete leadership member");
    }
  };

  return (
    <AdminLayout title="Leadership Team">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{uiText.pageTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{uiText.pageDescription}</p>
          </div>

          <PermissionGate permission={PERMISSIONS.LEADERSHIP_CREATE}>
            <Button onClick={() => navigate("/leadership/create")} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {uiText.addLeadership}
            </Button>
          </PermissionGate>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={uiText.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="gap-1 text-slate-500 hover:text-slate-700 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-16 px-4">
            <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{uiText.noData}</p>
            <p className="text-sm text-slate-400 mt-1">{uiText.adjustFilters}</p>
            <PermissionGate permission={PERMISSIONS.LEADERSHIP_CREATE}>
              <Button
                onClick={() => navigate("/leadership/create")}
                className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
              >
                <Plus className="h-4 w-4" />
                {uiText.addLeadership}
              </Button>
            </PermissionGate>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <article key={item._id} className="p-4">
                  <div className="mb-3 min-w-0">
                    <p className="font-medium text-slate-800 break-words">
                      {displayName(item)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 break-words">
                      {displayTitle(item)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate(`/leadership/view/${item._id}`)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      {uiText.view}
                    </button>
                    <PermissionGate permission={PERMISSIONS.LEADERSHIP_UPDATE}>
                      <button
                        type="button"
                        onClick={() => navigate(`/leadership/edit/${item._id}`)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                        aria-label={uiText.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSIONS.LEADERSHIP_DELETE}>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(item._id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        aria-label={uiText.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGate>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {uiText.name}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {uiText.title}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {uiText.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {displayName(item)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {displayTitle(item)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/leadership/view/${item._id}`)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title={uiText.view}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <PermissionGate permission={PERMISSIONS.LEADERSHIP_UPDATE}>
                              <button
                                onClick={() => navigate(`/leadership/edit/${item._id}`)}
                                className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                title={uiText.edit}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </PermissionGate>
                            <PermissionGate permission={PERMISSIONS.LEADERSHIP_DELETE}>
                              <button
                                onClick={() => setShowDeleteConfirm(item._id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title={uiText.delete}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 py-4 px-2 border-t border-slate-100">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs transition-all ${
                        currentPage === page
                          ? "bg-burgundy text-white border-burgundy shadow-sm"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
              {uiText.deleteConfirm}
            </h3>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="w-full sm:w-auto">
                {uiText.cancel}
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)} className="w-full sm:w-auto">
                {uiText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllLeadership;