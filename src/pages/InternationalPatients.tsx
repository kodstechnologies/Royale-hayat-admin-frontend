import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Download, Search, Eye } from "lucide-react";
import { exportToExcel } from "@/data/mockDatabase";

type IntlEnquiry = {
  id: number; name: string; country: string; treatment: string; language: string;
  phone: string; email: string; enquiryDate: string;
  status: "new" | "contacted" | "scheduled" | "closed";
  message: string; source: string;
};

const enquiries: IntlEnquiry[] = [
  { id: 1, name: "James Wilson", country: "United Kingdom", treatment: "Cardiac Surgery", language: "English", phone: "+44 7700 900123", email: "james.w@email.com", enquiryDate: "2026-04-12", status: "new", message: "I am looking for cardiac bypass surgery. Would like to know the cost and recovery time.", source: "Website" },
  { id: 2, name: "Maria Garcia", country: "Spain", treatment: "Pediatric Care", language: "Spanish/English", phone: "+34 612 345 678", email: "maria.g@email.com", enquiryDate: "2026-04-11", status: "contacted", message: "My 4-year-old needs specialized pediatric evaluation. We are interested in visiting Kuwait.", source: "Email" },
  { id: 3, name: "Chen Wei", country: "China", treatment: "Orthopedic Surgery", language: "Mandarin", phone: "+86 138 0013 8000", email: "chen.w@email.com", enquiryDate: "2026-04-10", status: "scheduled", message: "Need knee replacement surgery. Interested in VIP package with full hospitality.", source: "Agent" },
  { id: 4, name: "Anna Müller", country: "Germany", treatment: "Dermatology Consultation", language: "German/English", phone: "+49 170 1234567", email: "anna.m@email.com", enquiryDate: "2026-04-09", status: "closed", message: "Completed dermatology consultation. Very satisfied with the care provided.", source: "Website" },
  { id: 5, name: "Raj Patel", country: "India", treatment: "Cardiac Bypass", language: "Hindi/English", phone: "+91 98765 43210", email: "raj.p@email.com", enquiryDate: "2026-04-08", status: "new", message: "Complex cardiac history. Family of 3 will be accompanying. Need visa letter from hospital.", source: "Phone" },
  { id: 6, name: "Yuki Tanaka", country: "Japan", treatment: "IVF Treatment", language: "Japanese/English", phone: "+81 90 1234 5678", email: "yuki.t@email.com", enquiryDate: "2026-04-07", status: "contacted", message: "Multiple IVF treatment cycles planned. Need long-term stay arrangement and Japanese interpreter.", source: "Agent" },
  { id: 7, name: "Ahmed Al-Farsi", country: "Oman", treatment: "Bariatric Surgery", language: "Arabic/English", phone: "+968 9123 4567", email: "ahmed.f@email.com", enquiryDate: "2026-04-06", status: "new", message: "Interested in gastric sleeve surgery. Would like to know about the bariatric center of excellence.", source: "Website" },
  { id: 8, name: "Sophie Dubois", country: "France", treatment: "Cosmetic Surgery", language: "French/English", phone: "+33 6 12 34 56 78", email: "sophie.d@email.com", enquiryDate: "2026-04-05", status: "contacted", message: "Looking for rhinoplasty and facial rejuvenation treatments.", source: "Social Media" },
  { id: 9, name: "Ali Hassan", country: "Iraq", treatment: "ENT Surgery", language: "Arabic", phone: "+964 770 123 4567", email: "ali.h@email.com", enquiryDate: "2026-04-04", status: "scheduled", message: "Need tonsillectomy for my son. Looking for pediatric ENT care.", source: "Referral" },
  { id: 10, name: "Elena Ivanova", country: "Russia", treatment: "Reproductive Medicine", language: "Russian/English", phone: "+7 916 123 4567", email: "elena.i@email.com", enquiryDate: "2026-04-03", status: "new", message: "Interested in IVF treatment. Need information about success rates and costs.", source: "Website" },
  { id: 11, name: "Hassan Mohammed", country: "Saudi Arabia", treatment: "Pain Management", language: "Arabic", phone: "+966 50 123 4567", email: "hassan.m@email.com", enquiryDate: "2026-04-02", status: "contacted", message: "Chronic back pain. Interested in CT-guided spine injection therapy.", source: "Phone" },
  { id: 12, name: "Jennifer Adams", country: "USA", treatment: "Health Check Package", language: "English", phone: "+1 555 123 4567", email: "jennifer.a@email.com", enquiryDate: "2026-04-01", status: "new", message: "Executive health checkup for my husband and myself. Al Safwa program.", source: "Website" },
];

