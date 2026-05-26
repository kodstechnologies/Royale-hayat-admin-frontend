// pages/departments/CreateDepartment.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X, Plus, Trash2, Globe, Languages } from "lucide-react";

export type CreateDepartmentFormData = {
  // English fields
  departmentId: string;
  name: string;
  description: string;
  // Arabic fields
  arabicName: string;
  arabicDescription: string;
  catagoryId: string;
  imageFile: File | null;
  isActive: boolean;
  order: number;
  customExplainantions: {
    id?: string;
    subHeading: string;
    explaination: string[];
    arabicSubHeading: string;
    arabicExplaination: string[];
  }[];
};

const initialValues: CreateDepartmentFormData = {
  departmentId: "",
  name: "",
  description: "",
  arabicName: "",
  arabicDescription: "",
  catagoryId: "",
  imageFile: null,
  isActive: true,
  order: 0,
  customExplainantions: [],
};

// Dummy data for categories with Arabic names for display
const dummyCategories = [
  { _id: "cat1", name: "Cardiology", arabicName: "أمراض القلب" },
  { _id: "cat2", name: "Neurology", arabicName: "الأعصاب" },
  { _id: "cat3", name: "Pediatrics", arabicName: "طب الأطفال" },
  { _id: "cat4", name: "Orthopedics", arabicName: "جراحة العظام" },
  { _id: "cat5", name: "Dermatology", arabicName: "الأمراض الجلدية" },
];

