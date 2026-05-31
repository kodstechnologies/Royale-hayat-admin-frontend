import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Globe, Languages, Trash2 } from "lucide-react";
import { createJob } from "@/api/job";

type JobForm = {
  // English fields
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  arabicTitle: string;
  arabicDescription: string;
  arabicResponsibilities: string[];
  arabicRequirements: string[];
  classification: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  closingDate: string;
};

const validationSchema = Yup.object({
  title: Yup.string().trim().required("English Title is required"),
  description: Yup.string().trim().required("English Description is required"),
  arabicTitle: Yup.string().trim().required("Arabic Title is required"),
  arabicDescription: Yup.string().trim().required("Arabic Description is required"),
  classification: Yup.string().trim().required("Classification is required"),
  location: Yup.string().trim().required("Location is required"),
  type: Yup.string().required("Type is required"),
  closingDate: Yup.string().required("Closing date is required"),
});

const classificationOptions = [
  "Clinical Speciality",
  "Clinical Support Service",
  "Home Care Service",
  "Administration",
  "Nursing",
  "Allied Health",
  "La Cosmetique Royale",
  "Hospitality/Guest Services",
  "Quality and Patient Safety",
  "Royale Home Health",
  "Specialist Doctors",
  "Marketing and Communication",
  "Surgical Services",
];