const statusStyles: Record<string, string> = {
  new: "bg-info/10 text-info", contacted: "bg-warning/10 text-warning",
  scheduled: "bg-success/10 text-success", closed: "bg-muted text-muted-foreground",
};

const InternationalPatients = () => {
  const [data] = useState(enquiries);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<IntlEnquiry | null>(null);
  const { t } = useLanguage();

  const statuses = ["All", "new", "contacted", "scheduled", "closed"];

  const filtered = data.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.country.toLowerCase().includes(search.toLowerCase()) || e.treatment.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    new: data.filter(e => e.status === "new").length,
    contacted: data.filter(e => e.status === "contacted").length,
    scheduled: data.filter(e => e.status === "scheduled").length,
    closed: data.filter(e => e.status === "closed").length,
  };

  if (selectedEnquiry) {
    return (
      <AdminLayout title="International Patients">
        <button onClick={() => setSelectedEnquiry(null)}
          className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          ← {t("Back")}
        </button>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Globe size={20} className="text-gold" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">{selectedEnquiry.name}</h2>
                <p className="text-sm font-sans text-muted-foreground">{selectedEnquiry.country} · {selectedEnquiry.language}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[selectedEnquiry.status]}`}>
              {selectedEnquiry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              [t("Treatment"), selectedEnquiry.treatment],
              [t("Phone"), selectedEnquiry.phone],
              [t("Email"), selectedEnquiry.email],
              [t("Enquiry Date"), selectedEnquiry.enquiryDate],
              [t("Source"), selectedEnquiry.source],
              [t("Status"), selectedEnquiry.status],
            ].map(([label, val]) => (
              <div key={label as string} className="bg-section-bg rounded-lg p-3">
                <p className="text-xs font-sans text-muted-foreground">{label}</p>
                <p className="text-sm font-sans font-medium text-foreground">{val}</p>
              </div>
            ))}
          </div>

          <div className="bg-section-bg rounded-lg p-4">
            <p className="text-xs font-sans text-muted-foreground mb-2">{t("Message")}</p>
            <p className="text-sm font-sans text-foreground">{selectedEnquiry.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="International Patients">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: t("New Enquiries"), value: statusCounts.new, color: "bg-info/10 text-info" },
          { label: t("Contacted"), value: statusCounts.contacted, color: "bg-warning/10 text-warning" },
          { label: t("Scheduled"), value: statusCounts.scheduled, color: "bg-success/10 text-success" },
          { label: t("Closed"), value: statusCounts.closed, color: "bg-muted text-muted-foreground" },
        ].map(c => (
          <div key={c.label} className="bg-card rounded-lg p-4 shadow-sm border border-border">
            <p className="text-2xl font-serif font-bold text-foreground">{c.value}</p>
            <p className="text-xs font-sans text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={t("Search...")} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium capitalize transition-colors
                ${filterStatus === s ? "bg-burgundy text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-section-bg"}`}>
              {s === "All" ? t("All") : s}
            </button>
          ))}
        </div>
        <button onClick={() => exportToExcel(filtered.map(e => ({ Name: e.name, Country: e.country, Treatment: e.treatment, Status: e.status, Date: e.enquiryDate, Source: e.source })), "international-enquiries")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20">
          <Download size={13} /> {t("Export")}
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(enquiry => (
          <div key={enquiry.id} className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedEnquiry(enquiry)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-gold" />
                <div>
                  <p className="text-sm font-sans font-medium text-foreground">{enquiry.name}</p>
                  <p className="text-xs font-sans text-muted-foreground">{enquiry.country} · {enquiry.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[enquiry.status]}`}>
                  {enquiry.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-sans">
              <div><span className="text-muted-foreground">{t("Treatment")}:</span> <span className="text-foreground">{enquiry.treatment}</span></div>
              <div><span className="text-muted-foreground">{t("Source")}:</span> <span className="text-foreground">{enquiry.source}</span></div>
              <div><span className="text-muted-foreground">{t("Date")}:</span> <span className="text-foreground">{enquiry.enquiryDate}</span></div>
              <div><span className="text-muted-foreground">{t("Phone")}:</span> <span className="text-foreground">{enquiry.phone}</span></div>
            </div>
            <p className="text-xs font-sans text-muted-foreground mt-2 line-clamp-1 italic">{enquiry.message}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default InternationalPatients;
