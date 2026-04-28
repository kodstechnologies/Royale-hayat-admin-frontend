import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Edit, Save, X, ChevronDown, ChevronUp } from "lucide-react";

type ContentBlock = {
  id: string; page: string; title: string; content: string; lastEdited: string;
};

const initialContent: ContentBlock[] = [
  { id: "home-hero", page: "Homepage", title: "Hero Section", content: "Welcome to Royale Hayat Hospital — Kuwait's Premier Healthcare Destination. Where world-class medical expertise meets five-star hospitality.", lastEdited: "2026-04-01" },
  { id: "home-intro", page: "Homepage", title: "Introduction", content: "Royale Hayat Hospital has been celebrating life since 2006, beginning as a dedicated women's and children's hospital and growing into Kuwait's leading multi-disciplinary healthcare destination.", lastEdited: "2026-03-28" },
  { id: "home-stats", page: "Homepage", title: "Key Statistics", content: "20+ Specialized Departments | 200+ Expert Physicians | 50,000+ Patients Annually | JCI Accredited", lastEdited: "2026-03-15" },
  { id: "about-main", page: "About Us", title: "About Royale Hayat", content: "Royale Hayat Hospital is Kuwait's premier private healthcare facility, offering world-class medical services in a luxurious setting. Our hospital combines cutting-edge medical technology with the warmth and comfort of five-star hospitality.", lastEdited: "2026-03-20" },
  { id: "about-vision", page: "About Us", title: "Vision & Mission", content: "Vision: To be the leading healthcare provider in the GCC, setting new standards in patient care and medical excellence. Mission: To deliver exceptional healthcare services with compassion, innovation, and the highest standards of quality.", lastEdited: "2026-03-20" },
  { id: "about-chairman", page: "About Us", title: "Chairman's Message", content: "At Royale Hayat Hospital, our vision is to redefine healthcare by combining world-class medical expertise with the warmth and comfort of luxury hospitality. We believe every patient deserves not just treatment, but a complete care experience.", lastEdited: "2026-02-15" },
  { id: "services-overview", page: "Services", title: "Services Overview", content: "We offer over 25 specialized departments providing comprehensive medical care, from preventive wellness to advanced surgical procedures. Our multidisciplinary approach ensures coordinated care across all specialties.", lastEdited: "2026-03-25" },
  { id: "services-medical", page: "Services", title: "Medical Services Description", content: "Our medical services span cardiology, neurology, orthopedics, pediatrics, obstetrics, dermatology, ENT, ophthalmology, internal medicine, general surgery, dental care, and urology — all delivered by internationally trained specialists.", lastEdited: "2026-03-25" },
  { id: "doctors-intro", page: "Doctors", title: "Our Medical Team", content: "Our team of over 200 physicians represents the finest medical talent from around the world. Each specialist brings decades of experience and a commitment to delivering personalized, evidence-based care.", lastEdited: "2026-03-10" },
  { id: "patients-info", page: "Patient Information", title: "Patient Guide", content: "Your comfort and safety are our priority. Learn about visiting hours (8AM-10PM), admission procedures, insurance partnerships, and patient rights. Our dedicated patient relations team is here to assist you.", lastEdited: "2026-03-05" },
  { id: "patients-rights", page: "Patient Information", title: "Patient Rights & Responsibilities", content: "Every patient has the right to: quality healthcare, privacy and confidentiality, informed consent, respectful treatment, access to medical records, and the right to refuse treatment.", lastEdited: "2026-02-20" },
  { id: "intl-main", page: "International Patients", title: "International Patient Services", content: "We welcome patients from around the world. Our dedicated international patient coordinators assist with travel arrangements, accommodation, translation, visa support, and personalized care plans tailored to your needs.", lastEdited: "2026-03-18" },
  { id: "intl-process", page: "International Patients", title: "How It Works", content: "1. Submit your enquiry online. 2. Receive a treatment plan and cost estimate. 3. Our team arranges travel and accommodation. 4. Arrive and receive premium care. 5. Follow-up support after discharge.", lastEdited: "2026-03-18" },
  { id: "hospitality-main", page: "Hospitality", title: "Hospitality Services", content: "Experience healthcare in a setting that rivals the finest hotels. VIP suites, private dining, concierge services, spa facilities, and personalized care plans define the Royale Hayat experience.", lastEdited: "2026-03-12" },
  { id: "hospitality-vip", page: "Hospitality", title: "VIP Services", content: "Our VIP program offers: dedicated suite with living area, personal concierge, gourmet dining, airport transfers, private nursing, entertainment systems, and family accommodation arrangements.", lastEdited: "2026-03-12" },
  { id: "form-booking", page: "Form Labels", title: "Booking Form Labels", content: "Full Name | Phone Number | Email | Department | Preferred Doctor | Date | Time | Insurance Provider | Medical History | Symptoms Description | Preferred Language", lastEdited: "2026-02-28" },
  { id: "policy-privacy", page: "Policies", title: "Privacy Policy Summary", content: "Royale Hayat Hospital is committed to protecting your personal health information. We comply with Kuwait's data protection laws and international healthcare data standards.", lastEdited: "2026-01-15" },
  { id: "policy-refund", page: "Policies", title: "Cancellation & Refund Policy", content: "Appointments may be cancelled up to 24 hours before the scheduled time. Refunds are processed within 7 business days. Emergency cancellations are handled on a case-by-case basis.", lastEdited: "2026-01-15" },
];

