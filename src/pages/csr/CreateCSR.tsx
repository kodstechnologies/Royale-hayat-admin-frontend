import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, FileText, Upload, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axiosInstance";
import { appendDescriptionsToFormData } from "@/utils/csrDescriptions";

const CreateCSR = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string>("");

  const [formData, setFormData] = useState({
    heading: "",
    headingArabic: "",
    subheading: "",
    subheadingArabic: "",
    description: [""],
    descriptionArabic: [""],
  });

  const addDescription = (field: "description" | "descriptionArabic") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeDescription = (field: "description" | "descriptionArabic", index: number) => {
    setFormData((prev) => {
      const updated = prev[field].filter((_, i) => i !== index);
      return {
        ...prev,
        [field]: updated.length ? updated : [""],
      };
    });
  };

  const updateDescription = (
    field: "description" | "descriptionArabic",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    await processImages(files);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processImages(files);
  };

  const processImages = async (files: File[]) => {
    const imageFilesList = files.filter(file => file.type.startsWith("image/"));
    if (imageFilesList.length === 0) {
      toast.error("Please upload image files");
      return;
    }

    const oversizedFiles: File[] = [];
    const validFiles: File[] = [];

    imageFilesList.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(", ");
      toast.error(`The following images exceed 5MB limit: ${fileNames}`);
      setImageError(`Some images exceed 5MB limit. Maximum file size is 5MB.`);
      
      setTimeout(() => setImageError(""), 5000);
    }

    if (validFiles.length === 0) {
      if (imageFiles.length === 0) {
        setImageError("At least one image is required");
      }
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    setImageError(""); // Clear error when valid images are added

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    if (imageFiles.length === 1) {
      setImageError("At least one image is required");
    } else if (imageFiles.length === 0) {
      setImageError("At least one image is required");
    }
  };

  const handleSubmit = async () => {
    if (!formData.heading.trim()) {
      toast.error("Please enter heading (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.headingArabic.trim()) {
      toast.error("Please enter heading (Arabic)");
      setActiveTab("arabic");
      return;
    }
    if (!formData.subheading.trim()) {
      toast.error("Please enter subheading (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.subheadingArabic.trim()) {
      toast.error("Please enter subheading (Arabic)");
      setActiveTab("arabic");
      return;
    }
    const validDescriptions = formData.description.filter((item) => item.trim());
    if (!validDescriptions.length) {
      toast.error("Please enter at least one description paragraph (English)");
      setActiveTab("english");
      return;
    }
    const validDescriptionsArabic = formData.descriptionArabic.filter((item) => item.trim());
    if (!validDescriptionsArabic.length) {
      toast.error("Please enter at least one description paragraph (Arabic)");
      setActiveTab("arabic");
      return;
    }
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      setImageError("At least one image is required");
      return;
    }

    setSaving(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("heading", formData.heading);
      formDataToSend.append("headingArabic", formData.headingArabic);
      formDataToSend.append("subheading", formData.subheading);
      formDataToSend.append("subheadingArabic", formData.subheadingArabic);
      appendDescriptionsToFormData(
        formDataToSend,
        formData.description,
        formData.descriptionArabic,
      );
      
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await api.post("/api/v1/csr", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      window.dispatchEvent(new Event("csrUpdated"));
      
      toast.success(response?.data?.message || "CSR initiative added successfully!");
      navigate("/csr?tab=csr");
    } catch (error: any) {
      console.error("Error adding CSR:", error);
      
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.data?.meta) {
        const errors = error.response.data.meta;
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Failed to add CSR initiative. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUIText = {
    pageTitle: "Add CSR Initiative",
    pageDescription: "Add a new CSR initiative",
    heading: "Heading",
    subheading: "Subheading",
    description: "Description",
    images: "Upload Images",
    cancel: "Cancel",
    save: "Save",
  };

  return (
    <AdminLayout title="Add CSR">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/csr")} className="p-2 rounded-xl hover:bg-slate-100">
                  <ArrowLeft className="h-5 w-5 text-slate-500 hover:text-burgundy" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
                </div>
              </div>

              
              <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
                <button onClick={() => setActiveTab("english")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "english" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}>
                  <Globe className="h-3.5 w-3.5 inline mr-2" />
                  English
                </button>
                <button onClick={() => setActiveTab("arabic")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "arabic" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}>
                  <Languages className="h-3.5 w-3.5 inline mr-2" />
                  العربية
                </button>
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.heading}</h3>
                </div>
                <Input
                  value={activeTab === "english" ? formData.heading : formData.headingArabic}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(activeTab === "english" ? { heading: e.target.value } : { headingArabic: e.target.value })
                  })}
                  placeholder={activeTab === "english" ? "Enter heading" : "أدخل العنوان"}
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                />
              </div>

              
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.subheading}</h3>
                </div>
                <Input
                  value={activeTab === "english" ? formData.subheading : formData.subheadingArabic}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(activeTab === "english" ? { subheading: e.target.value } : { subheadingArabic: e.target.value })
                  })}
                  placeholder={activeTab === "english" ? "Enter subheading" : "أدخل العنوان الفرعي"}
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                />
              </div>

              
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-burgundy" />
                    <h3 className="font-semibold text-slate-800">{getUIText.description}</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addDescription(activeTab === "english" ? "description" : "descriptionArabic")
                    }
                    className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                  >
                    <Plus className="h-3 w-3" />
                    {activeTab === "english" ? "Add Paragraph" : "إضافة فقرة"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {(activeTab === "english" ? formData.description : formData.descriptionArabic).map(
                    (paragraph, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Textarea
                          value={paragraph}
                          onChange={(e) =>
                            updateDescription(
                              activeTab === "english" ? "description" : "descriptionArabic",
                              idx,
                              e.target.value,
                            )
                          }
                          rows={4}
                          placeholder={
                            activeTab === "english"
                              ? `Paragraph ${idx + 1}`
                              : `الفقرة ${idx + 1}`
                          }
                          className="resize-none flex-1"
                          dir={activeTab === "arabic" ? "rtl" : "ltr"}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeDescription(
                              activeTab === "english" ? "description" : "descriptionArabic",
                              idx,
                            )
                          }
                          className="h-10 w-10 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              </div>

              
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <Upload className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.images}</h3>
                </div>

                <div className={`relative rounded-xl border-2 border-dashed transition-all p-8 ${
                  dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-300"
                }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {activeTab === "english" ? "Click to upload or drag & drop multiple images" : "انقر للرفع أو اسحب وأفلت صور متعددة"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeTab === "english" ? "PNG, JPG, GIF up to 5MB each" : "PNG، JPG، GIF حتى 5 ميجابايت لكل صورة"}
                    </p>
                    <p className="text-xs text-red-500 mt-2">
                      {activeTab === "english" ? "Maximum file size: 5MB per image" : "الحد الأقصى لحجم الملف: 5 ميجابايت لكل صورة"}
                    </p>
                  </div>
                </div>

                
                {imageError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{imageError}</p>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      {activeTab === "english" ? `Uploaded Images (${imagePreviews.length})` : `الصور المرفوعة (${imagePreviews.length})`}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                            {(imageFiles[idx]?.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/csr")} className="gap-2">
                  <X className="h-4 w-4" />
                  {getUIText.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={saving || imageFiles.length === 0} className="gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : getUIText.save}
                </Button>
              </div>
              
              
              {imageFiles.length === 0 && (
                <p className="text-xs text-amber-600 text-center">
                  {activeTab === "english" 
                    ? "⚠️ Please upload at least one image to enable the Save button" 
                    : "⚠️ الرجاء رفع صورة واحدة على الأقل لتمكين زر الحفظ"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCSR;