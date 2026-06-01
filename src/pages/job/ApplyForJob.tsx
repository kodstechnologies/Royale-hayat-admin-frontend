import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Tag,
  Upload,
  FileText,
  X,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { getJobById as getJobByIdApi, applyForJob } from "@/api/job";
import { adminJobs } from "@/data/adminJobs";

type JobSummary = {
  _id: string;
  jobId: string;
  title: string;
  classification: string;
  location: string;
  type: string;
};

type ApplicationForm = {
  fullName: string;
  email: string;
  phone: string;
  tellusUrself: string;
};

const validationSchema = Yup.object({
  fullName: Yup.string().trim().min(2, "Name must be at least 2 characters").max(100).required("Full name is required"),
  email: Yup.string().email("Enter a valid email").max(100).required("Email is required"),
  phone: Yup.string().trim().max(20).optional(),
  tellusUrself: Yup.string().trim().max(1000).optional(),
});

const initialValues: ApplicationForm = {
  fullName: "",
  email: "",
  phone: "",
  tellusUrself: "",
};

const ApplyForJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobSummary | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setJobLoading(true);
      try {
        const res = await getJobByIdApi(id);
        const data = res.data?.data;
        if (data) {
          setJob({
            _id: data._id,
            jobId: data.jobId ?? "",
            title: data.title,
            classification: data.classification,
            location: data.location,
            type: data.type,
          });
          return;
        }
      } catch {
      }

      const dummy = adminJobs.find((j) => j.id === id);
      if (dummy) {
        setJob({
          _id: dummy.id,
          jobId: dummy.jobId,
          title: dummy.title,
          classification: dummy.category,
          location: dummy.location,
          type: dummy.type,
        });
      }

      setJobLoading(false);
    };

    load().finally(() => setJobLoading(false));
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setResumeError("Only PDF or Word documents are accepted.");
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File size must be under 5 MB.");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    setResumeError("");
  };

  const removeFile = () => {
    setResumeFile(null);
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (
    values: ApplicationForm,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    if (!resumeFile) {
      setResumeError("Resume is required.");
      setSubmitting(false);
      return;
    }
    if (!job) return;

    const formData = new FormData();
    formData.append("jobId", job._id);
    formData.append("fullName", values.fullName.trim());
    formData.append("email", values.email.trim());
    if (values.phone) formData.append("phone", values.phone.trim());
    if (values.tellusUrself) formData.append("tellusUrself", values.tellusUrself.trim());
    formData.append("resume", resumeFile);

    try {
      await applyForJob(formData);
      toast.success("Application submitted successfully!");
      navigate(`/jobs/view-applications/${job._id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to submit application. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <AdminLayout title="Apply for Job">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-burgundy/30 border-t-burgundy rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500">Loading job details...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!job) {
    return (
      <AdminLayout title="Apply for Job">
        <div className="space-y-6">
          <BreadCrumb />
          <div className="rounded-xl border-2 border-burgundy/30 bg-white shadow-xl p-12 text-center">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Job not found</p>
            <Button onClick={() => navigate("/job-posts")} variant="outline" className="mt-4">
              Back to Jobs
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Apply for Job">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(`/jobs/view/${job._id}`)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Apply for Job</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Submit your application for this position
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-6">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-6 w-6 text-burgundy" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 leading-snug">{job.title}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{job.jobId}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600">Department:</span>
                      <span className="font-medium text-slate-800">{job.classification}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600">Location:</span>
                      <span className="font-medium text-slate-800">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-600">Type:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-burgundy/10 text-burgundy">
                        {job.type}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2 text-sm"
                      onClick={() => navigate(`/jobs/view/${job._id}`)}
                    >
                      View Full Job Details
                    </Button>
                  </div>
                </div>
              </div>

              
              <div className="lg:col-span-2">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-5">
                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <User className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">
                            Personal Information
                          </h3>
                        </div>

                        
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              value={values.fullName}
                              onChange={(e) => setFieldValue("fullName", e.target.value)}
                              placeholder="Enter your full name"
                              className="h-11 pl-9"
                            />
                          </div>
                          <ErrorMessage
                            name="fullName"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>

                        
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              value={values.email}
                              onChange={(e) => setFieldValue("email", e.target.value)}
                              placeholder="you@example.com"
                              className="h-11 pl-9"
                            />
                          </div>
                          <ErrorMessage
                            name="email"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>

                        
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="tel"
                              value={values.phone}
                              onChange={(e) => setFieldValue("phone", e.target.value)}
                              placeholder="+965 XXXX XXXX"
                              className="h-11 pl-9"
                            />
                          </div>
                          <ErrorMessage
                            name="phone"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <FileText className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">
                            Resume / CV <span className="text-red-500">*</span>
                          </h3>
                        </div>

                        {resumeFile ? (
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-burgundy" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                                  {resumeFile.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {(resumeFile.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-burgundy/40 hover:bg-burgundy/5 transition-all duration-200 group"
                          >
                            <Upload className="h-8 w-8 text-slate-300 group-hover:text-burgundy/50 mx-auto mb-3 transition-colors" />
                            <p className="text-sm font-medium text-slate-600">
                              Click to upload your resume
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              PDF or Word document, max 5 MB
                            </p>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {resumeError && (
                          <p className="text-xs text-red-500">{resumeError}</p>
                        )}
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Mail className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">
                            Tell Us About Yourself
                          </h3>
                          <span className="text-xs text-slate-400 ml-auto">Optional</span>
                        </div>

                        <div className="space-y-1.5">
                          <Textarea
                            value={values.tellusUrself}
                            onChange={(e) => setFieldValue("tellusUrself", e.target.value)}
                            rows={5}
                            placeholder="Briefly describe your experience, skills, and why you're a great fit for this role..."
                            className="resize-none"
                            maxLength={1000}
                          />
                          <p className="text-xs text-slate-400 text-right">
                            {values.tellusUrself.length}/1000
                          </p>
                          <ErrorMessage
                            name="tellusUrself"
                            component="p"
                            className="text-xs text-red-500"
                          />
                        </div>
                      </div>

                      
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/jobs/view/${job._id}`)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2 bg-burgundy hover:bg-burgundy/90 min-w-[140px]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Submit Application
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ApplyForJob;
