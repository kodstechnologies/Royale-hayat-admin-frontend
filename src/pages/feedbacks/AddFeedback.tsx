import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import {
  Star, User, Building2, Save, ArrowLeft, Globe, Languages,
  Shield, CheckCircle, AlertCircle, Loader2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  createDoctorFeedback,
  createHospitalFeedback
} from "@/api/feedback";
import { getDoctors } from "@/api/doctors";
import { adminDoctors } from "@/data/adminDoctors";

type FeedbackDoctorOption = {
  /** Doctor MongoDB _id (used in feedback API routes) */
  doctorId: string;
  providerCode?: string;
  name: string;
  arabicName: string;
  department: string;
  departmentAr: string;
  initials: string;
};

type AddFeedbackProps = {
  onSave?: (feedback: any) => void;
};

const AddFeedback = ({ onSave }: AddFeedbackProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [activeLanguage, setActiveLanguage] = useState<"english" | "arabic">("english");
  const [feedbackType, setFeedbackType] = useState<"doctor" | "hospital">("doctor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [doctorOptions, setDoctorOptions] = useState<FeedbackDoctorOption[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientNameAr: "",
    rating: 5,
    comment: "",
    commentAr: "",
    doctorName: "",
    doctorNameAr: "",
    doctorDepartment: "",
    doctorDepartmentAr: "",
    doctorInitials: "",
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const response = await getDoctors({ limit: 100, page: 1, sortBy: "name", sortOrder: "asc" });
        const doctors = response?.data?.data ?? response?.data ?? [];
        const mapped: FeedbackDoctorOption[] = (Array.isArray(doctors) ? doctors : []).map((doc: any) => {
          const adminMatch = adminDoctors.find(
            (a) =>
              (doc.doctorId && a.doctorId === doc.doctorId) ||
              a.name === doc.name ||
              doc.name?.includes(a.name.replace(/^Dr\.\s*/i, ""))
          );
          const departmentObj = doc.department && typeof doc.department === "object" ? doc.department : null;
          return {
            doctorId: String(doc._id || doc.id || ""),
            providerCode: doc.doctorId || "",
            name: doc.name || "",
            arabicName: doc.arabicName || doc.nameAr || adminMatch?.arabicName || "",
            department: departmentObj?.name || (typeof doc.department === "string" ? doc.department : doc.specialty || adminMatch?.department || ""),
            departmentAr: departmentObj?.arabicName || departmentObj?.nameAr || adminMatch?.departmentAr || "",
            initials: doc.initials || adminMatch?.initials || "DR",
          };
        });
        setDoctorOptions(mapped.filter((d) => d.doctorId));
      } catch (error) {
        console.error("Failed to load doctors:", error);
        toast.error("Failed to load doctors list");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    if (doctorId) {
      const selectedDoctor = doctorOptions.find((doc) => doc.doctorId === doctorId);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          doctorName: selectedDoctor.name,
          doctorNameAr: selectedDoctor.arabicName,
          doctorDepartment: selectedDoctor.department,
          doctorDepartmentAr: selectedDoctor.departmentAr,
          doctorInitials: selectedDoctor.initials,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        doctorName: "",
        doctorNameAr: "",
        doctorDepartment: "",
        doctorDepartmentAr: "",
        doctorInitials: "",
      }));
    }
  };

  const handleSubmit = async () => {
    const hasEnglish = formData.patientName.trim() !== "" && formData.comment.trim() !== "";
    const hasArabic = formData.patientNameAr.trim() !== "" && formData.commentAr.trim() !== "";
    
    if (!hasEnglish && !hasArabic) {
      toast.error(activeLanguage === "english" 
        ? "Please fill at least one language (English or Arabic)" 
        : "الرجاء ملء لغة واحدة على الأقل (الإنجليزية أو العربية)");
      return;
    }

    if (feedbackType === "doctor") {
      if (!selectedDoctorId) {
        toast.error(activeLanguage === "english"
          ? "Please select a doctor from the list"
          : "الرجاء اختيار طبيب من القائمة");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (feedbackType === "doctor") {
        const payload = {
          userName: formData.patientName,
          arabicUserName: formData.patientNameAr,
          feedback: formData.comment,
          arabicFeedback: formData.commentAr,
          stars: formData.rating,
          shownOnWebsite: true,
          doctor: selectedDoctorId,
        };

        await createDoctorFeedback({
          data: payload,
          language: activeLanguage === "arabic" ? "arabic" : "english",
          addedBy: "admin"
        });

        toast.success(activeLanguage === "english" 
          ? "Doctor feedback added successfully!" 
          : "تم إضافة ملاحظة الطبيب بنجاح!");
      } else {
        const payload = {
          userName: formData.patientName,
          arabicUserName: formData.patientNameAr,
          feedback: formData.comment,
          arabicFeedback: formData.commentAr,
          stars: formData.rating,
          shownOnWebsite: true
        };

        await createHospitalFeedback({
          data: payload,
          language: activeLanguage === "arabic" ? "arabic" : "english",
          addedBy: "admin"
        });

        toast.success(activeLanguage === "english" 
          ? "Hospital feedback added successfully!" 
          : "تم إضافة ملاحظة المستشفى بنجاح!");
      }

      if (onSave) {
        const newFeedback = {
          id: Date.now(),
          patientName: formData.patientName,
          patientNameAr: formData.patientNameAr,
          rating: formData.rating,
          comment: formData.comment,
          commentAr: formData.commentAr,
          date: new Date().toISOString().split('T')[0],
          showOnWebsite: true,
          addedByAdmin: true,
          ...(feedbackType === "doctor" && {
            doctorName: formData.doctorName,
            doctorNameAr: formData.doctorNameAr,
            doctorInitials: formData.doctorInitials || 
              (formData.doctorName || formData.doctorNameAr) 
              ? (formData.doctorName || formData.doctorNameAr).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : "DR",
            doctorDepartment: formData.doctorDepartment,
            doctorDepartmentAr: formData.doctorDepartmentAr,
          })
        };
        onSave(newFeedback);
      }
      
      navigate("/feedback");
    } catch (error: any) {
      console.error("Error adding feedback:", error);
      toast.error(activeLanguage === "english" 
        ? error?.response?.data?.message || "Failed to add feedback. Please try again." 
        : error?.response?.data?.message || "فشل في إضافة الملاحظة. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = true) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => interactive && setFormData({ ...formData, rating: s })}
            onMouseEnter={() => interactive && setHoveredRating(s)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
            disabled={isSubmitting}
          >
            <Star 
              size={32} 
              className={s <= (hoveredRating || formData.rating) 
                ? "text-amber-400 fill-amber-400" 
                : "text-slate-300"
              } 
            />
          </button>
        ))}
      </div>
    );
  };

  const getUIText = {
    pageTitle: activeLanguage === "english" ? "Add New Feedback" : "إضافة ملاحظة جديدة",
    pageDescription: activeLanguage === "english" 
      ? "Add patient feedback for doctors or hospital" 
      : "إضافة ملاحظات المرضى للأطباء أو المستشفى",
    feedbackType: activeLanguage === "english" ? "Feedback Type" : "نوع الملاحظة",
    doctorFeedback: activeLanguage === "english" ? "Doctor Feedback" : "ملاحظات الأطباء",
    hospitalFeedback: activeLanguage === "english" ? "Hospital Feedback" : "ملاحظات المستشفى",
    rating: activeLanguage === "english" ? "Rating" : "التقييم",
    
    patientName: activeLanguage === "english" ? "Patient Name" : "اسم المريض",
    doctorName: activeLanguage === "english" ? "Doctor Name" : "اسم الطبيب",
    department: activeLanguage === "english" ? "Department" : "القسم",
    feedback: activeLanguage === "english" ? "Feedback" : "الملاحظة",
    
    cancel: activeLanguage === "english" ? "Cancel" : "إلغاء",
    save: activeLanguage === "english" ? "Save Feedback" : "حفظ الملاحظة",
    saving: activeLanguage === "english" ? "Saving..." : "جاري الحفظ...",
    english: activeLanguage === "english" ? "English" : "الإنجليزية",
    arabic: activeLanguage === "english" ? "Arabic" : "العربية",
    backToFeedback: activeLanguage === "english" ? "Back to Feedback" : "رجوع إلى الملاحظات",
    selectDoctorPlaceholder: activeLanguage === "english" ? "Select a doctor..." : "اختر طبيباً...",
  };

  return (
    <AdminLayout title="Add Feedback">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />
        
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/feedback")}
            className="gap-2 w-full sm:w-auto justify-center sm:justify-start"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            {getUIText.backToFeedback}
          </Button>

          
          <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveLanguage("english")}
              disabled={isSubmitting}
              className={`
                flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${activeLanguage === "english"
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <Globe className="h-3.5 w-3.5" />
              {getUIText.english}
            </button>
            <button
              onClick={() => setActiveLanguage("arabic")}
              disabled={isSubmitting}
              className={`
                flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${activeLanguage === "arabic"
                  ? "bg-white text-burgundy shadow-sm"
                  : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <Languages className="h-3.5 w-3.5" />
              {getUIText.arabic}
            </button>
          </div>
        </div>

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-4 sm:p-6">
            
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">{getUIText.pageTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
            </div>

            <div className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {getUIText.feedbackType}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setFeedbackType("doctor");
                      setSelectedDoctorId("");
                    }}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm sm:text-base font-medium transition-all ${
                      feedbackType === "doctor"
                        ? "border-burgundy bg-burgundy/5 text-burgundy"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-5 w-5" />
                      {getUIText.doctorFeedback}
                    </div>
                  </button>
                  <button
                    onClick={() => setFeedbackType("hospital")}
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm sm:text-base font-medium transition-all ${
                      feedbackType === "hospital"
                        ? "border-burgundy bg-burgundy/5 text-burgundy"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {getUIText.hospitalFeedback}
                    </div>
                  </button>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {getUIText.rating}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {renderStars(formData.rating)}
              </div>

              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {getUIText.patientName}
                </label>
                {activeLanguage === "english" ? (
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter patient name (English)"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.patientNameAr}
                    onChange={(e) => setFormData({ ...formData, patientNameAr: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    dir="rtl"
                    placeholder="أدخل اسم المريض (عربي)"
                  />
                )}
              </div>

              
              {feedbackType === "doctor" && (
                <>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {getUIText.doctorName}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => handleDoctorSelect(e.target.value)}
                        disabled={isSubmitting || loadingDoctors}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">
                          {loadingDoctors
                            ? (activeLanguage === "english" ? "Loading doctors..." : "جاري تحميل الأطباء...")
                            : getUIText.selectDoctorPlaceholder}
                        </option>
                        {doctorOptions.map((doctor) => (
                          <option key={doctor.doctorId} value={doctor.doctorId}>
                            {activeLanguage === "english" ? doctor.name : (doctor.arabicName || doctor.name)} - {activeLanguage === "english" ? doctor.department : (doctor.departmentAr || doctor.department)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {getUIText.department}
                    </label>
                    {activeLanguage === "english" ? (
                      <input
                        type="text"
                        value={formData.doctorDepartment}
                        onChange={(e) => setFormData({ ...formData, doctorDepartment: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed bg-slate-50"
                        placeholder="e.g., Cardiology"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.doctorDepartmentAr}
                        onChange={(e) => setFormData({ ...formData, doctorDepartmentAr: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed bg-slate-50"
                        dir="rtl"
                        placeholder="مثال: أمراض القلب"
                      />
                    )}
                  </div>
                </>
              )}

              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {getUIText.feedback}
                </label>
                {activeLanguage === "english" ? (
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter feedback in English"
                  />
                ) : (
                  <textarea
                    value={formData.commentAr}
                    onChange={(e) => setFormData({ ...formData, commentAr: e.target.value })}
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                    dir="rtl"
                    placeholder="أدخل الملاحظة بالعربية"
                  />
                )}
              </div>

              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  {activeLanguage === "english" 
                    ? "ℹ️ You only need to fill in one language (English OR Arabic). The other language fields are optional."
                    : "ℹ️ تحتاج فقط إلى ملء لغة واحدة (الإنجليزية أو العربية). حقول اللغة الأخرى اختيارية."}
                </p>
              </div>

              
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/feedback")}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1"
                >
                  {getUIText.cancel}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {getUIText.saving}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {getUIText.save}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {activeLanguage === "english" ? "Admin Added Feedback" : "ملاحظات مضافة بواسطة المشرف"}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {activeLanguage === "english" 
                  ? "Feedback added by admin will be marked with 'Added by Admin' badge and will be visible in the feedback list." 
                  : "سيتم وضع علامة 'تمت الإضافة بواسطة المشرف' على الملاحظات المضافة بواسطة المشرف وستكون مرئية في قائمة الملاحظات."}
              </p>
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

export default AddFeedback;