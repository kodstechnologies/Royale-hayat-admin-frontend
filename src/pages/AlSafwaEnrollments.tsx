import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Shield, Reply, Send, CheckCircle, X } from "lucide-react";

const deptOptions = ["Cardiology", "Obstetrics & Gynecology", "Pediatrics", "Internal Medicine", "General Surgery", "Dermatology", "Administration", "Finance"];

const mockEnrollments = [
  { id: "ASE-001", name: "Nasser Al-Kharafi", email: "nasser.k@email.com", phone: "+965 9901 2345", nationality: "Kuwaiti", dob: "1975-03-15", plan: "Platinum Family", members: 4, enrollDate: "2026-04-12", status: "pending", notes: "Interested in comprehensive family coverage" },
  { id: "ASE-002", name: "Sheikha Al-Ahmad", email: "sheikha.a@email.com", phone: "+965 6690 1234", nationality: "Kuwaiti", dob: "1982-07-22", plan: "Gold Individual", members: 1, enrollDate: "2026-04-11", status: "replied", notes: "Existing patient, premium upgrade" },
  { id: "ASE-003", name: "Bader Al-Mulla", email: "bader.m@email.com", phone: "+965 5578 9012", nationality: "Kuwaiti", dob: "1968-11-05", plan: "Platinum Individual", members: 1, enrollDate: "2026-04-10", status: "replied", notes: "VIP referral from Dr. Hassan" },
  { id: "ASE-004", name: "Dalal Al-Sabah", email: "dalal.s@email.com", phone: "+965 9956 7890", nationality: "Kuwaiti", dob: "1990-01-18", plan: "Gold Family", members: 3, enrollDate: "2026-04-09", status: "pending", notes: "Requesting tour of facilities before enrollment" },
  { id: "ASE-005", name: "Faisal Al-Ghanim", email: "faisal.g@email.com", phone: "+965 6645 6789", nationality: "Saudi", dob: "1972-06-30", plan: "Platinum Family", members: 6, enrollDate: "2026-04-08", status: "pending", notes: "Incomplete documentation" },
  { id: "ASE-006", name: "Huda Al-Roumi", email: "huda.r@email.com", phone: "+965 5534 5678", nationality: "Kuwaiti", dob: "1985-09-12", plan: "Gold Individual", members: 1, enrollDate: "2026-04-07", status: "replied", notes: "Annual checkup package included" },
];

const AlSafwaEnrollments = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mockEnrollments[0] | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyDept, setReplyDept] = useState("");
  const [replySent, setReplySent] = useState(false);

  const filtered = mockEnrollments.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.status === filter;
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
    <AdminLayout title="Al Safwa Enrollments">
      <div className="space-y-6 mb-4">
        <BreadCrumb />
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t("Manage enrollment applications for the Al Safwa Healthcare Program submitted via the website.")}</p>

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
              <th className="text-left px-4 py-2.5">{t("ID")}</th>
              <th className="text-left px-4 py-2.5">{t("Applicant")}</th>
              <th className="text-left px-4 py-2.5">{t("Plan")}</th>
              <th className="text-left px-4 py-2.5">{t("Members")}</th>
              <th className="text-left px-4 py-2.5">{t("Nationality")}</th>
              <th className="text-left px-4 py-2.5">{t("Date")}</th>
              <th className="text-left px-4 py-2.5">{t("Status")}</th>
              <th className="text-left px-4 py-2.5">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-t border-border hover:bg-muted/10 cursor-pointer" onClick={() => { setSelected(e); setShowReply(false); setReplySent(false); }}>
                <td className="px-4 py-2.5 font-medium text-burgundy">{e.id}</td>
                <td className="px-4 py-2.5">
                  <div>{e.name}</div>
                  <div className="text-[10px] text-muted-foreground">{e.email}</div>
                </td>
                <td className="px-4 py-2.5">{e.plan}</td>
                <td className="px-4 py-2.5 text-center">{e.members}</td>
                <td className="px-4 py-2.5">{e.nationality}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{e.enrollDate}</td>
                <td className="px-4 py-2.5">{statusBadge(e.status)}</td>
                <td className="px-4 py-2.5">
                  <button className="p-1 hover:bg-muted/20 rounded"><Eye size={14} className="text-muted-foreground" /></button>
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
                <Shield size={18} className="text-burgundy" />
                <h3 className="font-serif font-semibold text-foreground">{t("Al Safwa Enrollment")} – {selected.id}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-muted-foreground">{t("Name")}:</span> <span className="font-medium">{selected.name}</span></div>
              <div><span className="text-muted-foreground">{t("Email")}:</span> <span className="font-medium">{selected.email}</span></div>
              <div><span className="text-muted-foreground">{t("Phone")}:</span> <span className="font-medium">{selected.phone}</span></div>
              <div><span className="text-muted-foreground">{t("Nationality")}:</span> <span className="font-medium">{selected.nationality}</span></div>
              <div><span className="text-muted-foreground">{t("Date of Birth")}:</span> <span className="font-medium">{selected.dob}</span></div>
              <div><span className="text-muted-foreground">{t("Plan")}:</span> <span className="font-medium">{selected.plan}</span></div>
              <div><span className="text-muted-foreground">{t("Members")}:</span> <span className="font-medium">{selected.members}</span></div>
              <div><span className="text-muted-foreground">{t("Status")}:</span> {statusBadge(selected.status)}</div>
            </div>
            <div className="text-sm mb-4"><span className="text-muted-foreground">{t("Notes")}:</span> <span>{selected.notes}</span></div>

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

export default AlSafwaEnrollments;
