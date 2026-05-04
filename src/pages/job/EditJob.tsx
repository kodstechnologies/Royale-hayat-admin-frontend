import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import Loader from "@/components/SkeletonLoader";
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

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [jobResponse, departmentsResponse] = await Promise.all([
          api.get(`/api/v1/jobs/${id}`),
          getDepartments({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
        ]);
        const job = jobResponse?.data?.data || {};
        const departments = departmentsResponse?.data?.data || [];
        const names = (Array.isArray(departments) ? departments : [])
          .map((item: any) => item?.name)
          .filter(Boolean);
        setDepartmentOptions(
          names.includes(job?.department) ? names : [job?.department, ...names].filter(Boolean)
        );
        setInitialValues({
          jobId: job?.jobId || "",
          title: job?.title || "",
          description: job?.description || "",
          department: job?.department || "",
          location: job?.location || "",
          type: job?.type || "Full-time",
          classification: job?.classification || "",
          responsibilities: (job?.responsibilities || []).join(", "),
          requirements: (job?.requirements || []).join(", "),
          closingDate: job?.closingDate ? String(job.closingDate).slice(0, 10) : "",
          urgency: job?.urgency || "normal",
        });
      } catch {
        toast.error("Failed to load job.", { position: "top-right" });
        navigate("/job-applications");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id, navigate]);

  if (loading) {
    return (
      <AdminLayout title="Edit Job">
        <Loader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Job">
      <div className="max-w-4xl mx-auto">
        <button type="button" onClick={() => navigate("/job-applications")} className="mb-4 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted">
          Back to Job Applications
        </button>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            if (!id) return;
            const responsibilitiesList = values.responsibilities.split(",").map((item) => item.trim()).filter(Boolean);
            const requirementsList = values.requirements.split(",").map((item) => item.trim()).filter(Boolean);
            if (!responsibilitiesList.length || !requirementsList.length) {
              toast.error("Add at least one responsibility and one requirement.", { position: "top-right" });
              return;
            }
            setSaving(true);
            try {
              await api.put(`/api/v1/jobs/${id}`, {
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
              });
              toast.success("Job updated successfully.", { position: "top-right" });
              navigate("/job-applications");
            } catch (error: any) {
              toast.error(error?.response?.data?.message || "Failed to update job.", { position: "top-right" });
            } finally {
              setSaving(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="bg-card rounded-xl border border-border p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium block mb-1">Job ID *</label><Field name="jobId" value={values.jobId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue("jobId", e.target.value.toUpperCase())} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="jobId" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Title *</label><Field name="title" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="title" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div className="md:col-span-2"><label className="text-xs font-medium block mb-1">Description *</label><Field as="textarea" rows={4} name="description" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none" /><ErrorMessage name="description" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div>
                <label className="text-xs font-medium block mb-1">Department *</label>
                <Field as="select" name="department" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select department</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="department" component="p" className="text-xs text-red-500 mt-1" />
              </div>
              <div><label className="text-xs font-medium block mb-1">Location *</label><Field name="location" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="location" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Type *</label><Field as="select" name="type" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Contract">Contract</option></Field><ErrorMessage name="type" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Classification</label><Field name="classification" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="text-xs font-medium block mb-1">Responsibilities</label><Field name="responsibilities" placeholder="Comma separated values" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="responsibilities" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Requirements</label><Field name="requirements" placeholder="Comma separated values" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="requirements" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Closing Date *</label><Field type="date" name="closingDate" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="closingDate" component="p" className="text-xs text-red-500 mt-1" /></div>
              <div><label className="text-xs font-medium block mb-1">Urgency</label><Field as="select" name="urgency" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"><option value="normal">Normal</option><option value="urgent">Urgent</option><option value="immediate">Immediate</option></Field></div>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-burgundy text-white text-xs font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" onClick={() => navigate("/job-applications")} className="px-4 py-2 rounded-md border border-border text-xs font-medium">Cancel</button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AdminLayout>
  );
};

export default EditJobPage;