const CreateDepartmentPage = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [categories] = useState(dummyCategories);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, setFieldValue: (field: string, value: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setFieldValue("imageFile", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Please upload an image file");
    }
  };

  const addCustomSection = (setFieldValue: (field: string, value: any) => void, current: any[]) => {
    setFieldValue("customExplainantions", [
      ...current,
      {
        id: Date.now().toString(),
        subHeading: "",
        explaination: [""],
        arabicSubHeading: "",
        arabicExplaination: [""],
      },
    ]);
  };

  const removeCustomSection = (setFieldValue: (field: string, value: any) => void, current: any[], index: number) => {
    const newSections = current.filter((_, i) => i !== index);
    setFieldValue("customExplainantions", newSections);
  };

  const addExplanationLine = (
    setFieldValue: (field: string, value: any) => void,
    current: any[],
    sectionIndex: number,
    isArabic: boolean
  ) => {
    const newSections = [...current];
    if (isArabic) {
      newSections[sectionIndex].arabicExplaination.push("");
    } else {
      newSections[sectionIndex].explaination.push("");
    }
    setFieldValue("customExplainantions", newSections);
  };

  const removeExplanationLine = (
    setFieldValue: (field: string, value: any) => void,
    current: any[],
    sectionIndex: number,
    lineIndex: number,
    isArabic: boolean
  ) => {
    const newSections = [...current];
    if (isArabic) {
      newSections[sectionIndex].arabicExplaination = newSections[sectionIndex].arabicExplaination.filter(
        (_: string, i: number) => i !== lineIndex
      );
    } else {
      newSections[sectionIndex].explaination = newSections[sectionIndex].explaination.filter(
        (_: string, i: number) => i !== lineIndex
      );
    }
    setFieldValue("customExplainantions", newSections);
  };

  const handleSubmit = async (values: CreateDepartmentFormData) => {
    const departmentId = values.departmentId.trim();
    const name = values.name.trim();
    const description = values.description.trim();
    const arabicName = values.arabicName.trim();
    const arabicDescription = values.arabicDescription.trim();

    if (!departmentId || !name || !description) {
      toast.error("Please provide Department ID, English Name, and English Description.");
      return;
    }

    if (!arabicName || !arabicDescription) {
      toast.error("Please provide Arabic Name and Arabic Description.");
      return;
    }

    if (!values.catagoryId) {
      toast.error("Please select a category.");
      return;
    }

    setSaving(true);

    // Get category name from ID for display
    const selectedCategory = categories.find(c => c._id === values.catagoryId);
    const categoryName = selectedCategory ? selectedCategory.name : "General";

    // Prepare new department
    const newDepartment = {
      _id: Date.now().toString(),
      departmentId,
      name,
      description,
      arabicName,
      arabicDescription,
      catagoryId: values.catagoryId,
      category: categoryName,
      image: previewUrl || null,
      isActive: values.isActive,
      order: values.order || 0,
      customExplainantions: values.customExplainantions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingDepts = localStorage.getItem("rhh_departments");
    let departments = existingDepts ? JSON.parse(existingDepts) : [];
    departments = [newDepartment, ...departments];
    localStorage.setItem("rhh_departments", JSON.stringify(departments));

    // Dispatch event to notify Departments list page
    window.dispatchEvent(new Event("departmentsUpdated"));

    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Department created:", newDepartment);
      toast.success("Department created successfully.");
      setSaving(false);
      navigate("/departments");
    }, 500);
  };

  // Get display name for category based on active tab
  const getCategoryDisplayName = (category: typeof dummyCategories[0]) => {
    return activeTab === "arabic" ? category.arabicName : category.name;
  };

  return (
    <AdminLayout title="Create Department">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/departments")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Create Department</h2>
                <p className="text-sm text-slate-500 mt-1">Fill in the details to create a new department</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex gap-4 p-1 bg-slate-100/80 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === "english"
                      ? "bg-white text-burgundy shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                  `}
                >
                  <Globe className="h-4 w-4" />
                  English Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("arabic")}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === "arabic"
                      ? "bg-white text-burgundy shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                  `}
                >
                  <Languages className="h-4 w-4" />
                  Arabic Content
                </button>
              </div>
            </div>

            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
              {({ setFieldValue, values, touched, errors }) => (
                <Form className="space-y-6">
                  {/* Department ID - Common for both tabs */}
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Department ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="departmentId"
                        value={values.departmentId}
                        onChange={(e) => setFieldValue("departmentId", e.target.value)}
                        placeholder="Enter department ID"
                        className="h-11"
                      />
                      <ErrorMessage name="departmentId" component="p" className="text-xs text-red-500" />
                    </div>
                  </div>

                  {/* ENGLISH TAB */}
                  {activeTab === "english" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information</h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Department Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="name"
                            value={values.name}
                            onChange={(e) => setFieldValue("name", e.target.value)}
                            placeholder="Enter department name"
                            className="h-11"
                          />
                          <ErrorMessage name="name" component="p" className="text-xs text-red-500" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            name="description"
                            value={values.description}
                            onChange={(e) => setFieldValue("description", e.target.value)}
                            rows={4}
                            placeholder="Enter department description"
                            className="resize-none"
                          />
                          <ErrorMessage name="description" component="p" className="text-xs text-red-500" />
                        </div>
                      </div>

                      {/* Custom Sections */}
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <h3 className="text-md font-semibold text-slate-800">Custom Sections</h3>
                            <p className="text-xs text-slate-500">Add headings and explanations</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomSection(setFieldValue, values.customExplainantions)}
                            className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                          >
                            <Plus className="h-3 w-3" />
                            Add Section
                          </Button>
                        </div>

                        {values.customExplainantions.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-sm">
                            No custom sections added. Click "Add Section" to get started.
                          </div>
                        ) : (
                          values.customExplainantions.map((section, idx) => (
                            <div key={section.id || idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30 relative">
                              <div className="absolute -top-2 -left-2 bg-burgundy/10 text-burgundy text-xs px-2 py-0.5 rounded-full">
                                Section {idx + 1}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCustomSection(setFieldValue, values.customExplainantions, idx)}
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">Heading</label>
                                <Input
                                  value={section.subHeading}
                                  onChange={(e) => {
                                    const newSections = [...values.customExplainantions];
                                    newSections[idx].subHeading = e.target.value;
                                    setFieldValue("customExplainantions", newSections);
                                  }}
                                  placeholder="Enter heading"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">Explanations</label>
                                {section.explaination.map((line, lineIdx) => (
                                  <div key={lineIdx} className="flex gap-2 mb-2">
                                    <Input
                                      value={line}
                                      onChange={(e) => {
                                        const newSections = [...values.customExplainantions];
                                        newSections[idx].explaination[lineIdx] = e.target.value;
                                        setFieldValue("customExplainantions", newSections);
                                      }}
                                      placeholder={`Explanation ${lineIdx + 1}`}
                                      className="flex-1 h-9"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeExplanationLine(setFieldValue, values.customExplainantions, idx, lineIdx, false)}
                                      className="h-9 w-9 text-red-500 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addExplanationLine(setFieldValue, values.customExplainantions, idx, false)}
                                  className="mt-1 gap-1 text-xs"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Explanation
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ARABIC TAB */}
                  {activeTab === "arabic" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Languages className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information (Arabic)</h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Name (Arabic) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="arabicName"
                            value={values.arabicName}
                            onChange={(e) => setFieldValue("arabicName", e.target.value)}
                            placeholder="Enter department name in Arabic"
                            className="h-11"
                            dir="rtl"
                          />
                          <ErrorMessage name="arabicName" component="p" className="text-xs text-red-500" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Description (Arabic) <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            name="arabicDescription"
                            value={values.arabicDescription}
                            onChange={(e) => setFieldValue("arabicDescription", e.target.value)}
                            rows={4}
                            placeholder="Enter department description in Arabic"
                            className="resize-none"
                            dir="rtl"
                          />
                          <ErrorMessage name="arabicDescription" component="p" className="text-xs text-red-500" />
                        </div>
                      </div>

                      {/* Arabic Custom Sections */}
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <h3 className="text-md font-semibold text-slate-800">Custom Sections (Arabic)</h3>
                            <p className="text-xs text-slate-500">Add headings and explanations in Arabic</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomSection(setFieldValue, values.customExplainantions)}
                            className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                          >
                            <Plus className="h-3 w-3" />
                            Add Section
                          </Button>
                        </div>

                        {values.customExplainantions.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-sm">
                            No custom sections added. Click "Add Section" to get started.
                          </div>
                        ) : (
                          values.customExplainantions.map((section, idx) => (
                            <div key={section.id || idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30 relative">
                              <div className="absolute -top-2 -left-2 bg-burgundy/10 text-burgundy text-xs px-2 py-0.5 rounded-full">
                                القسم {idx + 1}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCustomSection(setFieldValue, values.customExplainantions, idx)}
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">Heading (Arabic)</label>
                                <Input
                                  value={section.arabicSubHeading}
                                  onChange={(e) => {
                                    const newSections = [...values.customExplainantions];
                                    newSections[idx].arabicSubHeading = e.target.value;
                                    setFieldValue("customExplainantions", newSections);
                                  }}
                                  placeholder="Enter heading in Arabic"
                                  className="h-9"
                                  dir="rtl"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">Explanations (Arabic)</label>
                                {section.arabicExplaination.map((line, lineIdx) => (
                                  <div key={lineIdx} className="flex gap-2 mb-2">
                                    <Input
                                      value={line}
                                      onChange={(e) => {
                                        const newSections = [...values.customExplainantions];
                                        newSections[idx].arabicExplaination[lineIdx] = e.target.value;
                                        setFieldValue("customExplainantions", newSections);
                                      }}
                                      placeholder={`Explanation ${lineIdx + 1} in Arabic`}
                                      className="flex-1 h-9"
                                      dir="rtl"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeExplanationLine(setFieldValue, values.customExplainantions, idx, lineIdx, true)}
                                      className="h-9 w-9 text-red-500 hover:text-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addExplanationLine(setFieldValue, values.customExplainantions, idx, true)}
                                  className="mt-1 gap-1 text-xs"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Explanation
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Common Fields - Category, Status, Image */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={values.catagoryId}
                          onChange={(e) => setFieldValue("catagoryId", e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        >
                          <option value="">Select a category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {getCategoryDisplayName(c)}
                            </option>
                          ))}
                        </select>
                        <ErrorMessage name="catagoryId" component="p" className="text-xs text-red-500" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Status</label>
                        <label className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            checked={values.isActive}
                            onChange={(e) => setFieldValue("isActive", e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-burgundy focus:ring-burgundy"
                          />
                          <span className="text-sm text-slate-600">Active</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Image (optional)</label>
                      <div
                        className={`relative rounded-xl border-2 border-dashed transition-all ${dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-200 bg-slate-50/30"
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, setFieldValue)}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.currentTarget.files?.[0] || null;
                            if (file) {
                              setFieldValue("imageFile", file);
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          {previewUrl ? (
                            <div className="relative">
                              <img src={previewUrl} alt="Preview" className="max-h-40 w-auto mx-auto rounded-lg object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewUrl("");
                                  setFieldValue("imageFile", null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-500 mb-1">Click to upload or drag & drop</p>
                              <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate("/departments")} className="gap-2">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
                      {saving ? "Creating..." : "Create Department"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateDepartmentPage;