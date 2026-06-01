import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Calendar, Image as ImageIcon, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getCSRById, deleteCSR } from "@/api/csr";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

type CSR = {
  _id: string;
  heading: string;
  headingArabic: string;
  subheading: string;
  subheadingArabic: string;
  description: string;
  descriptionArabic: string;
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
      const raw = response.data ?? response;
      const data = raw?.data ?? raw;

      if (data) {
        setRecord({
          ...data,
          headingArabic: data.headingArabic ?? data.arabicHeading ?? "",
          subheading: data.subheading ?? "",
          subheadingArabic: data.subheadingArabic ?? data.arabicSubheading ?? "",
          descriptionArabic: data.descriptionArabic ?? data.arabicDescription ?? "",
        });
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
    if (!record || !hasPermission(PERMISSIONS.CSR_DELETE)) return;
    
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
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const uiText = {
    viewTitle: "View CSR Initiative",
    backToList: "Back to List",
    edit: "Edit",
    delete: "Delete",
    heading: "Heading",
    subheading: "Subheading",
    description: "Description",
    images: "Images",
    createdDate: "Created Date",
    lastUpdated: "Last Updated",
    deleteConfirm: "Delete Initiative",
    deleteMessage:
      "Are you sure you want to delete this CSR initiative? This action cannot be undone.",
    cancel: "Cancel",
    confirmDelete: "Delete",
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
              <h2 className="text-2xl font-bold text-slate-800">{uiText.viewTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{uiText.backToList}</p>
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
            <PermissionGate permission={PERMISSIONS.CSR_UPDATE}>
              <Button onClick={() => navigate(`/csr/edit/${id}`)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4" /> {uiText.edit}
              </Button>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.CSR_DELETE}>
              <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="gap-2" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : uiText.delete}
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          <div className="p-6">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{uiText.heading}</label>
                  <p
                    className="text-lg font-semibold text-slate-800 mt-1"
                    dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                  >
                    {activeLanguage === "english" ? record.heading : record.headingArabic}
                  </p>
                </div>
              </div>

              
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{uiText.subheading}</label>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p
                    className="text-slate-600 leading-relaxed"
                    dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                  >
                    {activeLanguage === "english" ? record.subheading : record.subheadingArabic}
                  </p>
                </div>
              </div>

              
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{uiText.description}</label>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p
                    className="text-slate-600 leading-relaxed"
                    dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                  >
                    {activeLanguage === "english" ? record.description : record.descriptionArabic}
                  </p>
                </div>
              </div>

              
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-3">{uiText.images} ({record.images?.length || 0})</label>
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

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{uiText.createdDate}</label>
                  <p className="text-slate-700">{formatDate(record.createdAt)}</p>
                </div>
                {record.updatedAt && (
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">{uiText.lastUpdated}</label>
                    <p className="text-slate-700">{formatDate(record.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
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

      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{uiText.deleteConfirm}</h3>
            <p className="text-slate-600">{uiText.deleteMessage}</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {uiText.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : uiText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ViewCSR; 