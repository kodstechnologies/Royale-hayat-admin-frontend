import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Edit, Eye, Trash2, Eye as EyeIcon, 
  EyeOff, ChevronLeft, ChevronRight, X, 
  User 
} from "lucide-react";
import { toast } from "sonner";
import { getLeadership, deleteLeadership } from "@/api/leadership";

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

const AllLeadership = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
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
  const filteredData = leadershipData.filter(item => {
    const searchValue = searchTerm.toLowerCase();
    const name = activeLanguage === "english" ? item.name.toLowerCase() : item.nameArabic.toLowerCase();
    const title = activeLanguage === "english" ? item.title.toLowerCase() : item.titleArabic.toLowerCase();
    
    const matchesSearch = searchTerm === "" || name.includes(searchValue) || title.includes(searchValue);
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    try {
      await deleteLeadership(id);
      await loadLeadershipData();
      window.dispatchEvent(new Event("leadershipUpdated"));
      toast.success(activeLanguage === "english" ? "Leadership member deleted successfully" : "تم حذف القيادي بنجاح");
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

  const getUIText = {
    pageTitle: activeLanguage === "english" ? "Leadership Team" : "فريق القيادة",
    pageDescription: activeLanguage === "english" 
      ? "Manage your organization's leadership team members"
      : "إدارة أعضاء فريق القيادة في مؤسستك",
    addLeadership: activeLanguage === "english" ? "Add Leadership" : "إضافة قيادي",
    searchPlaceholder: activeLanguage === "english" ? "Search by name or title..." : "ابحث بالاسم أو المسمى...",
    name: activeLanguage === "english" ? "Name" : "الاسم",
    title: activeLanguage === "english" ? "Title" : "المسمى",
    actions: activeLanguage === "english" ? "Actions" : "الإجراءات",
    view: activeLanguage === "english" ? "View" : "عرض",
    edit: activeLanguage === "english" ? "Edit" : "تعديل",
    delete: activeLanguage === "english" ? "Delete" : "حذف",
    noData: activeLanguage === "english" ? "No leadership members found" : "لم يتم العثور على أعضاء قيادة",
    adjustFilters: activeLanguage === "english" ? "Try adjusting your search or filters" : "حاول تعديل البحث أو الفلاتر",
    previous: activeLanguage === "english" ? "Previous" : "السابق",
    next: activeLanguage === "english" ? "Next" : "التالي",
    deleteConfirm: activeLanguage === "english" ? "Are you sure you want to delete this leadership member?" : "هل أنت متأكد أنك تريد حذف هذا القيادي؟",
    cancel: activeLanguage === "english" ? "Cancel" : "إلغاء",
    confirmDelete: activeLanguage === "english" ? "Delete" : "حذف",
  };

  return (
    <AdminLayout title="Leadership Team">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
          </div>
          
          <div className="flex gap-3">
            {/* Language Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
              <button
                onClick={() => setActiveLanguage("english")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeLanguage === "english"
                    ? "bg-white text-burgundy shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveLanguage("arabic")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeLanguage === "arabic"
                    ? "bg-white text-burgundy shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                العربية
              </button>
            </div>
            
            <Button onClick={() => navigate("/leadership/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              {getUIText.addLeadership}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={getUIText.searchPlaceholder}
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
              className="gap-1 text-slate-500 hover:text-slate-700"
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
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {getUIText.name}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {getUIText.title}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {getUIText.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <User className="h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">{getUIText.noData}</p>
                          <p className="text-sm text-slate-400 mt-1">{getUIText.adjustFilters}</p>
                          <Button
                            onClick={() => navigate("/leadership/create")}
                            className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                          >
                            <Plus className="h-4 w-4" />
                            {getUIText.addLeadership}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {activeLanguage === "english" ? item.name : item.nameArabic}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {activeLanguage === "english" ? item.title : item.titleArabic}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/leadership/view/${item._id}`)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title={getUIText.view}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/leadership/edit/${item._id}`)}
                              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                              title={getUIText.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(item._id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title={getUIText.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
              <div className="flex justify-center gap-2 py-4 border-t border-slate-100">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {getUIText.deleteConfirm}
            </h3>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                {getUIText.cancel}
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                {getUIText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllLeadership;