import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  User,
  XCircle,
  Globe,
  Brain,
  Languages,
  GraduationCap,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getDoctorById, mapApiDoctorToView, type DoctorViewData } from "@/api/doctors";
import type { ApiDoctor } from "@/api/doctors";

const isSectionSubHeading = (value: string) => /[:：]\s*$/.test(value.trim());

const formatSectionSubHeading = (value: string) => {
  const trimmed = value.trim();
  return /[:：]\s*$/.test(trimmed) ? trimmed : `${trimmed}:`;
};

const renderBulletItem = (item: string, idx: number, isArabic: boolean) => (
  <div
    key={idx}
    dir={isArabic ? "rtl" : "ltr"}
    className={`flex items-start gap-2 text-sm text-slate-600 ${isArabic ? "pr-4" : "pl-4"}`}
  >
    <span className="text-burgundy mt-0.5 shrink-0">•</span>
    <span className="flex-1">{item}</span>
  </div>
);

const ViewDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");

  useEffect(() => {
    if (!id) return;

    const loadDoctor = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDoctorById(id);
        const raw = (response.data?.data ?? response.data) as ApiDoctor | undefined;

        if (raw && raw._id) {
          setDoctor(mapApiDoctorToView(raw));
        } else {
          setError("Doctor not found.");
        }
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        setError(apiErr?.response?.data?.message || "Failed to load doctor.");
        toast.error(apiErr?.response?.data?.message || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };

    void loadDoctor();
  }, [id]);

  const getDepartmentName = () => {
    if (!doctor?.department) return "-";
    return activeLanguage === "english"
      ? doctor.department
      : doctor.departmentAr || doctor.department;
  };

  if (loading) {
    return (
      <AdminLayout title="View Doctor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading doctor details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="View Doctor">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <p className="text-sm text-red-600">{error}</p>
              <Button onClick={() => navigate("/doctors")} className="mt-4" variant="outline">
                Back to Doctors
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!doctor) {
    return (
      <AdminLayout title="View Doctor">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-sm text-muted-foreground">Doctor not found.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Doctor">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all self-start"
              >
                <ArrowLeft className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Back to Doctors</span>
              </button>

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

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm lg:sticky lg:top-6 h-fit">
                <div className="relative p-4 sm:p-6">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-burgundy/5 to-slate-100">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={activeLanguage === "english" ? doctor.name : doctor.arabicName}
                        className="w-full h-56 sm:h-80 object-contain"
                      />
                    ) : (
                      <div className="h-56 sm:h-80 flex items-center justify-center">
                        <User size={56} className="text-burgundy/60" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
                      doctor.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                    }`}
                  >
                    {doctor.isActive ? "Active" : "Inactive"}
                  </div>

                  <div className={`text-center mt-4 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                      {activeLanguage === "english" ? doctor.name : doctor.arabicName}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {activeLanguage === "english" ? doctor.title : doctor.arabicTitle}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-100">
                      <span className="text-slate-500">Doctor ID</span>
                      <span className="font-mono text-xs text-slate-700 break-all">
                        {doctor.doctorId || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-100">
                      <span className="text-slate-500">Department</span>
                      <span
                        className={`font-medium text-slate-700 ${
                          activeLanguage === "arabic" ? "rtl-text" : ""
                        }`}
                      >
                        {getDepartmentName()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                        doctor.availableOnline
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Globe size={12} />
                      {doctor.availableOnline
                        ? "Available for Online Booking"
                        : "Not Available for Online Consultation"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {doctor.qualifications.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap size={18} className="text-burgundy shrink-0" />
                      <h3 className="text-md font-semibold text-slate-800">Qualifications</h3>
                    </div>
                    <div
                      className={`space-y-1.5 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}
                      dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                    >
                      {(activeLanguage === "english"
                        ? doctor.qualifications
                        : doctor.arabicQualifications
                      ).map((item, idx) =>
                        isSectionSubHeading(item) ? (
                          <p
                            key={idx}
                            className="text-sm font-semibold text-slate-800 mt-4 first:mt-0"
                          >
                            {formatSectionSubHeading(item)}
                          </p>
                        ) : (
                          renderBulletItem(item, idx, activeLanguage === "arabic")
                        ),
                      )}
                    </div>
                  </div>
                )}

                {doctor.expertise.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain size={18} className="text-burgundy shrink-0" />
                      <h3 className="text-md font-semibold text-slate-800">Expertise</h3>
                    </div>
                    <div
                      className={`space-y-1.5 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}
                      dir={activeLanguage === "arabic" ? "rtl" : "ltr"}
                    >
                      {(activeLanguage === "english" ? doctor.expertise : doctor.arabicExpertise).map(
                        (item, idx) =>
                          isSectionSubHeading(item) ? (
                            <p
                              key={idx}
                              className="text-sm font-semibold text-slate-800 mt-4 first:mt-0"
                            >
                              {formatSectionSubHeading(item)}
                            </p>
                          ) : (
                            renderBulletItem(item, idx, activeLanguage === "arabic")
                          ),
                      )}
                    </div>
                  </div>
                )}

                {doctor.languages.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Languages size={18} className="text-burgundy shrink-0" />
                      <h3 className="text-md font-semibold text-slate-800">Languages</h3>
                    </div>
                    <div className={`flex flex-wrap gap-2 ${activeLanguage === "arabic" ? "rtl-text" : ""}`}>
                      {(activeLanguage === "english" ? doctor.languages : doctor.arabicLanguages).map(
                        (lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy"
                          >
                            {lang}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button onClick={() => navigate("/doctors")} variant="outline" className="w-full sm:flex-1">
                    {activeLanguage === "english" ? "View All Doctors" : "عرض جميع الأطباء"}
                  </Button>
                  <Button
                    onClick={() => navigate(`/doctors/edit/${id}`)}
                    className="w-full sm:flex-1 gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    <Pencil className="h-4 w-4" />
                    {activeLanguage === "english" ? "Edit Doctor" : "تعديل الطبيب"}
                  </Button>
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

export default ViewDoctor;
