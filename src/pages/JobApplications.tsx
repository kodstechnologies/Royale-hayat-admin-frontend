import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Eye, Download, Briefcase, ArrowLeft, ChevronLeft } from "lucide-react";

const mockApplications = [
  { id: "JA-001", name: "Dr. Amina Khalil", email: "amina.k@email.com", phone: "+965 9912 3456", position: "Consultant Cardiologist", department: "Cardiology", experience: "12 years", nationality: "Egyptian", applyDate: "2026-04-12", status: "shortlisted", cv: "amina_khalil_cv.pdf", coverLetter: "Passionate about interventional cardiology with extensive experience in cardiac catheterization.", education: "MBBS, MD Cardiology – Cairo University", certifications: "Board Certified Cardiologist, ACLS", address: "Salmiya, Kuwait", dob: "1988-05-15", gender: "Female", visaStatus: "Valid Work Visa", references: "Dr. Ahmed Nasser – Cairo Heart Center" },
  { id: "JA-002", name: "Nurse Fatima Ali", email: "fatima.ali@email.com", phone: "+965 6678 9012", position: "Senior Nurse – ICU", department: "Intensive Care", experience: "8 years", nationality: "Filipino", applyDate: "2026-04-11", status: "new", cv: "fatima_ali_cv.pdf", coverLetter: "ICU certified nurse with ACLS and PALS certifications.", education: "BSN – University of the Philippines", certifications: "ACLS, PALS, ICU Certified", address: "Hawally, Kuwait", dob: "1992-09-20", gender: "Female", visaStatus: "Transferable Visa", references: "Head Nurse Maria Santos – Philippine General Hospital" },
  { id: "JA-003", name: "Mohammed Tariq", email: "m.tariq@email.com", phone: "+965 5543 2109", position: "Biomedical Engineer", department: "Engineering", experience: "5 years", nationality: "Indian", applyDate: "2026-04-10", status: "interview", cv: "m_tariq_cv.pdf", coverLetter: "Specialized in medical device maintenance and calibration.", education: "B.Tech Biomedical Engineering – IIT Delhi", certifications: "ISO 13485 Auditor", address: "Mangaf, Kuwait", dob: "1995-03-10", gender: "Male", visaStatus: "Valid Work Visa", references: "Eng. Ravi Kumar – Apollo Hospitals" },
  { id: "JA-004", name: "Sarah Thompson", email: "sarah.t@email.com", phone: "+44 7700 900456", position: "Physiotherapist", department: "Rehabilitation", experience: "6 years", nationality: "British", applyDate: "2026-04-09", status: "new", cv: "sarah_t_cv.pdf", coverLetter: "MSc in Sports Physiotherapy, experienced in post-surgical rehabilitation.", education: "MSc Sports Physiotherapy – University of Birmingham", certifications: "HCPC Registered, MCSP", address: "London, UK (relocating)", dob: "1994-11-02", gender: "Female", visaStatus: "Requires Visa", references: "Dr. James Wright – NHS Birmingham" },
  { id: "JA-005", name: "عبدالرحمن الشمري", email: "abdulrahman.s@email.com", phone: "+965 9956 7890", position: "Hospital Administrator", department: "Administration", experience: "10 years", nationality: "Kuwaiti", applyDate: "2026-04-08", status: "shortlisted", cv: "abdulrahman_cv.pdf", coverLetter: "MBA in Healthcare Management with extensive hospital operations experience.", education: "MBA Healthcare Management – Kuwait University", certifications: "PMP, Lean Six Sigma Green Belt", address: "Jabriya, Kuwait", dob: "1986-07-25", gender: "Male", visaStatus: "Kuwaiti National", references: "Dr. Nasser Al-Mutawa – MOH Kuwait" },
  { id: "JA-006", name: "Dr. Ravi Patel", email: "ravi.p@email.com", phone: "+91 98765 43210", position: "Pediatric Surgeon", department: "Pediatrics", experience: "15 years", nationality: "Indian", applyDate: "2026-04-07", status: "new", cv: "ravi_patel_cv.pdf", coverLetter: "Fellowship trained in minimally invasive pediatric surgery.", education: "MBBS, MS, MCh Pediatric Surgery – AIIMS", certifications: "Fellowship MIS, Board Certified", address: "Mumbai, India", dob: "1980-12-18", gender: "Male", visaStatus: "Requires Visa", references: "Prof. Dr. Sharma – AIIMS Delhi" },
  { id: "JA-007", name: "Lina Mansour", email: "lina.m@email.com", phone: "+961 3 456 789", position: "Clinical Pharmacist", department: "Pharmacy", experience: "7 years", nationality: "Lebanese", applyDate: "2026-04-06", status: "interview", cv: "lina_m_cv.pdf", coverLetter: "PharmD with oncology pharmacy specialization.", education: "PharmD – American University of Beirut", certifications: "BCOP, BPS Certified", address: "Beirut, Lebanon", dob: "1991-04-30", gender: "Female", visaStatus: "Requires Visa", references: "Dr. Hadi Nasrallah – AUBMC" },
  { id: "JA-008", name: "نوف العتيبي", email: "nouf.o@email.com", phone: "+965 6634 5678", position: "Medical Receptionist", department: "Front Desk", experience: "3 years", nationality: "Kuwaiti", applyDate: "2026-04-05", status: "new", cv: "nouf_cv.pdf", coverLetter: "Bilingual (Arabic/English), experienced in hospital front desk operations.", education: "Diploma in Business Administration – PAAET", certifications: "Customer Service Excellence", address: "Farwaniya, Kuwait", dob: "1998-08-12", gender: "Female", visaStatus: "Kuwaiti National", references: "Manager Sara Al-Enezi – Kuwait Clinic" },
];

