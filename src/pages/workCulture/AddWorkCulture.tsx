import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axiosInstance";

const AddWorkCulture = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    heading: "",
    headingArabic: "",
    description: "",
    descriptionArabic: "",
  });

  // Cleanup preview URLs on unmount
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

    // Check file size (5MB limit)
    const oversizedFiles = imageFilesList.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some images exceed 5MB limit");
      return;
    }

    setImageFiles(prev => [...prev, ...imageFilesList]);

    // Create preview URLs
    const newPreviews = imageFilesList.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Log for debugging
    console.log("Images added:", imageFilesList.length);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
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
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSaving(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("heading", formData.heading);
      formDataToSend.append("headingArabic", formData.headingArabic);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("descriptionArabic", formData.descriptionArabic);
      
      // Append each image file with field name "images"
      // Make sure to append each file individually
      imageFiles.forEach((file, index) => {
        formDataToSend.append("images", file);
        console.log(`Appending image ${index + 1}:`, file.name, file.size);
      });

      // Log FormData contents for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await api.post("/api/v1/work-culture", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Dispatch event to notify list page
      window.dispatchEvent(new Event("workCultureUpdated"));
      
      toast.success(response.data?.message || "Work culture added successfully!");
      navigate("/work-culture");
    } catch (error: any) {
      console.error("Error adding work culture:", error);
      
      // Handle validation errors
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.data?.meta) {
        // Handle array of validation errors
        const errors = error.response.data.meta;
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Failed to add work culture. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUIText = {
    pageTitle: "Add Work Culture",
    pageDescription: "Add new work culture content",
    heading: "Heading",
    description: "Description",
    images: "Upload Images",
    cancel: "Cancel",
    save: "Save",
  };

  return (
    <AdminLayout title="Add Work Culture">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/work-culture")} className="p-2 rounded-xl hover:bg-slate-100">
                  <ArrowLeft className="h-5 w-5 text-slate-500 hover:text-burgundy" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{getUIText.pageTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{getUIText.pageDescription}</p>
                </div>
              </div>

              {/* Language Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
                <button
                  onClick={() => setActiveTab("english")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "english" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 inline mr-2" />
                  English
                </button>
                <button
                  onClick={() => setActiveTab("arabic")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "arabic" ? "bg-white text-burgundy shadow-sm" : "text-slate-600"
                  }`}
                >
                  <Languages className="h-3.5 w-3.5 inline mr-2" />
                  العربية
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Heading */}
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
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === "english" ? "English heading" : "العنوان بالعربية"}
                </p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.description}</h3>
                </div>
                <Textarea
                  value={activeTab === "english" ? formData.description : formData.descriptionArabic}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(activeTab === "english" ? { description: e.target.value } : { descriptionArabic: e.target.value })
                  })}
                  rows={6}
                  placeholder={activeTab === "english" ? "Enter description" : "أدخل الوصف"}
                  className="resize-none"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === "english" ? "English description" : "الوصف بالعربية"}
                </p>
              </div>

              {/* Multiple Images Upload */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <Upload className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.images}</h3>
                </div>

                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all p-8 ${
                    dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
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
                      {activeTab === "english" ? "At least one image is required" : "مطلوب صورة واحدة على الأقل"}
                    </p>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      {activeTab === "english" ? `Uploaded Images (${imagePreviews.length})` : `الصور المرفوعة (${imagePreviews.length})`}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
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

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/work-culture")} className="gap-2">
                  <X className="h-4 w-4" />
                  {getUIText.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
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

export default AddWorkCulture;