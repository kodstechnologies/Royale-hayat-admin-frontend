import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { getCSRById, updateCSR } from "@/api/csr";

type CSR = {
  _id: string;
  heading: string;
  arabicHeading: string;
  description: string;
  arabicDescription: string;
  images: string[];
  status?: "show" | "hide";
  order?: number;
  createdAt: string;
};

const EditCSR = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    heading: "",
    arabicHeading: "",
    description: "",
    arabicDescription: "",
  });

  useEffect(() => {
    if (!id) {
      navigate("/csr");
      return;
    }
    
    loadCSRData();
  }, [id, navigate]);

  const loadCSRData = async () => {
    setLoading(true);
    try {
      const response = await getCSRById(id);
      const data = response.data || response;
      
      if (data) {
        setFormData({
          heading: data.heading || "",
          arabicHeading: data.arabicHeading || "",
          description: data.description || "",
          arabicDescription: data.arabicDescription || "",
        });
        setImages(data.images || []);
        setExistingImages(data.images || []);
      } else {
        toast.error("CSR initiative not found");
        navigate("/csr");
      }
    } catch (error: any) {
      console.error("Error loading CSR:", error);
      toast.error(error?.response?.data?.message || "Failed to load CSR data");
      navigate("/csr");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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

    setNewImageFiles(prev => [...prev, ...imageFilesList]);

    // Convert to base64 for preview
    const newImages = await Promise.all(
      imageFilesList.map(file => convertToBase64(file))
    );
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.heading.trim()) {
      toast.error("Please enter heading (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.arabicHeading.trim()) {
      toast.error("الرجاء إدخال العنوان بالعربية");
      setActiveTab("arabic");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter description (English)");
      setActiveTab("english");
      return;
    }
    if (!formData.arabicDescription.trim()) {
      toast.error("الرجاء إدخال الوصف بالعربية");
      setActiveTab("arabic");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSaving(true);
    
    try {
      // Prepare payload for API
      const payload = {
        heading: formData.heading,
        arabicHeading: formData.arabicHeading,
        description: formData.description,
        arabicDescription: formData.arabicDescription,
        images: images,
      };

      await updateCSR(id!, payload);
      
      window.dispatchEvent(new Event("csrUpdated"));
      toast.success("CSR initiative updated successfully!");
      navigate("/csr");
    } catch (error: any) {
      console.error("Error updating CSR:", error);
      
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.data?.meta) {
        const errors = error.response.data.meta;
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Failed to update CSR initiative. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUIText = {
    pageTitle: activeTab === "english" ? "Edit CSR Initiative" : "تعديل مبادرة",
    pageDescription: activeTab === "english" ? "Edit CSR initiative" : "تعديل مبادرة",
    heading: activeTab === "english" ? "Heading" : "العنوان",
    description: activeTab === "english" ? "Description" : "الوصف",
    images: activeTab === "english" ? "Upload Images" : "رفع الصور",
    cancel: activeTab === "english" ? "Cancel" : "إلغاء",
    save: activeTab === "english" ? "Save Changes" : "حفظ التغييرات",
  };

  if (loading) {
    return (
      <AdminLayout title="Edit CSR">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit CSR">
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
              {/* Heading */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.heading}</h3>
                </div>
                <Input
                  value={activeTab === "english" ? formData.heading : formData.arabicHeading}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(activeTab === "english" ? { heading: e.target.value } : { arabicHeading: e.target.value })
                  })}
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter heading" : "أدخل العنوان"}
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
                  value={activeTab === "english" ? formData.description : formData.arabicDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    ...(activeTab === "english" ? { description: e.target.value } : { arabicDescription: e.target.value })
                  })}
                  rows={6}
                  className="resize-none"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter description" : "أدخل الوصف"}
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

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      {activeTab === "english" ? "Current Images" : "الصور الحالية"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Existing ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
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

                {/* Upload New Images */}
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
                  </div>
                </div>

                {/* New Image Previews */}
                {images.filter(img => !existingImages.includes(img)).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      {activeTab === "english" ? "New Images" : "صور جديدة"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((img, idx) => {
                        if (!existingImages.includes(img)) {
                          return (
                            <div key={idx} className="relative group">
                              <img src={img} alt={`New ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                              <button
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate("/csr")} className="gap-2">
                  <X className="h-4 w-4" />
                  {getUIText.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Save className="h-4 w-4" />
                  {saving ? (activeTab === "english" ? "Saving..." : "جاري الحفظ...") : getUIText.save}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditCSR;