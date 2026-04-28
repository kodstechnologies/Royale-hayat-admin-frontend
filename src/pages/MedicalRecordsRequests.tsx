import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, CheckCircle, Clock, FileText, Reply, Send, X } from "lucide-react";

const deptOptions = ["Cardiology", "Obstetrics & Gynecology", "Pediatrics", "Internal Medicine", "General Surgery", "Dermatology", "Orthopedics", "Radiology", "ENT", "Medical Records"];

const mockRequests = [
  { id: "MRR-001", patientName: "Ahmad Al-Sabah", patientId: "P-10234", email: "ahmad.sabah@email.com", phone: "+965 9912 3456", requestDate: "2026-04-12", recordType: "Full Medical History", department: "Cardiology", purpose: "Insurance Claim", status: "pending", notes: "Urgent – needed for travel insurance" },
  { id: "MRR-002", patientName: "Fatima Hassan", patientId: "P-10567", email: "fatima.h@email.com", phone: "+965 6678 9012", requestDate: "2026-04-11", recordType: "Lab Results", department: "Internal Medicine", purpose: "Second Opinion", status: "replied", notes: "Last 6 months lab work" },
  { id: "MRR-003", patientName: "Mohammed Al-Rashidi", patientId: "P-10891", email: "m.rashidi@email.com", phone: "+965 5543 2109", requestDate: "2026-04-10", recordType: "Surgical Report", department: "Orthopedics", purpose: "Transfer to Another Hospital", status: "replied", notes: "Knee replacement surgery records" },
  { id: "MRR-004", patientName: "Noura Al-Mutairi", patientId: "P-11234", email: "noura.m@email.com", phone: "+965 9987 6543", requestDate: "2026-04-09", recordType: "Radiology Images", department: "Radiology", purpose: "Personal Records", status: "pending", notes: "MRI and CT scan images" },
  { id: "MRR-005", patientName: "Khalid Bouarki", patientId: "P-11567", email: "khalid.b@email.com", phone: "+965 6612 3456", requestDate: "2026-04-08", recordType: "Discharge Summary", department: "General Surgery", purpose: "Legal Request", status: "pending", notes: "Incomplete authorization form" },
  { id: "MRR-006", patientName: "Sara Al-Enezi", patientId: "P-11890", email: "sara.enezi@email.com", phone: "+965 5567 8901", requestDate: "2026-04-07", recordType: "Prescription History", department: "Dermatology", purpose: "Pharmacy Transfer", status: "replied", notes: "All prescriptions from 2025" },
  { id: "MRR-007", patientName: "Ali Dashti", patientId: "P-12123", email: "ali.d@email.com", phone: "+965 9923 4567", requestDate: "2026-04-06", recordType: "Vaccination Records", department: "Pediatrics", purpose: "School Enrollment", status: "pending", notes: "Child vaccination records needed" },
  { id: "MRR-008", patientName: "Maha Al-Kandari", patientId: "P-12456", email: "maha.k@email.com", phone: "+965 6634 5678", requestDate: "2026-04-05", recordType: "Full Medical History", department: "OB/GYN", purpose: "Insurance Claim", status: "replied", notes: "Maternity records 2025-2026" },
];

const MedicalRecordsRequests = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mockRequests[0] | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyDept, setReplyDept] = useState("");
  const [replySent, setReplySent] = useState(false);

  const filtered = mockRequests.filter(r => {
    const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { replied: "bg-success/10 text-success", pending: "bg-warning/10 text-warning" };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[s] || "bg-muted/10 text-muted-foreground"}`}>{t(s.charAt(0).toUpperCase() + s.slice(1))}</span>;
  };

  const handleReply = () => {
    setReplySent(true);
    setTimeout(() => { setReplySent(false); setShowReply(false); setReplyText(""); setReplyDept(""); }, 2000);
  };

  return (
    <AdminLayout title="Medical Records Requests">
      <p className="text-xs text-muted-foreground mb-4">{t("Manage patient requests for medical records submitted via the website Quick Links form.")}</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search by name or ID...")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card" />
        </div>
        {["all", "pending", "replied"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${filter === f ? "bg-burgundy text-white border-burgundy" : "border-border text-muted-foreground hover:border-burgundy"}`}>
            {t(f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1))}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-muted-foreground text-[11px] uppercase">
            <tr>
              <th className="text-left px-4 py-2.5">{t("Request ID")}</th>
              <th className="text-left px-4 py-2.5">{t("Patient")}</th>
              <th className="text-left px-4 py-2.5">{t("Record Type")}</th>
              <th className="text-left px-4 py-2.5">{t("Department")}</th>
              <th className="text-left px-4 py-2.5">{t("Purpose")}</th>
              <th className="text-left px-4 py-2.5">{t("Date")}</th>
              <th className="text-left px-4 py-2.5">{t("Status")}</th>
              <th className="text-left px-4 py-2.5">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/10 cursor-pointer" onClick={() => { setSelected(r); setShowReply(false); setReplySent(false); }}>
                <td className="px-4 py-2.5 font-medium text-burgundy">{r.id}</td>
                <td className="px-4 py-2.5">
                  <div>{r.patientName}</div>
                  <div className="text-[10px] text-muted-foreground">{r.patientId}</div>
                </td>
                <td className="px-4 py-2.5">{r.recordType}</td>
                <td className="px-4 py-2.5">{r.department}</td>
                <td className="px-4 py-2.5">{r.purpose}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.requestDate}</td>
                <td className="px-4 py-2.5">{statusBadge(r.status)}</td>
                <td className="px-4 py-2.5">
                  <button className="p-1 hover:bg-muted/20 rounded" onClick={e => { e.stopPropagation(); setSelected(r); }}>
                    <Eye size={14} className="text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-xl shadow-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-burgundy" />
                <h3 className="font-serif font-semibold text-foreground">{t("Medical Records Requests")} – {selected.id}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-muted-foreground">{t("Patient")}:</span> <span className="font-medium">{selected.patientName}</span></div>
              <div><span className="text-muted-foreground">{t("Patient ID")}:</span> <span className="font-medium">{selected.patientId}</span></div>
              <div><span className="text-muted-foreground">{t("Email")}:</span> <span className="font-medium">{selected.email}</span></div>
              <div><span className="text-muted-foreground">{t("Phone")}:</span> <span className="font-medium">{selected.phone}</span></div>
              <div><span className="text-muted-foreground">{t("Record Type")}:</span> <span className="font-medium">{selected.recordType}</span></div>
              <div><span className="text-muted-foreground">{t("Department")}:</span> <span className="font-medium">{selected.department}</span></div>
              <div><span className="text-muted-foreground">{t("Purpose")}:</span> <span className="font-medium">{selected.purpose}</span></div>
              <div><span className="text-muted-foreground">{t("Status")}:</span> {statusBadge(selected.status)}</div>
            </div>
            <div className="text-sm mb-4">
              <span className="text-muted-foreground">{t("Notes")}:</span> <span>{selected.notes}</span>
            </div>

            {replySent ? (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg mb-3 animate-fade-in">
                <CheckCircle size={16} className="text-success" />
                <span className="text-sm font-sans text-success">{t("Reply sent and forwarded to department")}</span>
              </div>
            ) : showReply ? (
              <div className="space-y-3 mb-3 animate-fade-in">
                <div>
                  <label className="text-xs font-sans text-muted-foreground">{t("Forward to Department")} *</label>
                  <select value={replyDept} onChange={e => setReplyDept(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
                    <option value="">{t("Select Department")}</option>
                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-sans text-muted-foreground">{t("Reply Message")} *</label>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={t("Type your reply...")}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReply} disabled={!replyText.trim() || !replyDept}
                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep disabled:opacity-50">
                    <Send size={12} /> {t("Send Reply")}
                  </button>
                  <button onClick={() => setShowReply(false)} className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Cancel")}</button>
                </div>
              </div>
            ) : null}

            <div className="flex gap-2 justify-end">
              {!showReply && !replySent && (
                <button onClick={() => setShowReply(true)} className="px-4 py-1.5 text-xs bg-burgundy/10 text-burgundy rounded-lg hover:bg-burgundy/20 flex items-center gap-1">
                  <Reply size={12} /> {t("Reply")}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-1.5 text-xs border border-border rounded-lg hover:bg-muted/20">{t("Close")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MedicalRecordsRequests;
