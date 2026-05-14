import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, X } from "lucide-react";
import api from "@/api/axiosInstance";
import { getDepartments } from "@/api/department";

type JobForm = {
  jobId: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  classification: string;
  responsibilities: string;
  requirements: string;
  closingDate: string;
  urgency: "immediate" | "urgent" | "normal";
};

const validationSchema = Yup.object({
  jobId: Yup.string().trim().matches(/^JA-\d{3,}$/, "Format should be JA-001").required("Job ID is required"),
  title: Yup.string().trim().required("Title is required"),
  description: Yup.string().trim().required("Description is required"),
  department: Yup.string().trim().required("Department is required"),
  location: Yup.string().trim().required("Location is required"),
  type: Yup.string().required("Type is required"),
  classification: Yup.string(),
  responsibilities: Yup.string().trim().required("Responsibilities are required"),
  requirements: Yup.string().trim().required("Requirements are required"),
  closingDate: Yup.string().required("Closing date is required"),
  urgency: Yup.string().oneOf(["immediate", "urgent", "normal"]),
});

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<JobForm>({
    jobId: "",
    title: "",
    description: "",
    department: "",
    location: "",
    type: "Full-time",
    classification: "",
    responsibilities: "",
    requirements: "",
    closingDate: "",
    urgency: "normal",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartments({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" });
        const departments = response?.data?.data || [];
        const names = (Array.isArray(departments) ? departments : [])
          .map((item: any) => item?.name)
          .filter(Boolean);
        setDepartmentOptions(names);
      } catch {
        setDepartmentOptions([]);
      }
    };

    const generateJobId = async () => {
      setLoadingId(true);
      try {
        const response = await api.get("/api/v1/jobs", { params: { page: 1, limit: 100, sortBy: "postedDate", sortOrder: "desc" } });
        const jobs = response?.data?.data || [];
        const highest = (Array.isArray(jobs) ? jobs : []).reduce((max: number, job: any) => {
          const value = String(job?.jobId || "");
          const parsed = Number(value.replace("JA-", ""));
          return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
        }, 0);
        setInitialValues((prev) => ({ ...prev, jobId: `JA-${String(highest + 1).padStart(3, "0")}` }));
      } catch {
        setInitialValues((prev) => ({ ...prev, jobId: "JA-001" }));
      } finally {
        setLoadingId(false);
      }
    };
    fetchDepartments();
    generateJobId();
  }, []);

  return (
    <AdminLayout title="Create Job">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/job-applications")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Create Job Posting</h2>
                <p className="text-sm text-slate-500 mt-1">Fill in the details to create a new job opening</p>
              </div>
            </div>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                const responsibilitiesList = values.responsibilities.split(",").map((item) => item.trim()).filter(Boolean);
                const requirementsList = values.requirements.split(",").map((item) => item.trim()).filter(Boolean);
                if (!responsibilitiesList.length || !requirementsList.length) {
                  toast.error("Add at least one responsibility and one requirement.", { position: "top-right" });
                  return;
                }
                setSaving(true);
                try {
                  await api.post("/api/v1/jobs", {
                    jobId: values.jobId.trim().toUpperCase(),
                    title: values.title.trim(),
                    description: values.description.trim(),
                    department: values.department.trim(),
                    location: values.location.trim(),
                    type: values.type,
                    classification: values.classification.trim() || undefined,
                    responsibilities: responsibilitiesList,
                    requirements: requirementsList,
                    closingDate: values.closingDate,
                    urgency: values.urgency,
                    isActive: true,
                  });
                  toast.success("Job created successfully.", { position: "top-right" });
                  navigate("/job-applications");
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || "Failed to create job.", { position: "top-right" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Job ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="jobId"
                        value={values.jobId}
                        onChange={(e) => setFieldValue("jobId", e.target.value.toUpperCase())}
                        placeholder="e.g., JA-001"
                        className="h-11"
                      />
                      <ErrorMessage name="jobId" component="p" className="text-xs text-red-500" />
                      {loadingId && <p className="text-xs text-slate-500">Auto-generating...</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Title <span className="text-red-500">*</span>
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

                    <div className="md:col-span-2 space-y-2">
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

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={values.department}
                        onChange={(e) => setFieldValue("department", e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map((department) => (
                          <option key={department} value={department}>{department}</option>
                        ))}
                      </select>
                      <ErrorMessage name="department" component="p" className="text-xs text-red-500" />
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
                      <label className="text-sm font-semibold text-slate-700">Classification</label>
                      <Input
                        name="classification"
                        value={values.classification}
                        onChange={(e) => setFieldValue("classification", e.target.value)}
                        placeholder="e.g., Senior Level, Entry Level"
                        className="h-11"
                      />
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

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Urgency</label>
                      <select
                        value={values.urgency}
                        onChange={(e) => setFieldValue("urgency", e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="immediate">Immediate</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Responsibilities <span className="text-red-500">*</span>
                        <span className="text-xs text-slate-400 ml-2">(comma separated)</span>
                      </label>
                      <Textarea
                        name="responsibilities"
                        value={values.responsibilities}
                        onChange={(e) => setFieldValue("responsibilities", e.target.value)}
                        rows={3}
                        placeholder="e.g., Manage team operations, Develop strategies, Report to management"
                        className="resize-none"
                      />
                      <ErrorMessage name="responsibilities" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Requirements <span className="text-red-500">*</span>
                        <span className="text-xs text-slate-400 ml-2">(comma separated)</span>
                      </label>
                      <Textarea
                        name="requirements"
                        value={values.requirements}
                        onChange={(e) => setFieldValue("requirements", e.target.value)}
                        rows={3}
                        placeholder="e.g., Bachelor's degree, 5+ years experience, Strong leadership skills"
                        className="resize-none"
                      />
                      <ErrorMessage name="requirements" component="p" className="text-xs text-red-500" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate("/job-applications")} className="gap-2">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
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