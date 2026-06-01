import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate from "@/utils/PermissionGate";
import {
  ArrowLeft,
  User,
  Calendar,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Globe,
  Languages
} from "lucide-react";
import { toast } from "sonner";
import { getAchievementById } from "@/api/achievement";
import { type Achievement, mapApiToAchievement } from "@/data/achievementData";

const ViewAchievement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getAchievementById(id);
        setAchievement(mapApiToAchievement(res.data));
      } catch {
        setError("Achievement not found");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: Achievement["status"]) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Published
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="View Achievement">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !achievement) {
    return (
      <AdminLayout title="View Achievement">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
            <div className="p-6 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Award className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Achievement not found</p>
              <p className="text-sm text-slate-400 mt-1">{error || "The achievement you're looking for doesn't exist"}</p>
              <Button
                onClick={() => navigate("/achievements")}
                className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
              >
                Back to Achievements
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Achievement">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate("/achievements")}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                  aria-label="Back to achievements"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Achievement Details
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    View complete achievement information
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("english")}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${activeLanguage === "english"
                        ? "bg-white text-burgundy shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLanguage("arabic")}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${activeLanguage === "arabic"
                        ? "bg-white text-burgundy shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                      }
                    `}
                  >
                    <Languages className="h-3.5 w-3.5 shrink-0" />
                    العربية
                  </button>
                </div>

                <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_UPDATE}>
                  <Button
                    onClick={() => navigate(`/achievements/edit/${achievement.id}`)}
                    className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </PermissionGate>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              
              <div className="lg:col-span-1 space-y-4">
                
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                    {achievement.image ? (
                      <img
                        src={achievement.image}
                        alt={activeLanguage === "english" ? achievement.title : achievement.arabicTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">
                          No image available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Status Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-sm text-slate-600">
                        Status
                      </span>
                      {getStatusBadge(achievement.status)}
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-sm text-slate-600">
                        Created At
                      </span>
                      <span className="text-sm text-slate-700">{formatDate(achievement.createdAt)}</span>
                    </div>
                    {achievement.updatedAt && (
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center">
                        <span className="text-sm text-slate-600">
                          Last Updated
                        </span>
                        <span className="text-sm text-slate-700">{formatDate(achievement.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              
              <div className="lg:col-span-2 space-y-4">
                
                <div className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <Award className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Achievement Title
                    </h3>
                  </div>
                  <h1 className={`text-lg sm:text-xl font-bold text-slate-800 break-words ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                    {activeLanguage === "english"
                      ? achievement.title
                      : achievement.arabicTitle || achievement.title}
                  </h1>
                </div>

                
                <div className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm ${activeLanguage === "arabic" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <User className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Employee Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Employee ID
                      </label>
                      <p className="text-sm font-mono text-slate-800 mt-1">{achievement.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Employee Name
                      </label>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {activeLanguage === "english"
                          ? achievement.employeeName
                          : achievement.arabicEmployeeName || achievement.employeeName}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Department
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {activeLanguage === "english"
                          ? achievement.department
                          : achievement.arabicDepartment || achievement.department}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Division
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {activeLanguage === "english" ? achievement.division : achievement.arabicDivision}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Month
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-sm text-slate-700">
                          {new Date(achievement.date).toLocaleString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                
                <div className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
                    <FileText className="h-4 w-4 text-burgundy" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Achievement Description
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {activeLanguage === "english"
                      ? achievement.description
                      : achievement.arabicDescription || achievement.description}
                  </p>
                </div>

                
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => navigate("/achievements")}
                    variant="outline"
                    className="w-full sm:flex-1"
                  >
                    Back to Employee Recognition
                  </Button>
                  <PermissionGate permission={PERMISSIONS.ACHIEVEMENT_UPDATE}>
                    <Button
                      onClick={() => navigate(`/achievements/edit/${achievement.id}`)}
                      className="w-full sm:flex-1 gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Achievement
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <style>{`
        .rtl-text {
          direction: rtl;
          text-align: right;
        }
      `}</style>
    </AdminLayout>
  );
};

export default ViewAchievement;