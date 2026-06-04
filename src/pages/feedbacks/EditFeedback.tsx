import { useState, useEffect } from "react";
import { Edit, X, Star, Save, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  updateDoctorFeedback,
  updateHospitalFeedback,
  type FeedbackPayload,
} from "@/api/feedback";
import { getDoctors } from "@/api/doctors";
import { adminDoctors } from "@/data/adminDoctors";

export type DoctorFeedback = {
  id: string;
  _id?: string;
  doctorId: string;
  patientName: string;
  patientNameAr: string;
  doctorName: string;
  doctorNameAr: string;
  doctorInitials: string;
  doctorDepartment: string;
  doctorDepartmentAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  showOnWebsite: boolean;
  addedByAdmin?: boolean;
};

export type HospitalFeedback = {
  id: string;
  _id?: string;
  patientName: string;
  patientNameAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  date: string;
  showOnWebsite: boolean;
  addedByAdmin?: boolean;
};

type FeedbackDoctorOption = {
  doctorId: string;
  name: string;
  arabicName: string;
  department: string;
  departmentAr: string;
  initials: string;
};

type EditFormData = {
  patientName: string;
  patientNameAr: string;
  rating: number;
  comment: string;
  commentAr: string;
  doctorId: string;
  doctorName: string;
  doctorNameAr: string;
  doctorDepartment: string;
  doctorDepartmentAr: string;
  showOnWebsite: boolean;
};

export type EditFeedbackSaveResult =
  | { type: "doctor"; data: DoctorFeedback }
  | { type: "hospital"; data: HospitalFeedback };

type EditFeedbackProps = {
  feedback: DoctorFeedback | HospitalFeedback;
  feedbackType: "doctor" | "hospital";
  showArabicContent: boolean;
  onClose: () => void;
  onSaved: (result: EditFeedbackSaveResult) => void;
};

const hasText = (value?: string) => Boolean(value?.trim());

const isArabicOnlyFeedback = (comment: string, commentAr: string) =>
  hasText(commentAr) && !hasText(comment);

const isEnglishOnlyFeedback = (comment: string, commentAr: string) =>
  hasText(comment) && !hasText(commentAr);

const buildInitialFormData = (
  feedback: DoctorFeedback | HospitalFeedback,
  feedbackType: "doctor" | "hospital"
): EditFormData => ({
  patientName: feedback.patientName,
  patientNameAr: feedback.patientNameAr,
  rating: feedback.rating,
  comment: feedback.comment,
  commentAr: feedback.commentAr,
  doctorId: feedbackType === "doctor" ? (feedback as DoctorFeedback).doctorId : "",
  doctorName: feedbackType === "doctor" ? (feedback as DoctorFeedback).doctorName : "",
  doctorNameAr: feedbackType === "doctor" ? (feedback as DoctorFeedback).doctorNameAr : "",
  doctorDepartment: feedbackType === "doctor" ? (feedback as DoctorFeedback).doctorDepartment : "",
  doctorDepartmentAr: feedbackType === "doctor" ? (feedback as DoctorFeedback).doctorDepartmentAr : "",
  showOnWebsite: feedback.showOnWebsite,
});

const EditFeedback = ({
  feedback,
  feedbackType,
  showArabicContent,
  onClose,
  onSaved,
}: EditFeedbackProps) => {
  const [formData, setFormData] = useState<EditFormData>(() =>
    buildInitialFormData(feedback, feedbackType)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorOptions, setDoctorOptions] = useState<FeedbackDoctorOption[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const editingArabicOnly = isArabicOnlyFeedback(feedback.comment, feedback.commentAr);
  const editingEnglishOnly = isEnglishOnlyFeedback(feedback.comment, feedback.commentAr);

  useEffect(() => {
    setFormData(buildInitialFormData(feedback, feedbackType));
  }, [feedback, feedbackType]);

  useEffect(() => {
    if (feedbackType !== "doctor") return;

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
            name: doc.name || "",
            arabicName: doc.arabicName || doc.nameAr || adminMatch?.arabicName || "",
            department:
              departmentObj?.name ||
              (typeof doc.department === "string" ? doc.department : doc.specialty || adminMatch?.department || ""),
            departmentAr: departmentObj?.arabicName || departmentObj?.nameAr || adminMatch?.departmentAr || "",
            initials: doc.initials || adminMatch?.initials || "DR",
          };
        });
        setDoctorOptions(mapped.filter((d) => d.doctorId));
      } catch (error) {
        console.error("Failed to load doctors:", error);
        toast.error(showArabicContent ? "فشل في تحميل قائمة الأطباء" : "Failed to load doctors list");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [feedbackType, showArabicContent]);

  useEffect(() => {
    if (feedbackType !== "doctor") return;
    const df = feedback as DoctorFeedback;
    if (!df.doctorId) return;

    setDoctorOptions((prev) => {
      if (prev.some((d) => d.doctorId === df.doctorId)) return prev;
      return [
        ...prev,
        {
          doctorId: df.doctorId,
          name: df.doctorName,
          arabicName: df.doctorNameAr,
          department: df.doctorDepartment,
          departmentAr: df.doctorDepartmentAr,
          initials: df.doctorInitials || "DR",
        },
      ];
    });
  }, [feedback, feedbackType]);

  const handleDoctorSelect = (doctorId: string) => {
    if (doctorId) {
      const selected = doctorOptions.find((doc) => doc.doctorId === doctorId);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          doctorId: selected.doctorId,
          doctorName: selected.name,
          doctorNameAr: selected.arabicName,
          doctorDepartment: selected.department,
          doctorDepartmentAr: selected.departmentAr,
        }));
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      doctorId: "",
      doctorName: "",
      doctorNameAr: "",
      doctorDepartment: "",
      doctorDepartmentAr: "",
    }));
  };

  const renderStars = (rating: number, onChange: (rating: number) => void) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="cursor-pointer"
          disabled={isSubmitting}
        >
          <Star
            size={28}
            className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
          />
        </button>
      ))}
    </div>
  );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (feedbackType === "doctor") {
        if (!formData.doctorId) {
          toast.error(
            showArabicContent ? "الرجاء اختيار طبيب من القائمة" : "Please select a doctor from the list"
          );
          return;
        }

        const payload: FeedbackPayload = {
          userName: formData.patientName,
          arabicUserName: formData.patientNameAr,
          feedback: formData.comment,
          arabicFeedback: formData.commentAr,
          stars: formData.rating,
          shownOnWebsite: formData.showOnWebsite,
          doctor: formData.doctorId,
        };

        await updateDoctorFeedback({
          feedbackId: feedback.id,
          doctorId: formData.doctorId,
          data: payload,
        });

        const doctorInitials =
          doctorOptions.find((d) => d.doctorId === formData.doctorId)?.initials ||
          (formData.doctorName || formData.doctorNameAr)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ||
          "DR";

        onSaved({
          type: "doctor",
          data: {
            ...(feedback as DoctorFeedback),
            patientName: formData.patientName,
            patientNameAr: formData.patientNameAr,
            rating: formData.rating,
            comment: formData.comment,
            commentAr: formData.commentAr,
            doctorId: formData.doctorId,
            doctorName: formData.doctorName,
            doctorNameAr: formData.doctorNameAr,
            doctorDepartment: formData.doctorDepartment,
            doctorDepartmentAr: formData.doctorDepartmentAr,
            doctorInitials,
            showOnWebsite: formData.showOnWebsite,
          },
        });
      } else {
        const payload: FeedbackPayload = {
          userName: formData.patientName,
          arabicUserName: formData.patientNameAr,
          feedback: formData.comment,
          arabicFeedback: formData.commentAr,
          stars: formData.rating,
          shownOnWebsite: formData.showOnWebsite,
        };

        await updateHospitalFeedback({ feedbackId: feedback.id, data: payload });

        onSaved({
          type: "hospital",
          data: {
            ...(feedback as HospitalFeedback),
            patientName: formData.patientName,
            patientNameAr: formData.patientNameAr,
            rating: formData.rating,
            comment: formData.comment,
            commentAr: formData.commentAr,
            showOnWebsite: formData.showOnWebsite,
          },
        });
      }

      toast.success(showArabicContent ? "تم تحديث الملاحظة بنجاح" : "Feedback updated successfully");
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error(showArabicContent ? "فشل في تحديث الملاحظة" : "Failed to update feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uiText = {
    editFeedback: "Edit Feedback",
    updateDetails: "Update feedback details",
    rating: "Rating",
    cancel: "Cancel",
    save: "Save Changes",
    doctorName: "Doctor",
    department: "Department",
    selectDoctorPlaceholder: showArabicContent ? "اختر طبيباً..." : "Select a doctor...",
    loadingDoctors: showArabicContent ? "جاري تحميل الأطباء..." : "Loading doctors...",
    showOnWebsite: "Show on Website",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-burgundy/5 to-white border-b border-slate-100 p-5 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                <Edit className="h-5 w-5 text-burgundy" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{uiText.editFeedback}</h3>
                <p className="text-xs text-slate-500">{uiText.updateDetails}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{uiText.rating}</label>
            {renderStars(formData.rating, (rating) => setFormData({ ...formData, rating }))}
          </div>

          {!editingArabicOnly && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name (English)</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy disabled:bg-slate-50"
                placeholder="Enter patient name in English"
              />
            </div>
          )}

          {!editingEnglishOnly && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name (Arabic)</label>
              <input
                type="text"
                value={formData.patientNameAr}
                onChange={(e) => setFormData({ ...formData, patientNameAr: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy disabled:bg-slate-50"
                dir="rtl"
                placeholder="أدخل اسم المريض بالعربية"
              />
            </div>
          )}

          {feedbackType === "doctor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {uiText.doctorName}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.doctorId}
                    onChange={(e) => handleDoctorSelect(e.target.value)}
                    disabled={isSubmitting || loadingDoctors}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">
                      {loadingDoctors ? uiText.loadingDoctors : uiText.selectDoctorPlaceholder}
                    </option>
                    {doctorOptions.map((doctor) => (
                      <option key={doctor.doctorId} value={doctor.doctorId}>
                        {showArabicContent
                          ? `${doctor.arabicName || doctor.name} - ${doctor.departmentAr || doctor.department}`
                          : `${doctor.name} - ${doctor.department}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {!editingArabicOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {uiText.department} (English)
                  </label>
                  <input
                    type="text"
                    value={formData.doctorDepartment}
                    readOnly
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default"
                    placeholder="Auto-filled from doctor selection"
                  />
                </div>
              )}

              {!editingEnglishOnly && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {uiText.department} (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.doctorDepartmentAr}
                    readOnly
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default"
                    dir="rtl"
                    placeholder="يُملأ تلقائياً عند اختيار الطبيب"
                  />
                </div>
              )}
            </>
          )}

          {!editingArabicOnly && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Feedback (English)</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none disabled:bg-slate-50"
                placeholder="Enter feedback in English"
              />
            </div>
          )}

          {!editingEnglishOnly && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Feedback (Arabic)</label>
              <textarea
                value={formData.commentAr}
                onChange={(e) => setFormData({ ...formData, commentAr: e.target.value })}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none disabled:bg-slate-50"
                dir="rtl"
                placeholder="أدخل الملاحظة بالعربية"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="text-sm font-medium text-slate-700">{uiText.showOnWebsite}</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, showOnWebsite: !formData.showOnWebsite })}
              disabled={isSubmitting}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy/20 ${formData.showOnWebsite ? "bg-green-600" : "bg-slate-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.showOnWebsite ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
              {uiText.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {uiText.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeedback;