const ContentManagement = () => {
  const [sections, setSections] = useState(initialContent);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [filterPage, setFilterPage] = useState("All");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const pages = ["All", ...Array.from(new Set(initialContent.map(s => s.page)))];

  const startEdit = (section: ContentBlock) => {
    setEditing(section.id);
    setEditText(section.content);
    setEditTitle(section.title);
  };

  const saveEdit = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: editText, title: editTitle, lastEdited: new Date().toISOString().split("T")[0] } : s));
    setEditing(null);
  };

  const filteredSections = filterPage === "All" ? sections : sections.filter(s => s.page === filterPage);
  const groupedByPage: Record<string, ContentBlock[]> = {};
  filteredSections.forEach(s => {
    if (!groupedByPage[s.page]) groupedByPage[s.page] = [];
    groupedByPage[s.page].push(s);
  });

  return (
    <AdminLayout title="Content Management">
      <p className="text-xs font-sans text-muted-foreground mb-4">Edit text content for the main website. Media (images/videos) are managed separately via backend.</p>

      <div className="flex gap-1 flex-wrap mb-4">
        {pages.map(p => (
          <button key={p} onClick={() => setFilterPage(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors
              ${filterPage === p ? "bg-burgundy text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-section-bg"}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByPage).map(([page, blocks]) => (
          <div key={page} className="bg-card rounded-lg shadow-sm border border-border">
            <button onClick={() => setExpandedPage(expandedPage === page ? null : page)}
              className="w-full flex items-center justify-between p-4 hover:bg-section-bg/50 transition-colors">
              <h3 className="font-serif font-semibold text-foreground">{page}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-muted-foreground">{blocks.length} sections</span>
                {expandedPage === page ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </button>

            {(expandedPage === page || filterPage !== "All") && (
              <div className="border-t border-border">
                {blocks.map(section => (
                  <div key={section.id} className="p-4 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      {editing === section.id ? (
                        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-serif font-semibold focus:outline-none focus:ring-1 focus:ring-gold" />
                      ) : (
                        <h4 className="font-serif font-semibold text-foreground text-sm">{section.title}</h4>
                      )}
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[10px] font-sans text-muted-foreground">Edited: {section.lastEdited}</span>
                        {editing !== section.id ? (
                          <button onClick={() => startEdit(section)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                            <Edit size={11} /> Edit
                          </button>
                        ) : (
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(section.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium"><Save size={11} /> Save</button>
                            <button onClick={() => setEditing(null)}
                              className="px-2 py-1 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium"><X size={11} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    {editing === section.id ? (
                      <textarea value={editText} onChange={e => setEditText(e.target.value)}
                        className="w-full p-3 rounded-lg border border-border text-sm font-sans bg-section-bg focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={4} />
                    ) : (
                      <p className="text-sm font-sans text-muted-foreground leading-relaxed">{section.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;
