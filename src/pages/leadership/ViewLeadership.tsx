import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText, Briefcase, Calendar, Eye, Edit, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getLeadershipById, deleteLeadership } from "@/api/leadership";

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

const ViewLeadership = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [leadership, setLeadership] = useState<Leadership | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/leadership");
      return;
    }
    
    loadLeadershipData();
  }, [id, navigate]);

  const loadLeadershipData = async () => {
    setLoading(true);
    try {
      const response = await getLeadershipById(id!);
      const raw = response.data ?? response;
      const data = raw?.data ?? raw;

      if (data) {
        setLeadership({
          ...data,
          initialsArabic: data.initialsArabic ?? data.arabicInitials ?? "",
          nameArabic: data.nameArabic ?? data.arabicName ?? "",
          titleArabic: data.titleArabic ?? data.arabicTitle ?? "",
          descriptionArabic: data.descriptionArabic ?? data.arabicDescription ?? "",
        });
      } else {
        toast.error("Leadership member not found");
        navigate("/leadership");
      }
    } catch (error: any) {
      console.error("Error loading leadership:", error);
      toast.error(error?.response?.data?.message || "Failed to load leadership data");
      navigate("/leadership");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!leadership) return;
    
    setIsDeleting(true);
    try {
      await deleteLeadership(leadership._id);
      window.dispatchEvent(new Event("leadershipUpdated"));
      toast.success("Leadership member deleted successfully");
      navigate("/leadership");
    } catch (error: any) {
      console.error("Error deleting leadership:", error);
      toast.error(error?.response?.data?.message || "Failed to delete leadership member");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const uiText = {
    viewLeadership: "View Leadership",
    personalInfo: "Personal Information",
    name: "Full Name",
    initials: "Initials",
    title: "Title / Position",
    description: "Description",
    additionalInfo: "Additional Information",
    createdAt: "Created Date",
    lastUpdated: "Last Updated",
    edit: "Edit",
    delete: "Delete",
    subtitle: "View leadership member details",
    deleteConfirm: "Are you sure you want to delete this leadership member?",
    cancel: "Cancel",
    confirmDelete: "Delete",
  };

  if (loading) {
    return (
      <AdminLayout title="View Leadership">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!leadership) {
    return null;
  }

  return (
    <AdminLayout title="View Leadership">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/leadership")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
              aria-label="Back to leadership"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{uiText.viewLeadership}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{uiText.subtitle}</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveLanguage("english")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeLanguage === "english" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveLanguage("arabic")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeLanguage === "arabic" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mb-4 sm:mb-6 pb-4 border-b border-slate-100">
              <Button
                onClick={() => navigate(`/leadership/edit/${id}`)}
                className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                {uiText.edit}
              </Button>
              <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="gap-2 w-full sm:w-auto" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : uiText.delete}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Image Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <img
                    src={leadership.image}
                    alt={activeLanguage === "english" ? leadership.name : leadership.nameArabic}
                    className="w-full h-auto rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=No+Image";
                    }}
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                    <User className="h-5 w-5 text-burgundy shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">{uiText.personalInfo}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{uiText.initials}</p>
                      <p
                        className="text-sm font-medium text-slate-800"
                        dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                      >
                        {activeLanguage === "english" ? leadership.initials : leadership.initialsArabic}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-500 mb-1">{uiText.name}</p>
                      <p
                        className="text-sm font-medium text-slate-800"
                        dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                      >
                        {activeLanguage === "english" ? leadership.name : leadership.nameArabic}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-500 mb-1">{uiText.title}</p>
                      <p
                        className="text-sm font-medium text-slate-800"
                        dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                      >
                        {activeLanguage === "english" ? leadership.title : leadership.titleArabic}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                    <FileText className="h-5 w-5 text-burgundy shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">{uiText.description}</h3>
                  </div>
                  <p
                    className="text-sm text-slate-600 leading-relaxed break-words"
                    dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                  >
                    {activeLanguage === "english" ? leadership.description : leadership.descriptionArabic}
                  </p>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                    <Briefcase className="h-5 w-5 text-burgundy shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">{uiText.additionalInfo}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{uiText.createdAt}</p>
                      <p className="text-sm text-slate-700">{formatDate(leadership.createdAt)}</p>
                    </div>
                    {leadership.updatedAt && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{uiText.lastUpdated}</p>
                        <p className="text-sm text-slate-700">{formatDate(leadership.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">{uiText.deleteConfirm}</h3>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto">
                {uiText.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full sm:w-auto">
                {isDeleting ? "Deleting..." : uiText.confirmDelete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ViewLeadership;