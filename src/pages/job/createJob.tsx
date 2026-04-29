import { useState } from "react";
import api from "@/api/axiosInstance";

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

const initialForm = {
  jobId: "",
  title: "",
  description: "",
  department: "",
  location: "",
  type: "Full-time",
  responsibilities: "",
  requirements: "",
};

const CreateJobModal = ({ open, onClose }: CreateJobModalProps) => {
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [jobForm, setJobForm] = useState(initialForm);

  if (!open) return null;

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage("");

    if (!jobForm.title || !jobForm.description || !jobForm.department || !jobForm.location) {
      setCreateMessage("Please fill all required fields.");
      return;
    }

    const payload = {
      ...(jobForm.jobId.trim() ? { jobId: jobForm.jobId.trim() } : {}),
      title: jobForm.title.trim(),
      description: jobForm.description.trim(),
      department: jobForm.department.trim(),
      location: jobForm.location.trim(),
      type: jobForm.type,
      responsibilities: jobForm.responsibilities.split(",").map((item) => item.trim()).filter(Boolean),
      requirements: jobForm.requirements.split(",").map((item) => item.trim()).filter(Boolean),
      isActive: true,
    };

    if (!payload.responsibilities.length || !payload.requirements.length) {
      setCreateMessage("Please add at least one responsibility and one requirement.");
      return;
    }

    setCreateLoading(true);
    try {
      const response = await api.post("/api/v1/jobs", payload);
      const createdId = response?.data?.data?.jobId || "generated";
      setCreateMessage(`Job created successfully with ID: ${createdId}`);
      setJobForm(initialForm);
    } catch (error: any) {
      setCreateMessage(error?.response?.data?.message || "Failed to create job.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border p-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-serif font-semibold text-foreground">Create Job</h3>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted/20">
            Close
          </button>
        </div>

        <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Job ID (Editable)</label>
            <input
              value={jobForm.jobId}
              onChange={(e) => setJobForm((prev) => ({ ...prev, jobId: e.target.value.toUpperCase() }))}
              placeholder="JA-001"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-generate.</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
            <input
              value={jobForm.title}
              onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Department *</label>
            <input
              value={jobForm.department}
              onChange={(e) => setJobForm((prev) => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Location *</label>
            <input
              value={jobForm.location}
              onChange={(e) => setJobForm((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type *</label>
            <select
              value={jobForm.type}
              onChange={(e) => setJobForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
            <textarea
              value={jobForm.description}
              onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Responsibilities *</label>
            <input
              value={jobForm.responsibilities}
              onChange={(e) => setJobForm((prev) => ({ ...prev, responsibilities: e.target.value }))}
              placeholder="Comma separated"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Requirements *</label>
            <input
              value={jobForm.requirements}
              onChange={(e) => setJobForm((prev) => ({ ...prev, requirements: e.target.value }))}
              placeholder="Comma separated"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 text-xs rounded-md bg-burgundy text-white hover:bg-burgundy-deep disabled:opacity-50"
            >
              {createLoading ? "Creating..." : "Create Job"}
            </button>
            {createMessage && <span className="text-xs text-muted-foreground">{createMessage}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
