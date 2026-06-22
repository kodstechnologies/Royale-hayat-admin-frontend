import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, User, Award, FileText, CheckCircle, AlertCircle, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createAchievement } from "@/api/achievement";
import {
  ACHIEVEMENT_MONTHS,
  buildAchievementFormData,
  getAchievementYearOptions,
  parseAchievementMonthYear,
} from "@/data/achievementData";

type AchievementFormData = {
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  achievements: string;
  status: "show" | "hide";
  imageFile: File | null;
  arabicEmployeeName: string;
  arabicTitle: string;
  arabicAchievements: string;
  arabicDepartment: string;
  month: string;
  year: string;
};

const AddAchievement = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [status, setStatus] = useState<"show" | "hide">("show");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearImage = () => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, imageFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setImageFile = (file: File) => {
    setFormData((prev) => ({ ...prev, imageFile: file }));
    setPreviewUrl((prev) => {
      if (prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  };

  const [formData, setFormData] = useState<AchievementFormData>(() => {
    const { month, year } = parseAchievementMonthYear();
    return {
      employeeId: "",
      employeeName: "",
      department: "",
      title: "",
      achievements: "",
      status: "show",
      imageFile: null,
      arabicEmployeeName: "",
      arabicTitle: "",
      arabicAchievements: "",
      arabicDepartment: "",
      month,
      year,
    };
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      toast.error("Please upload an image file");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else if (file) {
      toast.error("Please upload an image file");
    }
    e.target.value = "";
  };

  const handleSubmit = async () => {
    const effectiveEmployeeName =
      formData.employeeName.trim() || formData.arabicEmployeeName.trim();
    const effectiveTitle = formData.title.trim() || formData.arabicTitle.trim();
    const effectiveAchievements =
      formData.achievements.trim() || formData.arabicAchievements.trim();
    const effectiveDepartment =
      formData.department.trim() || formData.arabicDepartment.trim();

    if (!formData.employeeId.trim()) {
      toast.error("Please enter Employee ID");
      return;
    }
    if (!effectiveEmployeeName) {
      toast.error("Please enter Employee Name");
      return;
    }
    if (!effectiveTitle) {
      toast.error("Please enter Achievement Title");
      return;
    }
    if (!effectiveAchievements) {
      toast.error("Please enter Achievement details");
      return;
    }
    setSaving(true);

    try {
      const formPayload = buildAchievementFormData({
        employeeId: formData.employeeId,
        employeeID: formData.employeeId,
        employeeName: effectiveEmployeeName,
        employeeNameArabic: formData.arabicEmployeeName,
        department: effectiveDepartment,
        arabicDepartment: formData.arabicDepartment,
        title: effectiveTitle,
        arabicTitle: formData.arabicTitle,
        achievements: effectiveAchievements,
        arabicAchievements: formData.arabicAchievements,
        visibilityStatus: status,
        imageFile: formData.imageFile,
        month: formData.month,
        year: formData.year,
      });

      await createAchievement(formPayload);

      toast.success(
        status === "show"
          ? "Achievement published successfully!"
          : "Achievement saved as hidden successfully!"
      );
      navigate("/achievements");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create achievement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Achievement">
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
                    Add Achievement
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Create a new employee achievement record
                  </p>
                </div>
              </div>
              
              
              <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === "english"
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
                  onClick={() => setActiveTab("arabic")}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === "arabic"
                      ? "bg-white text-burgundy shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                  `}
                >
                  <Languages className="h-3.5 w-3.5 shrink-0" />
                  العربية
                </button>
              </div>
            </div>

            
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">
                    Employee Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Enter Employee ID"
                      className="h-11"
                    />
                  </div>

                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Employee Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.employeeName : formData.arabicEmployeeName}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(activeTab === "english" 
                          ? { employeeName: e.target.value } 
                          : { arabicEmployeeName: e.target.value })
                      })}
                      placeholder={activeTab === "english" ? "Enter Employee Name" : "أدخل اسم الموظف"}
                      className="h-11"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    />
                  </div>

                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Department
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.department : formData.arabicDepartment}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(activeTab === "english" 
                          ? { department: e.target.value } 
                          : { arabicDepartment: e.target.value })
                      })}
                      placeholder={activeTab === "english" ? "Enter Department" : "أدخل القسم"}
                      className="h-11"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    />
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Award className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">
                    Achievement Details
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Month
                      </label>
                      <select
                        value={formData.month}
                        onChange={(e) =>
                          setFormData({ ...formData, month: e.target.value })
                        }
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {ACHIEVEMENT_MONTHS.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Year
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {getAchievementYearOptions().map((year) => (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.title : formData.arabicTitle}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(activeTab === "english" 
                          ? { title: e.target.value } 
                          : { arabicTitle: e.target.value })
                      })}
                      placeholder={activeTab === "english" 
                        ? "e.g., Best Employee of the Year, Excellence in Service, etc." 
                        : "مثال: أفضل موظف في العام، التميز في الخدمة، إلخ."}
                      className="h-11"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    />
                  </div>

                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Achievements <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={activeTab === "english" ? formData.achievements : formData.arabicAchievements}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        ...(activeTab === "english" 
                          ? { achievements: e.target.value } 
                          : { arabicAchievements: e.target.value })
                      })}
                      placeholder={activeTab === "english" 
                        ? "Describe the achievement in detail..." 
                        : "صف الإنجاز بالتفصيل..."}
                      rows={6}
                      className="resize-none"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    />
                    <p className="text-xs text-slate-400">
                      Provide a detailed description of the achievement, recognition, or award.
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Upload className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">
                    Upload Image
                  </h3>
                </div>

                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all ${dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-200 bg-slate-50/30"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="max-h-40 w-auto mx-auto rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 mb-1">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-slate-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Eye className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">
                    Visibility Status
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setStatus("show")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-3 ${
                      status === "show"
                        ? "border-burgundy bg-burgundy/5 text-burgundy"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Eye className="h-5 w-5" />
                    <span className="font-medium">
                      Show
                    </span>
                  </button>
                  <button
                    onClick={() => setStatus("hide")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-3 ${
                      status === "hide"
                        ? "border-burgundy bg-burgundy/5 text-burgundy"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <EyeOff className="h-5 w-5" />
                    <span className="font-medium">
                      Hide
                    </span>
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 text-center">
                  When set to 'Hide', this achievement will not be visible on the website
                </p>
              </div>

              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => navigate("/achievements")} className="gap-2 w-full sm:w-auto">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving}
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
                >
                  <Save className="h-4 w-4" />
                  {saving 
                    ? "Saving..."
                    : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAchievement;