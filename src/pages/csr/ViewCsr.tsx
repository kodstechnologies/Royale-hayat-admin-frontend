import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Image as ImageIcon, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getCSRById, deleteCSR } from "@/api/csr";

type CSR = {
  _id: string;
  heading: string;
  arabicHeading: string;
  description: string;
  arabicDescription: string;
  images: string[];
  status?: "show" | "hide";
  order?: number;
  createdAt: string;
  updatedAt?: string;
};

const ViewCSR = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<CSR | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/csr");
      return;
    }
    
    loadCSRData();
  }, [id, navigate]);

  const loadCSRData = async () => {
    setLoading(true);
    try {
      const response = await getCSRById(id!);
      const data = response.data || response;
      
      if (data) {
        setRecord(data);
      } else {
        toast.error("CSR initiative not found");
        navigate("/csr");
      }
    } catch (error: any) {
      console.error("Error loading CSR:", error);
      toast.error(error?.response?.data?.message || "Failed to load CSR data");
      navigate("/csr");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    
    setIsDeleting(true);
    try {
      await deleteCSR(record._id);
      window.dispatchEvent(new Event("csrUpdated"));
      toast.success("CSR initiative deleted successfully");
      navigate("/csr");
    } catch (error: any) {
      console.error("Error deleting CSR:", error);
      toast.error(error?.response?.data?.message || "Failed to delete CSR initiative");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(activeLanguage === "arabic" ? "ar-SA" : "en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const getUIText = {
    viewTitle: activeLanguage === "english" ? "View CSR Initiative" : "عرض المبادرة",
    backToList: activeLanguage === "english" ? "Back to List" : "رجوع إلى القائمة",
    edit: activeLanguage === "english" ? "Edit" : "تعديل",
    delete: activeLanguage === "english" ? "Delete" : "حذف",
    heading: activeLanguage === "english" ? "Heading" : "العنوان",
    description: activeLanguage === "english" ? "Description" : "الوصف",
    images: activeLanguage === "english" ? "Images" : "الصور",
    createdDate: activeLanguage === "english" ? "Created Date" : "تاريخ الإنشاء",
    lastUpdated: activeLanguage === "english" ? "Last Updated" : "آخر تحديث",
    deleteConfirm: activeLanguage === "english" ? "Delete Initiative" : "حذف المبادرة",
    deleteMessage: activeLanguage === "english" ? "Are you sure you want to delete this CSR initiative? This action cannot be undone." : "هل أنت متأكد أنك تريد حذف هذه المبادرة؟ لا يمكن التراجع عن هذا الإجراء.",
    cancel: activeLanguage === "english" ? "Cancel" : "إلغاء",
    confirmDelete: activeLanguage === "english" ? "Delete" : "حذف",
  };

  if (loading) {
    return (
      <AdminLayout title="View CSR">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!record) return null;

  return (
    <AdminLayout title="View CSR">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/csr")} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-500 hover:text-burgundy" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{getUIText.viewTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{getUIText.backToList}</p>
            </div>
          </div>

          <div className="flex gap-3">
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
            <Button onClick={() => navigate(`/csr/edit/${id}`)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4" /> {getUIText.edit}
            </Button>
            <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="gap-2" disabled={isDeleting}>
              <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : getUIText.delete}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Heading */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{getUIText.heading}</label>
                  <p className="text-lg font-semibold text-slate-800 mt-1">
                    {activeLanguage === "english" ? record.heading : record.arabicHeading}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{getUIText.description}</label>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-600 leading-relaxed">
                    {activeLanguage === "english" ? record.description : record.arabicDescription}
                  </p>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-3">{getUIText.images} ({record.images?.length || 0})</label>
                {record.images && record.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {record.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-burgundy transition-all"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{getUIText.createdDate}</label>
                  <p className="text-slate-700">{formatDate(record.createdAt)}</p>
                </div>
                {record.updatedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{getUIText.lastUpdated}</label>
                    <p className="text-slate-700">{formatDate(record.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{getUIText.deleteConfirm}</h3>
            <p className="text-slate-600">{getUIText.deleteMessage}</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {getUIText.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : getUIText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ViewCSR; 