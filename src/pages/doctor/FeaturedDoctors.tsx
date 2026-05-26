import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ExternalLink, XCircle, CheckCircle } from "lucide-react";
import { adminDoctors, AdminDoctor } from "@/data/adminDoctors";

type Doctor = {
  _id: string;
  doctorId?: string;
  name: string;
  specialty: string;
  department: string | { _id?: string; name?: string };
  title: string;
  bio: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
  isFeatured?: boolean;
};

const getStoredFeaturedDoctors = (): string[] => {
  const stored = localStorage.getItem("rhh_featured_doctors");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const getStoredUserDoctors = () => {
  const stored = localStorage.getItem("rhh_doctors");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const convertAdminDoctorToDoctor = (adminDoctor: AdminDoctor): Doctor => {
  return {
    _id: adminDoctor.id,
    doctorId: adminDoctor.doctorId,
    name: adminDoctor.name,
    specialty: adminDoctor.title?.split(",")[0] || "General",
    department: adminDoctor.department,
    title: adminDoctor.title,
    bio: "",
    qualifications: adminDoctor.qualifications,
    expertise: adminDoctor.expertise,
    languages: adminDoctor.languages,
    initials: adminDoctor.initials,
    color: "bg-burgundy",
    symptoms: [],
    availableOnline: adminDoctor.availableOnline,
    image: adminDoctor.image,
    isActive: true,
    isFeatured: false,
  };
};

const convertUserDoctorToDoctor = (userDoctor: {
  id: string;
  doctorId?: string;
  name: string;
  title?: string;
  department: Doctor["department"];
  qualifications?: string[];
  expertise?: string[];
  languages?: string[];
  initials?: string;
  availableOnline?: boolean;
  image?: string;
  isActive?: boolean;
}): Doctor => {
  return {
    _id: userDoctor.id,
    doctorId: userDoctor.doctorId,
    name: userDoctor.name,
    specialty: userDoctor.title?.split(",")[0] || "General",
    department: userDoctor.department,
    title: userDoctor.title ?? "",
    bio: "",
    qualifications: userDoctor.qualifications || [],
    expertise: userDoctor.expertise || [],
    languages: userDoctor.languages || [],
    initials: userDoctor.initials || "DR",
    color: "bg-burgundy",
    symptoms: [],
    availableOnline: userDoctor.availableOnline !== undefined ? userDoctor.availableOnline : true,
    image: userDoctor.image,
    isActive: userDoctor.isActive !== undefined ? userDoctor.isActive : true,
    isFeatured: false,
  };
};

const getAllDoctors = (): Doctor[] => {
  const userDoctors = getStoredUserDoctors();
  const convertedUserDoctors = userDoctors.map(convertUserDoctorToDoctor);
  const staticDoctors = adminDoctors.map(convertAdminDoctorToDoctor);

  const existingDoctorIds = new Set(convertedUserDoctors.map((doc) => doc.doctorId));
  const newStaticDoctors = staticDoctors.filter((doc) => !existingDoctorIds.has(doc.doctorId));

  return [...convertedUserDoctors, ...newStaticDoctors];
};

const FeaturedDoctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  const loadFeaturedDoctors = () => {
    const featuredIds = getStoredFeaturedDoctors();
    const allDoctors = getAllDoctors();

    const featured = allDoctors.filter(
      (doctor) => featuredIds.includes(doctor._id) && doctor.isActive !== false
    );

    setFeaturedDoctors(featured);
    setLoading(false);
  };

  useEffect(() => {
    loadFeaturedDoctors();

    const handleUpdate = () => {
      loadFeaturedDoctors();
    };

    window.addEventListener("doctorsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("doctorsUpdated", handleUpdate);
    };
  }, []);

  const getDepartmentName = (department: Doctor["department"]) => {
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
      <div className="space-y-6">
        <BreadCrumb />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/doctors")}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <h2 className="text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
            </div>
          </div>

          <div className="flex gap-3">
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

            <Button onClick={() => navigate("/doctors")} className="gap-2">
              <Star className="h-4 w-4" />
              {getUIText.featureDoctors}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
              </div>
            ) : featuredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Star className="h-10 w-10 text-slate-300" />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-burgundy/20 to-burgundy/10 flex items-center justify-center overflow-hidden border-2 border-burgundy/20 relative">
                            {doctor.image ? (
                              <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-burgundy font-bold text-xl">
                                {doctor.name.split(" ").pop()?.[0] || doctor.name[0]}
                              </span>
                            )}
                            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                              <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-800">{doctor.name}</p>
                            <p className="text-xs text-slate-500">{doctor.specialty || "General"}</p>
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

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{getUIText.department}</span>
                          <span className="text-slate-700 font-medium text-right">
                            {getDepartmentName(doctor.department)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{getUIText.title}</span>
                          <span className="text-slate-700 text-right">
                            {doctor.title?.substring(0, 30) || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{getUIText.onlineBooking}</span>
                          <span
                            className={`font-medium ${
                              doctor.availableOnline ? "text-green-600" : "text-slate-400"
                            }`}
                          >
                            {doctor.availableOnline ? getUIText.available : getUIText.unavailable}
                          </span>
                        </div>
                      </div>

                      {doctor.expertise && doctor.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {doctor.expertise.slice(0, 3).map((exp) => (
                            <span
                              key={exp}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-burgundy/10 text-burgundy"
                            >
                              {exp.length > 15 ? exp.slice(0, 12) + "..." : exp}
                            </span>
                          ))}
                          {doctor.expertise.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500">
                              +{doctor.expertise.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/doctors/view/${doctor._id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink size={12} />
                          {getUIText.viewDetails}
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
