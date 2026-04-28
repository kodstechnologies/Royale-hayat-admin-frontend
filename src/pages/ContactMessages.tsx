import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Mail, Reply, CheckCircle, Clock, Send, X } from "lucide-react";

const deptOptions = ["Cardiology", "Obstetrics & Gynecology", "Pediatrics", "Dermatology", "Internal Medicine", "ENT", "General Surgery", "Orthopedics", "Dental Clinic", "International Dept", "Finance", "Administration"];

const mockMessages = [
  { id: "CM-001", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 555 234 5678", subject: "General Inquiry", message: "I would like to know more about your cardiology department and available procedures for international patients. My father needs a heart valve replacement.", date: "2026-04-12", status: "new", replied: false },
  { id: "CM-002", name: "عبدالله المطيري", email: "abdullah.m@email.com", phone: "+965 9912 3456", subject: "Billing Question", message: "I have a question about my recent invoice for the dermatology consultation. The amount seems different from what was quoted.", date: "2026-04-11", status: "replied", replied: true },
  { id: "CM-003", name: "Priya Sharma", email: "priya.s@email.com", phone: "+91 98765 43210", subject: "Medical Tourism", message: "Planning to visit Kuwait for medical treatment. Can you provide information about your international patient services and accommodation options?", date: "2026-04-10", status: "new", replied: false },
  { id: "CM-004", name: "خالد البدر", email: "khaled.b@email.com", phone: "+965 6678 9012", subject: "Appointment Follow-up", message: "I submitted an appointment request last week but haven't received a confirmation. My reference number is APR-2026-0045.", date: "2026-04-09", status: "replied", replied: true },
  { id: "CM-005", name: "Maria Garcia", email: "maria.g@email.com", phone: "+34 612 345 678", subject: "Partnership Inquiry", message: "Our hospital in Spain is interested in establishing a referral partnership with Royale Hayat Hospital. Could we schedule a meeting?", date: "2026-04-08", status: "new", replied: false },
  { id: "CM-006", name: "فاطمة العنزي", email: "fatima.a@email.com", phone: "+965 5543 2109", subject: "Complaint", message: "I am not satisfied with the waiting time during my last visit. I waited over 2 hours past my appointment time in the ENT department.", date: "2026-04-07", status: "flagged", replied: false },
  { id: "CM-007", name: "James Wilson", email: "james.w@email.com", phone: "+44 7700 900123", subject: "Al Safwa Program", message: "I'm a British expat in Kuwait. Can you tell me more about the Al Safwa Healthcare Program benefits and pricing for expatriates?", date: "2026-04-06", status: "replied", replied: true },
  { id: "CM-008", name: "نورة السالم", email: "noura.s@email.com", phone: "+965 9987 6543", subject: "Feedback", message: "Excellent experience with Dr. Hasan in the obstetrics department. The entire team was professional and caring. Thank you!", date: "2026-04-05", status: "new", replied: false },
];

const ContactMessages = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mockMessages[0] | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyDept, setReplyDept] = useState("");
  const [replySent, setReplySent] = useState(false);

  const filtered = mockMessages.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { new: "bg-info/10 text-info", replied: "bg-success/10 text-success", flagged: "bg-error/10 text-error" };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[s]}`}>{t(s.charAt(0).toUpperCase() + s.slice(1))}</span>;
  };

  const handleReply = () => {
    setReplySent(true);
    setTimeout(() => {
      setReplySent(false);
      setShowReply(false);
      setReplyText("");
      setReplyDept("");
    }, 2000);
  };

  return (
    <AdminLayout title="Contact Messages">
      <p className="text-xs text-muted-foreground mb-4">{t("Messages received from the Contact Us form on the website.")}</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search by name or subject...")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card" />
        </div>
        {["all", "new", "replied", "flagged"].map(f => (
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
              <th className="text-left px-4 py-2.5">{t("Sender")}</th>
              <th className="text-left px-4 py-2.5">{t("Subject")}</th>
              <th className="text-left px-4 py-2.5">{t("Date")}</th>
              <th className="text-left px-4 py-2.5">{t("Status")}</th>
              <th className="text-left px-4 py-2.5">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className={`border-t border-border hover:bg-muted/10 cursor-pointer ${!m.replied ? "font-medium" : ""}`} onClick={() => { setSelected(m); setShowReply(false); setReplySent(false); }}>
                <td className="px-4 py-2.5 text-burgundy">{m.id}</td>
                <td className="px-4 py-2.5">
                  <div>{m.name}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{m.email}</div>
                </td>
                <td className="px-4 py-2.5">{m.subject}</td>
                <td className="px-4 py-2.5 text-muted-foreground font-normal">{m.date}</td>
                <td className="px-4 py-2.5">{statusBadge(m.status)}</td>
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
                <Mail size={18} className="text-burgundy" />
                <h3 className="font-serif font-semibold text-foreground">{selected.subject}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div><span className="text-muted-foreground">{t("Name")}:</span> <span className="font-medium">{selected.name}</span></div>
              <div><span className="text-muted-foreground">{t("Email")}:</span> <span className="font-medium">{selected.email}</span></div>
              <div><span className="text-muted-foreground">{t("Phone")}:</span> <span className="font-medium">{selected.phone}</span></div>
              <div><span className="text-muted-foreground">{t("Date")}:</span> <span className="font-medium">{selected.date}</span></div>
            </div>
            <div className="text-sm bg-muted/10 rounded-lg p-3 mb-4">
              <p className="text-muted-foreground text-[11px] mb-1">{t("Message")}:</p>
              <p>{selected.message}</p>
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

export default ContactMessages;
