import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import {
  Plus, Search, Edit, Eye, Trash2,
  ChevronLeft, ChevronRight, Image as ImageIcon,
  Heart, Calendar, Flower2,
} from "lucide-react";
import { toast } from "sonner";
import { getCSR, deleteCSR } from "@/api/csr";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type CSR = {
  _id: string;
  heading: string;
  subheading: string;
  arabicHeading: string;
  subheadingArabic: string;
  description: string;
  arabicDescription: string;
  images: string[];
  status?: "show" | "hide";
  order?: number;
  createdAt: string;
};

const uiText = {
  pageTitle: "CSR Initiatives",
  pageDescription: "Manage your CSR initiatives",
  celebratingLife: "Celebrating Life",
  csrInitiatives: "CSR Initiatives",
  addCSR: "Add Initiative",
  searchPlaceholder: "Search by heading or subheading...",
  heading: "Heading",
  images: "Images",
  actions: "Actions",
  view: "View",
  edit: "Edit",
  delete: "Delete",
  noData: "No CSR initiatives found",
  adjustFilters: "Try adjusting your search or filters",
  deleteConfirm: "Are you sure you want to delete this initiative?",
  cancel: "Cancel",
  confirmDelete: "Delete",
};

const celebratingLifeTitle = "Celebrating Life";
const celebratingLifeDescription =
  "Inspired by a vision of healing that extends beyond hospital walls, the monument blends art, nature, and contemporary design into a meaningful urban statement.\n\nWith its circular form representing continuity and its blooming flower reflecting growth and vitality, the landmark stands as a tribute to hope, wellness, and community connection. More than a structure, it is a gift to Kuwait - beautifying the cityscape while embodying a lasting commitment to compassion, care, and optimism for generations to come.\n\nRoyale Hayat Hospital ... More than care, A partner for life";

const displayHeading = (item: CSR) => item.heading?.trim() || item.arabicHeading || "—";
const displaySubheading = (item: CSR) => item.subheading?.trim() || item.subheadingArabic || "";

const AllCSR = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"celebrating" | "csr">("celebrating");
  const [csrData, setCsrData] = useState<CSR[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "csr") {
      loadCSRData();
    }
    const handleUpdate = () => loadCSRData();
    window.addEventListener("csrUpdated", handleUpdate);
    return () => window.removeEventListener("csrUpdated", handleUpdate);
  }, [activeTab]);

  const loadCSRData = async () => {
    setLoading(true);
    try {
      const response = await getCSR();
      const data = response.data || response;
      if (Array.isArray(data)) {
        setCsrData(
          data.map((item: any) => ({
            ...item,
            arabicHeading: item.arabicHeading ?? item.headingArabic ?? "",
            arabicDescription: item.arabicDescription ?? item.descriptionArabic ?? "",
            subheading: item.subheading ?? "",
            subheadingArabic: item.subheadingArabic ?? item.arabicSubheading ?? "",
          }))
        );
      } else {
        setCsrData([]);
      }
    } catch (error: any) {
      console.error("Error loading CSR data:", error);
      toast.error(error?.response?.data?.message || "Failed to load CSR data");
      setCsrData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = csrData.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    if (!searchValue) return true;
    return (
      item.heading.toLowerCase().includes(searchValue) ||
      item.arabicHeading.toLowerCase().includes(searchValue) ||
      (item.subheading || "").toLowerCase().includes(searchValue) ||
      (item.subheadingArabic || "").toLowerCase().includes(searchValue)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!hasPermission(PERMISSIONS.CSR_DELETE)) return;
    try {
      await deleteCSR(id);
      await loadCSRData();
      window.dispatchEvent(new Event("csrUpdated"));
      toast.success("CSR initiative deleted successfully");
      setShowDeleteConfirm(null);
      
      const newTotalPages = Math.ceil((filteredData.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error: any) {
      console.error("Error deleting CSR:", error);
      toast.error(error?.response?.data?.message || "Failed to delete CSR initiative");
    }
  };

  const CelebratingLifeTab = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 min-h-[180px] flex items-end">
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Flower2 className="h-6 w-6 text-slate-700" />
            <h3 className="text-2xl md:text-4xl font-bold text-slate-800">{celebratingLifeTitle}</h3>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="prose prose-sm max-w-none">
          {celebratingLifeDescription.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="text-slate-600 leading-relaxed mb-4 text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

    
    </div>
  );

  return (
    <AdminLayout title="CSR Initiatives">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Header with Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{uiText.pageTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{uiText.pageDescription}</p>
            </div>

            {activeTab === "csr" && (
              <PermissionGate permission={PERMISSIONS.CSR_CREATE}>
                <Button onClick={() => navigate("/csr/create")} className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  {uiText.addCSR}
                </Button>
              </PermissionGate>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("celebrating")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "celebrating"
                  ? "bg-white text-slate-800 shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Flower2 className="h-4 w-4" />
              {uiText.celebratingLife}
            </button>
            <button
              onClick={() => {
                setActiveTab("csr");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "csr"
                  ? "bg-white text-burgundy shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Heart className="h-4 w-4" />
              {uiText.csrInitiatives}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "celebrating" ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <CelebratingLifeTab />
            </div>
          </div>
        ) : (
          /* CSR Tab Content */
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            <div className="p-6">
              {/* Search Section */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={uiText.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                  />
                </div>
                {(searchTerm) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="gap-1 text-slate-500 hover:text-slate-700"
                  >
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
                          <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">#</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">{uiText.heading}</th>
                          <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500">{uiText.images}</th>
                          <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500">{uiText.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center">
                                <ImageIcon className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">{uiText.noData}</p>
                                <p className="text-sm text-slate-400 mt-1">{uiText.adjustFilters}</p>
                                <PermissionGate permission={PERMISSIONS.CSR_CREATE}>
                                  <Button
                                    onClick={() => navigate("/csr/create")}
                                    className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                                  >
                                    <Plus className="h-4 w-4" />
                                    {uiText.addCSR}
                                  </Button>
                                </PermissionGate>
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
                                  {displayHeading(item)}
                                  {displaySubheading(item) && (
                                    <span className="block text-xs text-slate-500 mt-1">
                                      {displaySubheading(item)}
                                    </span>
                                  )}
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
                                    onClick={() => navigate(`/csr/view/${item._id}`)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <PermissionGate permission={PERMISSIONS.CSR_UPDATE}>
                                    <button
                                      onClick={() => navigate(`/csr/edit/${item._id}`)}
                                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  </PermissionGate>
                                  <PermissionGate permission={PERMISSIONS.CSR_DELETE}>
                                    <button
                                      onClick={() => setShowDeleteConfirm(item._id)}
                                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </PermissionGate>
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{uiText.deleteConfirm}</h3>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                {uiText.cancel}
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                {uiText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllCSR;