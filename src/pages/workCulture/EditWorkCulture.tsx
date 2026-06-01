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
import { getWorkCultureById, updateWorkCulture } from "@/api/workCulture";

type WorkCulture = {
  _id: string;
  heading: string;
  headingArabic: string;
  description: string;
  descriptionArabic: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

const EditWorkCulture = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    heading: "",
    headingArabic: "",
    description: "",
    descriptionArabic: "",
  });

  useEffect(() => {
    if (!id) {
      navigate("/work-culture");
      return;
    }
    
    loadWorkCultureData();
  }, [id, navigate]);

  const loadWorkCultureData = async () => {
    setLoading(true);
    try {
      const response = await getWorkCultureById(id);
      const data = response.data || response;
      
      if (data) {
        setFormData({
          heading: data.heading || "",
          headingArabic: data.headingArabic || "",
          description: data.description || "",
          descriptionArabic: data.descriptionArabic || "",
        });
        setExistingImages(data.images || []);
        setImagePreviews(data.images || []);
      } else {
        toast.error("Work culture not found");
        navigate("/work-culture");
      }
    } catch (error: any) {
      console.error("Error loading work culture:", error);
      toast.error(error?.response?.data?.message || "Failed to load work culture data");
      navigate("/work-culture");
    } finally {
      setLoading(false);
    }
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

    const oversizedFiles = imageFilesList.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some images exceed 5MB limit");
      return;
    }

    setImageFiles(prev => [...prev, ...imageFilesList]);

    const newPreviews = imageFilesList.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSaving(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("heading", formData.heading);
      formDataToSend.append("headingArabic", formData.headingArabic);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("descriptionArabic", formData.descriptionArabic);
      
      if (existingImages.length > 0) {
        existingImages.forEach((imageUrl) => {
          formDataToSend.append("existingImages", imageUrl);
        });
      } else {
        formDataToSend.append("existingImages", "");
      }
      
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await updateWorkCulture(id!, formDataToSend);
      
      window.dispatchEvent(new Event("workCultureUpdated"));
      
      toast.success(response?.message || "Work culture updated successfully!");
      navigate("/work-culture");
    } catch (error: any) {
      console.error("Error updating work culture:", error);
      
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.response?.data?.meta) {
        const errors = error.response.data.meta;
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error("Failed to update work culture. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const getUIText = {
    pageTitle: "Edit Work Culture",
    pageDescription: "Edit work culture content",
    heading: "Heading",
    description: "Description",
    images: "Upload Images",
    cancel: "Cancel",
    save: "Save Changes",
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Work Culture">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Work Culture">
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
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter heading" : "أدخل العنوان"}
                />
              </div>

              
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
                  className="resize-none"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter description" : "أدخل الوصف"}
                />
              </div>

              
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <Upload className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{getUIText.images}</h3>
                </div>

                
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Current Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Existing ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                
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
                      Click to upload or drag & drop additional images
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                  </div>
                </div>

                
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      New Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {imagePreviews.filter(preview => preview.startsWith('blob:')).map((preview, idx) => (
                        <div key={idx} className="relative group">
                          <img src={preview} alt={`New ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => removeNewImage(idx)}
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

export default EditWorkCulture;