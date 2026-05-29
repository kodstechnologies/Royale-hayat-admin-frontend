import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  Plus, Search, Edit, Eye, Trash2, Eye as EyeIcon, 
  EyeOff, ChevronLeft, ChevronRight, Image as ImageIcon,
  Building2, Heart, Calendar, Users
} from "lucide-react";
import { toast } from "sonner";
import { getWorkCulture, deleteWorkCulture } from "@/api/workCulture";

type WorkCulture = {
  _id: string;  // Changed from id to _id
  heading: string;
  headingArabic: string;
  description: string;
  descriptionArabic: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

const AllWorkCulture = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
  const [activeTab, setActiveTab] = useState<"life" | "events">("events");
  const [workCultureData, setWorkCultureData] = useState<WorkCulture[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkCultureData();
    const handleUpdate = () => loadWorkCultureData();
    window.addEventListener("workCultureUpdated", handleUpdate);
    return () => window.removeEventListener("workCultureUpdated", handleUpdate);
  }, []);

  const loadWorkCultureData = async () => {
    setLoading(true);
    try {
      const response = await getWorkCulture();
      // Handle the response structure: response.data is the array
      const data = response.data || response;
      if (Array.isArray(data)) {
        setWorkCultureData(data);
      } else {
        setWorkCultureData([]);
      }
    } catch (error: any) {
      console.error("Error loading work culture data:", error);
      toast.error(error?.response?.data?.message || "Failed to load work culture data");
      setWorkCultureData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = workCultureData.filter(item => {
    const searchValue = searchTerm.toLowerCase();
    const heading = activeLanguage === "english" ? item.heading.toLowerCase() : item.headingArabic.toLowerCase();
    const matchesSearch = searchTerm === "" || heading.includes(searchValue);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkCulture(id);
      await loadWorkCultureData(); // Reload data after deletion
      window.dispatchEvent(new Event("workCultureUpdated"));
      toast.success(activeLanguage === "english" ? "Event deleted successfully" : "تم حذف الحدث بنجاح");
      setShowDeleteConfirm(null);
      
      // Adjust pagination if needed
      const newTotalPages = Math.ceil((filteredData.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
  };

  const getUIText = {
    pageTitle: activeLanguage === "english" ? "Work Culture" : "ثقافة العمل",
    pageDescription: activeLanguage === "english" ? "Manage your organization's work culture" : "إدارة ثقافة العمل في مؤسستك",
    lifeAtRHH: activeLanguage === "english" ? "Life at RHH" : "الحياة في آر إتش إتش",
    otherEvents: activeLanguage === "english" ? "Other Events" : "أحداث أخرى",
    addEvent: activeLanguage === "english" ? "Add Event" : "إضافة حدث",
    searchPlaceholder: activeLanguage === "english" ? "Search by heading..." : "ابحث بالعنوان...",
    heading: activeLanguage === "english" ? "Heading" : "العنوان",
    images: activeLanguage === "english" ? "Images" : "الصور",
    actions: activeLanguage === "english" ? "Actions" : "الإجراءات",
    view: activeLanguage === "english" ? "View" : "عرض",
    edit: activeLanguage === "english" ? "Edit" : "تعديل",
    delete: activeLanguage === "english" ? "Delete" : "حذف",
    noData: activeLanguage === "english" ? "No events found" : "لم يتم العثور على أحداث",
    adjustFilters: activeLanguage === "english" ? "Try adjusting your search or filters" : "حاول تعديل البحث أو الفلاتر",
    previous: activeLanguage === "english" ? "Previous" : "السابق",
    next: activeLanguage === "english" ? "Next" : "التالي",
    deleteConfirm: activeLanguage === "english" ? "Are you sure you want to delete this event?" : "هل أنت متأكد أنك تريد حذف هذا الحدث؟",
    cancel: activeLanguage === "english" ? "Cancel" : "إلغاء",
    confirmDelete: activeLanguage === "english" ? "Delete" : "حذف",
  };

  return (
    <AdminLayout title="Work Culture">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Header with Tabs */}
        <div className="flex flex-col gap-4">
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
                    activeLanguage === "english" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLanguage("arabic")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeLanguage === "arabic" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}
                >
                  العربية
                </button>
              </div>
              
              {activeTab === "events" && (
                <Button onClick={() => navigate("/work-culture/create")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {getUIText.addEvent}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("life")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "life"
                  ? "bg-white text-slate-800 shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Heart className="h-4 w-4" />
              {getUIText.lifeAtRHH}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "events"
                  ? "bg-white text-burgundy shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {getUIText.otherEvents}
            </button>
          </div>
        </div>

        {/* Tab Content - Only Events Tab Content */}
        <div
          className={`rounded-xl overflow-hidden ${
            activeTab === "life"
              ? "border border-slate-200 bg-white shadow-sm"
              : "border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm"
          }`}
        >
          {activeTab === "events" && (
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />
          )}
          <div className="p-6">
            {activeTab === "life" ? (
              <div className="space-y-6">
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 min-h-[180px] flex items-end">
                  <div className="relative p-6 md:p-8">
                    <h3 className="text-2xl md:text-4xl font-bold text-slate-800">
                      {activeLanguage === "english" ? "Life at Royale Hayat Hospital" : "الحياة في مستشفى رويال حياة"}
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                  <div className="prose prose-sm max-w-none">
                    {(activeLanguage === "english"
                      ? "At Royale Hayat Hospital, we hold a simple belief: people may forget what we said, but they will never forget how we made them feel as patients, family members, or colleagues.\n\nThat belief guides how we care, how we work, and how we treat one another. Every day, our teams deliver safe, modern, quality care with compassion and comfort-because healing is not only about medicine, but about experience.\n\nHere, professionalism meets kindness. Standards meet empathy. And work carries purpose. If this belief resonates with you, you already belong here."
                      : "في مستشفى رويال حياة، نحن نتمسك بإيمان بسيط: قد ينسى الناس ما قلناه، لكنهم لن ينسوا أبدًا كيف جعلناهم يشعرون كمرضى أو أفراد عائلة أو زملاء.\n\nهذا الإيمان يوجه كيفية رعايتنا، وكيف نعمل، وكيف نتعامل مع بعضنا البعض. كل يوم، تقدم فرقنا رعاية آمنة وحديثة وعالية الجودة مع الرحمة والراحة - لأن الشفاء لا يتعلق فقط بالطب، بل بالتجربة.\n\nهنا، تلتقي الاحترافية باللطف. تلتقي المعايير بالتعاطف. ويحمل العمل هدفًا. إذا كان هذا الإيمان يتردد صداه معك، فأنت بالفعل تنتمي إلى هنا.")
                      .split("\n\n")
                      .map((paragraph, idx) => (
                        <p key={idx} className="text-slate-600 leading-relaxed mb-4 text-base">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Search and Filter Section */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={getUIText.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
                  </div>
                ) : (
                  <>
                    {/* Events Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">#</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">{getUIText.heading}</th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">{getUIText.images}</th>
                            <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500">{getUIText.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center">
                                  <Calendar className="h-12 w-12 text-slate-300 mb-3" />
                                  <p className="text-slate-500 font-medium">{getUIText.noData}</p>
                                  <p className="text-sm text-slate-400 mt-1">{getUIText.adjustFilters}</p>
                                  <Button
                                    onClick={() => navigate("/work-culture/create")}
                                    className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                                  >
                                    <Plus className="h-4 w-4" />
                                    {getUIText.addEvent}
                                  </Button>
                                </div>
                               </td>
                            </tr>
                          ) : (
                            paginatedData.map((item, index) => (
                              <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-500">
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-medium text-slate-800">
                                    {activeLanguage === "english" ? item.heading : item.headingArabic}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1">
                                    <ImageIcon className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-600">{item.images?.length || 0} images</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => navigate(`/work-culture/view/${item._id}`)}
                                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => navigate(`/work-culture/edit/${item._id}`)}
                                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setShowDeleteConfirm(item._id)}
                                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
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
                      <div className="flex justify-center gap-2 py-4 border-t border-slate-100 mt-4">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[34px] px-2 py-1.5 rounded-lg border text-xs ${
                              currentPage === page ? "bg-burgundy text-white border-burgundy" : "border-slate-200"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs disabled:opacity-50"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{getUIText.deleteConfirm}</h3>
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

export default AllWorkCulture;