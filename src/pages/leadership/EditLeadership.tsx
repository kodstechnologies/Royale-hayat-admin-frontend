import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, User, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getLeadershipById, updateLeadership } from "@/api/leadership";
import api from "@/api/axiosInstance";
import { TitlePositionFieldHints } from "./leadershipFormHints";

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

type FormData = {
  initials: string;
  initialsArabic: string;
  name: string;
  nameArabic: string;
  title: string;
  titleArabic: string;
  description: string;
  descriptionArabic: string;
  imageFile: File | null;
  existingImage: string;
};

const EditLeadership = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    initials: "",
    initialsArabic: "",
    name: "",
    nameArabic: "",
    title: "",
    titleArabic: "",
    description: "",
    descriptionArabic: "",
    imageFile: null,
    existingImage: "",
  });

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
      const data = response.data || response;
      
      if (data) {
        setFormData({
          initials: data.initials || "",
          initialsArabic: data.initialsArabic || "",
          name: data.name || "",
          nameArabic: data.nameArabic || "",
          title: data.title || "",
          titleArabic: data.titleArabic || "",
          description: data.description || "",
          descriptionArabic: data.descriptionArabic || "",
          imageFile: null,
          existingImage: data.image || "",
        });
        setPreviewUrl(data.image || "");
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image exceeds 5MB limit");
        setImageError("Image size exceeds 5MB limit");
        setTimeout(() => setImageError(""), 5000);
        return;
      }
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setImageError("");
    } else {
      toast.error("Please upload an image file");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image exceeds 5MB limit");
        setImageError("Image size exceeds 5MB limit");
        setTimeout(() => setImageError(""), 5000);
        return;
      }
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormData((prev) => ({ ...prev, imageFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setImageError("");
    } else if (file) {
      toast.error("Please upload an image file");
    }
    e.target.value = "";
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      existingImage: "",
    }));
    setImageError("Image is required");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter name (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.nameArabic.trim()) {
      toast.error("Please enter name (Arabic)");
      setActiveTab("arabic");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter title (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.titleArabic.trim()) {
      toast.error("Please enter title (Arabic)");
      setActiveTab("arabic");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter description (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.descriptionArabic.trim()) {
      toast.error("Please enter description (Arabic)");
      setActiveTab("arabic");
      return;
    }
    if (!formData.imageFile && !formData.existingImage) {
      toast.error("Please upload an image");
      setImageError("Image is required");
      return;
    }

    setSaving(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("initials", formData.initials);
      formDataToSend.append("initialsArabic", formData.initialsArabic);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("nameArabic", formData.nameArabic);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("titleArabic", formData.titleArabic);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("descriptionArabic", formData.descriptionArabic);
      
      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
      }

      const response = await updateLeadership(id!, formDataToSend);
      
      window.dispatchEvent(new Event("leadershipUpdated"));
      
      toast.success(response?.message || "Leadership updated successfully!");
      navigate("/leadership");
    } catch (error: any) {
      console.error("Error updating leadership:", error);
      
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.data?.meta) {
        const errors = error.response.data.meta;
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Failed to update leadership. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUIText = {
    pageTitle: "Edit Leadership",
    pageDescription: "Update leadership team member information",
    initials: "Initials",
    name: "Full Name",
    title: "Title / Position",
    description: "Description",
    image: "Upload Image",
    cancel: "Cancel",
    save: "Save Changes",
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Leadership">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Leadership">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
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
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
                </div>
              </div>

              <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "english"
                      ? "bg-white text-burgundy shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("arabic")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "arabic"
                      ? "bg-white text-burgundy shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <Languages className="h-3.5 w-3.5" />
                  العربية
                </button>
              </div>
            </div>

            
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {getUIText.initials} <span className="text-slate-400 text-xs">(Optional)</span>
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.initials : formData.initialsArabic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ...(activeTab === "english"
                            ? { initials: e.target.value }
                            : { initialsArabic: e.target.value }),
                        })
                      }
                      className="h-11"
                      maxLength={5}
                      placeholder={activeTab === "english" ? "e.g., Dr" : "مثال: أ.م"}
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    />
                  </div>

                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {getUIText.name} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.name : formData.nameArabic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ...(activeTab === "english"
                            ? { name: e.target.value }
                            : { nameArabic: e.target.value }),
                        })
                      }
                      className="h-11"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                      placeholder={activeTab === "english" ? "Enter full name" : "أدخل الاسم الكامل"}
                    />
                  </div>

                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {getUIText.title} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={activeTab === "english" ? formData.title : formData.titleArabic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ...(activeTab === "english"
                            ? { title: e.target.value }
                            : { titleArabic: e.target.value }),
                        })
                      }
                      className="h-11"
                      dir={activeTab === "arabic" ? "rtl" : "ltr"}
                      placeholder={activeTab === "english" ? "Enter title/position" : "أدخل المسمى/المنصب"}
                    />
                    <TitlePositionFieldHints activeTab={activeTab} />
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileText className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">{getUIText.description}</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {getUIText.description} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={activeTab === "english" ? formData.description : formData.descriptionArabic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ...(activeTab === "english"
                          ? { description: e.target.value }
                          : { descriptionArabic: e.target.value }),
                      })
                    }
                    rows={6}
                    className="resize-none"
                    dir={activeTab === "arabic" ? "rtl" : "ltr"}
                    placeholder={activeTab === "english" ? "Enter description" : "أدخل الوصف"}
                  />
                </div>
              </div>

              
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Upload className="h-5 w-5 text-burgundy shrink-0" />
                  <h3 className="text-md font-semibold text-slate-800">{getUIText.image}</h3>
                </div>

                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all ${
                    dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-200 bg-slate-50/30"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className={`absolute inset-0 w-full h-full opacity-0 ${
                      previewUrl ? "pointer-events-none" : "cursor-pointer"
                    }`}
                    onChange={handleImageUpload}
                  />
                  <div
                    className={`flex flex-col items-center justify-center py-8 px-4 text-center ${
                      previewUrl ? "relative z-10" : ""
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative pointer-events-auto">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-40 w-auto mx-auto rounded-lg object-cover" 
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500 mb-1">
                          {activeTab === "english" ? "Click to upload or drag & drop" : "انقر للرفع أو اسحب وأفلت"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activeTab === "english" ? "PNG, JPG, GIF up to 5MB" : "PNG، JPG، GIF حتى 5 ميجابايت"}
                        </p>
                        <p className="text-xs text-red-500 mt-2">
                          {activeTab === "english" ? "Maximum file size: 5MB" : "الحد الأقصى لحجم الملف: 5 ميجابايت"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                
                {imageError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{imageError}</p>
                  </div>
                )}
              </div>

              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => navigate("/leadership")} className="gap-2 w-full sm:w-auto">
                  <X className="h-4 w-4" />
                  {getUIText.cancel}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving}
                  className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : getUIText.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditLeadership;