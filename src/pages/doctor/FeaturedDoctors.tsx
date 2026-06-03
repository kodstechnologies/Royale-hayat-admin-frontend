import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ExternalLink, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getFeaturedDoctors,
  mapFeaturedToListItem,
  type DoctorListItem,
} from "@/api/doctors";

const FeaturedDoctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredDoctors, setFeaturedDoctors] = useState<DoctorListItem[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

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

  const getDepartmentName = (department: DoctorListItem["department"]) => {
    if (typeof department === "string") return department;
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

          <Button onClick={() => navigate("/doctors")} className="gap-2 w-full sm:w-auto">
            <Star className="h-4 w-4" />
            {getUIText.featureDoctors}
          </Button>
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
                                alt={doctor.name}
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
                          <div>
                            <p className="text-base font-semibold text-slate-800">{doctor.name}</p>
                            <p className="text-xs text-slate-500">{doctor.specialty}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                            doctor.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {doctor.isActive ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {doctor.isActive ? getUIText.active : getUIText.inactive}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{getUIText.department}</span>
                          <span className="text-slate-700 font-medium">
                            {getDepartmentName(doctor.department)}
                          </span>
                        </div>
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

                      <button
                        type="button"
                        onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                      >
                        <ExternalLink size={12} />
                        {getUIText.viewDetails}
                      </button>
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
