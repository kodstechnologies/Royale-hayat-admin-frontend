import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, Download, ChevronLeft } from "lucide-react";
import CreateJobModal from "./createJob";
import api from "@/api/axiosInstance";

const JobApplications = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openCreateJobModal, setOpenCreateJobModal] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/v1/job-applications");
        setApplications(response?.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load job applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const selected = applications.find((a) => a._id === selectedId);

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      new: "bg-info/10 text-info", shortlisted: "bg-warning/10 text-warning",
      interview: "bg-burgundy/10 text-burgundy", hired: "bg-success/10 text-success"
    };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[s] || "bg-muted/10 text-muted-foreground"}`}>{t(s.charAt(0).toUpperCase() + s.slice(1))}</span>;
  };

  // Individual candidate page
  if (selected) {
    return (
      <AdminLayout title="Job Applications">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          <ChevronLeft size={14} /> {t("Back")}
        </button>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center">
                <span className="text-burgundy font-serif font-bold text-xl">{selected.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">{selected.fullName}</h2>
                <p className="text-sm font-sans text-muted-foreground">{selected.jobId?.title || "N/A"} · {selected.jobId?.department || "N/A"}</p>
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(selected.status)}
                  <span className="text-xs font-sans text-muted-foreground">{t("Applied")}: {selected.appliedDate?.slice(0, 10)}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep">
              <Download size={12} /> {t("Download CV")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3">{t("Personal Details")}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                [t("Name"), selected.fullName], [t("Email"), selected.email],
                [t("Phone"), selected.phone || "N/A"], [t("Status"), selected.status],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-sans text-muted-foreground">{label}</p>
                  <p className="text-xs font-sans font-medium text-foreground">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3">{t("Professional Details")}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                [t("Position"), selected.jobId?.title || "N/A"], [t("Department"), selected.jobId?.department || "N/A"],
                [t("Location"), selected.jobId?.location || "N/A"], [t("Type"), selected.jobId?.type || "N/A"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-sans text-muted-foreground">{label}</p>
                  <p className="text-xs font-sans font-medium text-foreground">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-4">
          <h3 className="text-sm font-serif font-semibold text-foreground mb-2">{t("Cover Letter")}</h3>
          <p className="text-sm font-sans text-muted-foreground">{selected.tellusUrself || "N/A"}</p>
        </div>

        <div className="flex gap-2">
          {selected.status === "new" && (
            <button className="px-4 py-1.5 text-xs bg-success/10 text-success rounded-lg hover:bg-success/20">{t("Shortlist")}</button>
          )}
          {selected.status === "shortlisted" && (
            <button className="px-4 py-1.5 text-xs bg-burgundy/10 text-burgundy rounded-lg hover:bg-burgundy/20">{t("Schedule Interview")}</button>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Job Applications">
      {/* <p className="text-xs text-muted-foreground mb-4">{t("Applications received from the Work With Us section of the website.")}</p> */}

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setOpenCreateJobModal(true)}
          className="px-4 py-2 text-xs rounded-md bg-burgundy text-white hover:bg-burgundy-deep"
        >
          {t("Create Job")}
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading && <p className="p-4 text-sm text-muted-foreground">{t("Loading...")}</p>}
        {error && <p className="p-4 text-sm text-error">{error}</p>}
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground text-[11px] uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">{t("ID")}</th>
              <th className="text-left px-4 py-2.5">{t("Applicant")}</th>
              <th className="text-left px-4 py-2.5">{t("Position")}</th>
              <th className="text-left px-4 py-2.5">{t("Department")}</th>
              <th className="text-left px-4 py-2.5">{t("Experience")}</th>
              <th className="text-left px-4 py-2.5">{t("Date")}</th>
              <th className="text-left px-4 py-2.5">{t("Status")}</th>
              <th className="text-left px-4 py-2.5">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a._id} className="border-t border-border hover:bg-muted/10 cursor-pointer" onClick={() => setSelectedId(a._id)}>
                <td className="px-4 py-2.5 font-medium text-burgundy">{a._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-2.5">
                  <div>{a.fullName}</div>
                  <div className="text-[10px] text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-2.5">{a.jobId?.title || "N/A"}</td>
                <td className="px-4 py-2.5">{a.jobId?.department || "N/A"}</td>
                <td className="px-4 py-2.5">{a.phone || "N/A"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.appliedDate?.slice(0, 10)}</td>
                <td className="px-4 py-2.5">{statusBadge(a.status)}</td>
                <td className="px-4 py-2.5 flex gap-1">
                  <button className="p-1 hover:bg-muted/20 rounded"><Eye size={14} className="text-muted-foreground" /></button>
                  <button className="p-1 hover:bg-muted/20 rounded"><Download size={14} className="text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateJobModal open={openCreateJobModal} onClose={() => setOpenCreateJobModal(false)} />
    </AdminLayout>
  );
};

export default JobApplications;
