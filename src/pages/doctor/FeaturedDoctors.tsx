import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, StarOff, ExternalLink, XCircle, CheckCircle, Globe, Languages } from "lucide-react";
import { toast } from "sonner";
import {
  getFeaturedDoctors,
  deleteFeaturedDoctor,
  mapFeaturedToListItem,
  type DoctorListItem,
} from "@/api/doctors";
import { formatDoctorDisplayNameAr } from "@/utils/doctorDisplayName";

const FeaturedDoctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredDoctors, setFeaturedDoctors] = useState<DoctorListItem[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
  const [unfeaturingId, setUnfeaturingId] = useState<string | null>(null);

  const loadFeaturedDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeaturedDoctors();
      const mapped = (res.data ?? [])
        .map(mapFeaturedToListItem)
        .filter((d): d is DoctorListItem => d !== null);
      setFeaturedDoctors(mapped);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load featured doctors");
      setFeaturedDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeaturedDoctors();
  }, [loadFeaturedDoctors]);

  const handleUnfeature = async (doctor: DoctorListItem) => {
    const featuredRecordId = doctor.featuredRecordId;
    if (!featuredRecordId) {
      toast.error("Unable to unfeature this doctor");
      return;
    }

    setUnfeaturingId(doctor._id);
    try {
      await deleteFeaturedDoctor(featuredRecordId);
      setFeaturedDoctors((prev) => prev.filter((item) => item._id !== doctor._id));
      toast.success(
        activeLanguage === "arabic"
          ? "تم إلغاء تمييز الطبيب بنجاح"
          : "Doctor removed from featured list",
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to unfeature doctor");
    } finally {
      setUnfeaturingId(null);
    }
  };

  const getDoctorDisplayName = (doctor: DoctorListItem) =>
    activeLanguage === "arabic" ? formatDoctorDisplayNameAr(doctor) : doctor.name;

  const getDepartmentName = (department: DoctorListItem["department"]) => {
    if (Array.isArray(department)) {
      return (
        department
          .map((item) => {
            if (typeof item === "string") return item;
            if (activeLanguage === "arabic") {
              return item?.arabicName || item?.name || "";
            }
            return item?.name || "";
          })
          .filter(Boolean)
          .join(", ") || "-"
      );
    }
    if (typeof department === "string") return department;
    if (activeLanguage === "arabic") {
      return department?.arabicName || department?.name || "-";
    }
    return department?.name || "-";
  };

  const getUIText = {
    pageTitle: activeLanguage === "english" ? "Featured Doctors" : "الأطباء المميزون",
    pageDescription:
      activeLanguage === "english"
        ? "Doctors featured on the homepage"
        : "الأطباء المميزون على الصفحة الرئيسية",
    noFeaturedDoctors:
      activeLanguage === "english" ? "No featured doctors found" : "لم يتم العثور على أطباء مميزين",
    goToDoctors:
      activeLanguage === "english"
        ? "Go to Doctors page to feature doctors"
        : "انتقل إلى صفحة الأطباء لتحديد أطباء مميزين",
    featureDoctors: activeLanguage === "english" ? "Feature Doctors" : "تحديد أطباء مميزين",
    viewDetails: activeLanguage === "english" ? "View Details" : "عرض التفاصيل",
    unfeature: activeLanguage === "english" ? "Unfeature" : "إلغاء التمييز",
    department: activeLanguage === "english" ? "Department" : "القسم",
    title: activeLanguage === "english" ? "Title" : "المسمى",
    onlineBooking: activeLanguage === "english" ? "Online Booking" : "الحجز عبر الإنترنت",
    available: activeLanguage === "english" ? "Available" : "متاح",
    unavailable: activeLanguage === "english" ? "Unavailable" : "غير متاح",
    active: activeLanguage === "english" ? "Active" : "نشط",
    inactive: activeLanguage === "english" ? "Inactive" : "غير نشط",
  };

  return (
    <AdminLayout title="Featured Doctors">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/doctors")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500 shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Button onClick={() => navigate("/doctors")} className="gap-2 w-full sm:w-auto">
              <Star className="h-4 w-4" />
              {getUIText.featureDoctors}
            </Button>

            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveLanguage("english")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeLanguage === "english" ? "bg-white text-burgundy shadow-sm" : ""
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLanguage("arabic")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeLanguage === "arabic" ? "bg-white text-burgundy shadow-sm" : ""
                }`}
              >
                <Languages className="h-3.5 w-3.5" />
                العربية
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
              </div>
            ) : featuredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <Star className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{getUIText.noFeaturedDoctors}</p>
                <p className="text-sm text-slate-400 mt-1">{getUIText.goToDoctors}</p>
                <Button
                  onClick={() => navigate("/doctors")}
                  className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                >
                  <Star className="h-4 w-4" />
                  {getUIText.featureDoctors}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {featuredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-burgundy/10 flex items-center justify-center overflow-hidden relative">
                            {doctor.image ? (
                              <img
                                src={doctor.image}
                                alt={getDoctorDisplayName(doctor)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-burgundy font-bold text-xl">
                                {doctor.name[0]}
                              </span>
                            )}
                            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                              <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          </div>
                          <div className={activeLanguage === "arabic" ? "rtl-text" : ""}>
                            <p className="text-base font-semibold text-slate-800">
                              {getDoctorDisplayName(doctor)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {activeLanguage === "arabic"
                                ? doctor.specialtyAr || doctor.specialty
                                : doctor.specialty}
                            </p>
                          </div>
                        </div>
        
                      </div>

                      <div className="space-y-2 mb-4 text-xs">
                       
                        <div className="flex justify-between">
                          <span className="text-slate-500">{getUIText.onlineBooking}</span>
                          <span
                            className={
                              doctor.availableOnline ? "text-green-600" : "text-slate-400"
                            }
                          >
                            {doctor.availableOnline
                              ? getUIText.available
                              : getUIText.unavailable}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                        >
                          <ExternalLink size={12} />
                          {getUIText.viewDetails}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleUnfeature(doctor)}
                          disabled={unfeaturingId === doctor._id}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-medium hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <StarOff size={12} />
                          {unfeaturingId === doctor._id ? "..." : getUIText.unfeature}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeaturedDoctors;