const initialValues: JobForm = {
  title: "",
  description: "",
  responsibilities: [""],
  requirements: [""],
  arabicTitle: "",
  arabicDescription: "",
  arabicResponsibilities: [""],
  arabicRequirements: [""],
  classification: "",
  location: "",
  type: "Full-time",
  closingDate: "",
};

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");

  const addListItem = (
    setFieldValue: (field: string, value: string[]) => void,
    current: string[],
    fieldName: string
  ) => {
    setFieldValue(fieldName, [...current, ""]);
  };

  const removeListItem = (
    setFieldValue: (field: string, value: string[]) => void,
    current: string[],
    index: number,
    fieldName: string
  ) => {
    const updated = current.filter((_, i) => i !== index);
    setFieldValue(fieldName, updated.length ? updated : [""]);
  };

  const updateListItem = (
    setFieldValue: (field: string, value: string[]) => void,
    current: string[],
    index: number,
    value: string,
    fieldName: string
  ) => {
    const updated = [...current];
    updated[index] = value;
    setFieldValue(fieldName, updated);
  };

  const handleSubmit = async (values: JobForm) => {
    const responsibilities = values.responsibilities.filter((r) => r.trim());
    const requirements = values.requirements.filter((r) => r.trim());
    const arabicResponsibilities = values.arabicResponsibilities.filter((r) => r.trim());
    const arabicRequirements = values.arabicRequirements.filter((r) => r.trim());

    if (!responsibilities.length || !requirements.length) {
      toast.error("Add at least one responsibility and one requirement in English.");
      return;
    }
    if (!arabicResponsibilities.length || !arabicRequirements.length) {
      toast.error("Add at least one responsibility and one requirement in Arabic.");
      return;
    }

    setSaving(true);
    try {
      await createJob({
        title: values.title.trim(),
        description: values.description.trim(),
        classification: values.classification.trim(),
        location: values.location.trim(),
        type: values.type,
        responsibilities,
        requirements,
        closingDate: values.closingDate,
      });

      toast.success("Job created successfully!");
      navigate("/job-posts");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to create job. Please try again.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Create Job">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate("/job-posts")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                aria-label="Back to jobs"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Create Job Posting</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Fill in the details to create a new job opening
                </p>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-4 p-1 bg-slate-100/80 rounded-xl w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">

                  {/* ENGLISH TAB */}
                  {activeTab === "english" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">
                            Basic Information (English)
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={values.title}
                            onChange={(e) => setFieldValue("title", e.target.value)}
                            placeholder="Enter job title"
                            className="h-11"
                          />
                          <ErrorMessage name="title" component="p" className="text-xs text-red-500" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={values.description}
                            onChange={(e) => setFieldValue("description", e.target.value)}
                            rows={4}
                            placeholder="Enter job description"
                            className="resize-none"
                          />
                          <ErrorMessage
                            name="description"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>

                        {/* Responsibilities */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Responsibilities <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addListItem(setFieldValue, values.responsibilities, "responsibilities")
                              }
                              className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                            >
                              <Plus className="h-3 w-3" />
                              Add Responsibility
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {values.responsibilities.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) =>
                                    updateListItem(
                                      setFieldValue,
                                      values.responsibilities,
                                      idx,
                                      e.target.value,
                                      "responsibilities"
                                    )
                                  }
                                  placeholder={`Responsibility ${idx + 1}`}
                                  className="flex-1 h-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeListItem(
                                      setFieldValue,
                                      values.responsibilities,
                                      idx,
                                      "responsibilities"
                                    )
                                  }
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Requirements <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addListItem(setFieldValue, values.requirements, "requirements")
                              }
                              className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                            >
                              <Plus className="h-3 w-3" />
                              Add Requirement
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {values.requirements.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) =>
                                    updateListItem(
                                      setFieldValue,
                                      values.requirements,
                                      idx,
                                      e.target.value,
                                      "requirements"
                                    )
                                  }
                                  placeholder={`Requirement ${idx + 1}`}
                                  className="flex-1 h-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeListItem(
                                      setFieldValue,
                                      values.requirements,
                                      idx,
                                      "requirements"
                                    )
                                  }
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ARABIC TAB */}
                  {activeTab === "arabic" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Languages className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">
                            Basic Information (Arabic)
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Job Title (Arabic) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={values.arabicTitle}
                            onChange={(e) => setFieldValue("arabicTitle", e.target.value)}
                            placeholder="عنوان الوظيفة"
                            className="h-11"
                            dir="rtl"
                          />
                          <ErrorMessage
                            name="arabicTitle"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Description (Arabic) <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            value={values.arabicDescription}
                            onChange={(e) => setFieldValue("arabicDescription", e.target.value)}
                            rows={4}
                            placeholder="وصف الوظيفة"
                            className="resize-none"
                            dir="rtl"
                          />
                          <ErrorMessage
                            name="arabicDescription"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>

                        {/* Arabic Responsibilities */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Responsibilities (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addListItem(
                                  setFieldValue,
                                  values.arabicResponsibilities,
                                  "arabicResponsibilities"
                                )
                              }
                              className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                            >
                              <Plus className="h-3 w-3" />
                              أضف مسؤولية
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {values.arabicResponsibilities.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) =>
                                    updateListItem(
                                      setFieldValue,
                                      values.arabicResponsibilities,
                                      idx,
                                      e.target.value,
                                      "arabicResponsibilities"
                                    )
                                  }
                                  placeholder={`مسؤولية ${idx + 1}`}
                                  className="flex-1 h-10"
                                  dir="rtl"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeListItem(
                                      setFieldValue,
                                      values.arabicResponsibilities,
                                      idx,
                                      "arabicResponsibilities"
                                    )
                                  }
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Arabic Requirements */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Requirements (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addListItem(
                                  setFieldValue,
                                  values.arabicRequirements,
                                  "arabicRequirements"
                                )
                              }
                              className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                            >
                              <Plus className="h-3 w-3" />
                              أضف متطلباً
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {values.arabicRequirements.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={(e) =>
                                    updateListItem(
                                      setFieldValue,
                                      values.arabicRequirements,
                                      idx,
                                      e.target.value,
                                      "arabicRequirements"
                                    )
                                  }
                                  placeholder={`متطلب ${idx + 1}`}
                                  className="flex-1 h-10"
                                  dir="rtl"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeListItem(
                                      setFieldValue,
                                      values.arabicRequirements,
                                      idx,
                                      "arabicRequirements"
                                    )
                                  }
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Classification <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={values.classification}
                          onChange={(e) => setFieldValue("classification", e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        >
                          <option value="">Select classification</option>
                          {classificationOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <ErrorMessage
                          name="classification"
                          component="p"
                          className="text-xs text-red-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={values.location}
                          onChange={(e) => setFieldValue("location", e.target.value)}
                          placeholder="Enter location"
                          className="h-11"
                        />
                        <ErrorMessage
                          name="location"
                          component="p"
                          className="text-xs text-red-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={values.type}
                          onChange={(e) => setFieldValue("type", e.target.value)}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                        <ErrorMessage name="type" component="p" className="text-xs text-red-500" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Closing Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={values.closingDate}
                          onChange={(e) => setFieldValue("closingDate", e.target.value)}
                          className="h-11"
                        />
                        <ErrorMessage
                          name="closingDate"
                          component="p"
                          className="text-xs text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/job-posts")}
                      className="gap-2 w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90"
                    >
                      {saving ? "Creating..." : "Create Job"}
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

export default CreateJobPage;