const JobApplications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = mockApplications.find(a => a.id === selectedId);

  const filtered = mockApplications.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

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
                <h2 className="text-lg font-serif font-semibold text-foreground">{selected.name}</h2>
                <p className="text-sm font-sans text-muted-foreground">{selected.position} · {selected.department}</p>
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(selected.status)}
                  <span className="text-xs font-sans text-muted-foreground">{t("Applied")}: {selected.applyDate}</span>
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
                [t("Name"), selected.name], [t("Email"), selected.email],
                [t("Phone"), selected.phone], [t("Nationality"), selected.nationality],
                [t("Date of Birth"), selected.dob], [t("Gender"), selected.gender],
                [t("Address"), selected.address], [t("Visa Status"), selected.visaStatus],
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
                [t("Position"), selected.position], [t("Department"), selected.department],
                [t("Experience"), selected.experience], [t("Education"), selected.education],
                [t("Certifications"), selected.certifications], [t("References"), selected.references],
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
          <p className="text-sm font-sans text-muted-foreground">{selected.coverLetter}</p>
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
      <p className="text-xs text-muted-foreground mb-4">{t("Applications received from the Work With Us section of the website.")}</p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Search by name or position...")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card" />
        </div>
        {["all", "new", "shortlisted", "interview"].map(f => (
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
              <th className="text-left px-4 py-2.5">{t("Position")}</th>
              <th className="text-left px-4 py-2.5">{t("Department")}</th>
              <th className="text-left px-4 py-2.5">{t("Experience")}</th>
              <th className="text-left px-4 py-2.5">{t("Date")}</th>
              <th className="text-left px-4 py-2.5">{t("Status")}</th>
              <th className="text-left px-4 py-2.5">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/10 cursor-pointer" onClick={() => setSelectedId(a.id)}>
                <td className="px-4 py-2.5 font-medium text-burgundy">{a.id}</td>
                <td className="px-4 py-2.5">
                  <div>{a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.nationality}</div>
                </td>
                <td className="px-4 py-2.5">{a.position}</td>
                <td className="px-4 py-2.5">{a.department}</td>
                <td className="px-4 py-2.5">{a.experience}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{a.applyDate}</td>
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
    </AdminLayout>
  );
};

export default JobApplications;
