import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Globe, Languages, FileText, Upload, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getCSRById } from "@/api/csr";
import api from "@/api/axiosInstance";
import {
  appendDescriptionsToFormData,
  normalizeDescriptionField,
} from "@/utils/csrDescriptions";

const EditCSR = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

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
    if (!id) {
      navigate("/csr");
      return;
    }

    loadCSRData();
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [newImagePreviews]);

  const loadCSRData = async () => {
    setLoading(true);
    try {
      const response = await getCSRById(id!);
      const raw = response.data ?? response;
      const data = raw?.data ?? raw;

      if (data) {
        setFormData({
          heading: data.heading || "",
          headingArabic: data.headingArabic ?? data.arabicHeading ?? "",
          subheading: data.subheading || "",
          subheadingArabic: data.subheadingArabic ?? data.arabicSubheading ?? "",
          description: normalizeDescriptionField(data.description),
          descriptionArabic: normalizeDescriptionField(
            data.descriptionArabic ?? data.arabicDescription,
          ),
        });
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
    e.target.value = "";
  };

  const processImages = async (files: File[]) => {
    const imageFilesList = files.filter((file) => file.type.startsWith("image/"));
    if (imageFilesList.length === 0) {
      toast.error("Please upload image files");
      return;
    }

    const oversizedFiles = imageFilesList.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Some images exceed 5MB limit");
      return;
    }

    setNewImageFiles((prev) => [...prev, ...imageFilesList]);
    const previews = imageFilesList.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const preview = newImagePreviews[index];
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error("Please upload at least one image");
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

      if (existingImages.length > 0) {
        existingImages.forEach((imageUrl) => {
          formDataToSend.append("existingImages", imageUrl);
        });
      } else {
        formDataToSend.append("existingImages", "");
      }

      newImageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const response = await api.put(`/api/v1/csr/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      window.dispatchEvent(new Event("csrUpdated"));
      toast.success(response?.data?.message || "CSR initiative updated successfully!");
      navigate("/csr?tab=csr");
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

  const uiText = {
    pageTitle: "Edit CSR Initiative",
    pageDescription: "Edit CSR initiative",
    heading: "Heading",
    subheading: "Subheading",
    description: "Description",
    images: "Upload Images",
    cancel: "Cancel",
    save: "Save Changes",
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
                  <h2 className="text-2xl font-bold text-slate-800">{uiText.pageTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{uiText.pageDescription}</p>
                </div>
              </div>

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
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{uiText.heading}</h3>
                </div>
                <Input
                  value={activeTab === "english" ? formData.heading : formData.headingArabic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ...(activeTab === "english"
                        ? { heading: e.target.value }
                        : { headingArabic: e.target.value }),
                    })
                  }
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter heading" : "أدخل العنوان"}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-4">
                  <FileText className="h-5 w-5 text-burgundy" />
                  <h3 className="font-semibold text-slate-800">{uiText.subheading}</h3>
                </div>
                <Input
                  value={activeTab === "english" ? formData.subheading : formData.subheadingArabic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ...(activeTab === "english"
                        ? { subheading: e.target.value }
                        : { subheadingArabic: e.target.value }),
                    })
                  }
                  className="h-11"
                  dir={activeTab === "arabic" ? "rtl" : "ltr"}
                  placeholder={activeTab === "english" ? "Enter subheading" : "أدخل العنوان الفرعي"}
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-burgundy" />
                    <h3 className="font-semibold text-slate-800">{uiText.description}</h3>
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
                          className="resize-none flex-1"
                          dir={activeTab === "arabic" ? "rtl" : "ltr"}
                          placeholder={
                            activeTab === "english"
                              ? `Paragraph ${idx + 1}`
                              : `الفقرة ${idx + 1}`
                          }
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
                  <h3 className="font-semibold text-slate-800">{uiText.images}</h3>
                </div>

                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <img
                            src={img}
                            alt={`Existing ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
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
                    <p className="text-sm text-slate-500">Click to upload or drag & drop additional images</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                </div>

                {newImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">New Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {newImagePreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
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
                <Button variant="outline" onClick={() => navigate("/csr")} className="gap-2">
                  <X className="h-4 w-4" />
                  {uiText.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : uiText.save}
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
