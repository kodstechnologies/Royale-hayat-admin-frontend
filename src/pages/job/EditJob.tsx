import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X, Globe, Languages, Trash2 } from "lucide-react";
import { getJobById, updateJob } from "@/api/job";

type JobForm = {
  jobId: string;
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
  jobId: Yup.string().trim().required("Job ID is required"),
  title: Yup.string().trim().required("English Title is required"),
  description: Yup.string().trim().required("English Description is required"),
  arabicTitle: Yup.string().trim().required("Arabic Title is required"),
  arabicDescription: Yup.string().trim().required("Arabic Description is required"),
  classification: Yup.string().trim().required("Classification is required"),
  location: Yup.string().trim().required("Location is required"),
  type: Yup.string().required("Type is required"),
  closingDate: Yup.string().required("Closing date is required"),
});

const formatClosingDate = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const mapApiJobToFormValues = (job: Record<string, unknown>): JobForm => ({
  jobId: String(job.jobId ?? ""),
  title: String(job.title ?? ""),
  description: String(job.description ?? ""),
  responsibilities: Array.isArray(job.responsibilities) && job.responsibilities.length
    ? (job.responsibilities as string[])
    : [""],
  requirements: Array.isArray(job.requirements) && job.requirements.length
    ? (job.requirements as string[])
    : [""],
  arabicTitle: String(job.arabicTitle ?? ""),
  arabicDescription: String(job.arabicDescription ?? ""),
  arabicResponsibilities:
    Array.isArray(job.arabicResponsibilities) && job.arabicResponsibilities.length
      ? (job.arabicResponsibilities as string[])
      : [""],
  arabicRequirements:
    Array.isArray(job.arabicRequirements) && job.arabicRequirements.length
      ? (job.arabicRequirements as string[])
      : [""],
  classification: String(job.classification ?? ""),
  location: String(job.location ?? ""),
  type: (job.type as JobForm["type"]) ?? "Full-time",
  closingDate: formatClosingDate(job.closingDate as string | Date | undefined),
});

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [initialValues, setInitialValues] = useState<JobForm>({
    jobId: "",
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
  });
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadJob = async () => {
      setLoading(true);
      try {
        const res = await getJobById(id);
        const apiJob = res.data?.data;
        if (apiJob) {
          setInitialValues(mapApiJobToFormValues(apiJob));
        } else {
          toast.error("Job not found.", { position: "top-right" });
          navigate("/job-posts");
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
          err?.response?.data?.message || "Failed to load job. Please try again.";
        toast.error(message, { position: "top-right" });
        navigate("/job-posts");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, navigate]);

  const addListItem = (setFieldValue: (field: string, value: any) => void, current: string[], fieldName: string) => {
    setFieldValue(fieldName, [...current, ""]);
  };

  const removeListItem = (setFieldValue: (field: string, value: any) => void, current: string[], index: number, fieldName: string) => {
    const newList = current.filter((_, i) => i !== index);
    setFieldValue(fieldName, newList.length ? newList : [""]);
  };

  const updateListItem = (setFieldValue: (field: string, value: any) => void, current: string[], index: number, value: string, fieldName: string) => {
    const newList = [...current];
    newList[index] = value;
    setFieldValue(fieldName, newList);
  };

  const handleSubmit = async (values: JobForm) => {
    if (!id) return;
    
    const responsibilitiesList = values.responsibilities.filter(r => r.trim());
    const requirementsList = values.requirements.filter(r => r.trim());
    const arabicResponsibilitiesList = values.arabicResponsibilities.filter(r => r.trim());
    const arabicRequirementsList = values.arabicRequirements.filter(r => r.trim());
    
    if (!responsibilitiesList.length || !requirementsList.length) {
      toast.error("Add at least one responsibility and one requirement in English.", { position: "top-right" });
      return;
    }
    if (!arabicResponsibilitiesList.length || !arabicRequirementsList.length) {
      toast.error("Add at least one responsibility and one requirement in Arabic.", { position: "top-right" });
      return;
    }
    
    setSaving(true);
    try {
      await updateJob(id, {
        title: values.title.trim(),
        description: values.description.trim(),
        classification: values.classification.trim(),
        location: values.location.trim(),
        type: values.type,
        responsibilities: responsibilitiesList,
        requirements: requirementsList,
        arabicTitle: values.arabicTitle.trim(),
        arabicDescription: values.arabicDescription.trim(),
        arabicResponsibilities: arabicResponsibilitiesList,
        arabicRequirements: arabicRequirementsList,
        closingDate: values.closingDate,
      });

      toast.success("Job updated successfully!", { position: "top-right" });
      navigate("/job-posts");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message || "Failed to update job. Please try again.";
      toast.error(message, { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Job">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Job">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate(`/jobs/view/${id}`)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                aria-label="Back to job"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Edit Job Posting</h2>
                <p className="text-sm text-slate-500 mt-1">Update the job details</p>
              </div>
            </div>

            
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
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                  
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Job ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="jobId"
                        value={values.jobId}
                        readOnly
                        className="h-11 bg-slate-100"
                      />
                      <ErrorMessage name="jobId" component="p" className="text-xs text-red-500" />
                    </div>
                  </div>

                  
                  {activeTab === "english" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information (English)</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="title"
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
                            name="description"
                            value={values.description}
                            onChange={(e) => setFieldValue("description", e.target.value)}
                            rows={4}
                            placeholder="Enter job description"
                            className="resize-none"
                          />
                          <ErrorMessage name="description" component="p" className="text-xs text-red-500" />
                        </div>

                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Responsibilities <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addListItem(setFieldValue, values.responsibilities, "responsibilities")}
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
                                  onChange={(e) => updateListItem(setFieldValue, values.responsibilities, idx, e.target.value, "responsibilities")}
                                  placeholder={`Responsibility ${idx + 1}`}
                                  className="flex-1 h-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeListItem(setFieldValue, values.responsibilities, idx, "responsibilities")}
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Requirements <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addListItem(setFieldValue, values.requirements, "requirements")}
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
                                  onChange={(e) => updateListItem(setFieldValue, values.requirements, idx, e.target.value, "requirements")}
                                  placeholder={`Requirement ${idx + 1}`}
                                  className="flex-1 h-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeListItem(setFieldValue, values.requirements, idx, "requirements")}
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

                  
                  {activeTab === "arabic" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Languages className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information (Arabic)</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Job Title (Arabic) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="arabicTitle"
                            value={values.arabicTitle}
                            onChange={(e) => setFieldValue("arabicTitle", e.target.value)}
                            placeholder="عنوان الوظيفة"
                            className="h-11"
                            dir="rtl"
                          />
                          <ErrorMessage name="arabicTitle" component="p" className="text-xs text-red-500" />
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
                            placeholder="وصف الوظيفة"
                            className="resize-none"
                            dir="rtl"
                          />
                          <ErrorMessage name="arabicDescription" component="p" className="text-xs text-red-500" />
                        </div>

                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Responsibilities (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addListItem(setFieldValue, values.arabicResponsibilities, "arabicResponsibilities")}
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
                                  onChange={(e) => updateListItem(setFieldValue, values.arabicResponsibilities, idx, e.target.value, "arabicResponsibilities")}
                                  placeholder={`مسؤولية ${idx + 1}`}
                                  className="flex-1 h-10"
                                  dir="rtl"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeListItem(setFieldValue, values.arabicResponsibilities, idx, "arabicResponsibilities")}
                                  className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">
                              Requirements (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addListItem(setFieldValue, values.arabicRequirements, "arabicRequirements")}
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
                                  onChange={(e) => updateListItem(setFieldValue, values.arabicRequirements, idx, e.target.value, "arabicRequirements")}
                                  placeholder={`متطلب ${idx + 1}`}
                                  className="flex-1 h-10"
                                  dir="rtl"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeListItem(setFieldValue, values.arabicRequirements, idx, "arabicRequirements")}
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

                  
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Classification <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={values.classification}
                          onChange={(e) => setFieldValue("classification", e.target.value)}
                          placeholder="Enter classification"
                          className="h-11"
                        />
                        <ErrorMessage name="classification" component="p" className="text-xs text-red-500" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <Input
                          name="location"
                          value={values.location}
                          onChange={(e) => setFieldValue("location", e.target.value)}
                          placeholder="Enter location"
                          className="h-11"
                        />
                        <ErrorMessage name="location" component="p" className="text-xs text-red-500" />
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
                          name="closingDate"
                          value={values.closingDate}
                          onChange={(e) => setFieldValue("closingDate", e.target.value)}
                          className="h-11"
                        />
                        <ErrorMessage name="closingDate" component="p" className="text-xs text-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate(`/jobs/view/${id}`)} className="gap-2 w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90">
                      {saving ? "Saving..." : "Save Changes"}
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

export default EditJobPage;