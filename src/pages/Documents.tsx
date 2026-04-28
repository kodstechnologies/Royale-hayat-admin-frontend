import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, FileText, Download, Upload, QrCode, MessageSquare, Phone, Send, Eye, Trash2, Plus, Copy, X, Check } from "lucide-react";

type AdminDoc = {
  id: string; title: string; category: string; description: string;
  uploadDate: string; fileSize: string; uploadedBy: string;
  sharedVia: ("SMS" | "WhatsApp" | "QR Code")[]; timesShared: number; status: "Active" | "Draft";
};

const initialDocs: AdminDoc[] = [
  { id: "doc-1", title: "Patient Welcome Guide", category: "Brochure", description: "Comprehensive guide for new patients including hospital map, amenities, and contact information.", uploadDate: "2026-04-10", fileSize: "3.2 MB", uploadedBy: "Admin", sharedVia: ["SMS", "WhatsApp", "QR Code"], timesShared: 245, status: "Active" },
  { id: "doc-2", title: "Insurance Claim Form", category: "Form", description: "Standard form for submitting insurance claims. Compatible with all 13 accepted insurance providers.", uploadDate: "2026-04-08", fileSize: "0.5 MB", uploadedBy: "Finance", sharedVia: ["WhatsApp", "QR Code"], timesShared: 189, status: "Active" },
  { id: "doc-3", title: "Pre-Surgery Instructions", category: "Guide", description: "Patient preparation guidelines for all surgical procedures including fasting and medication instructions.", uploadDate: "2026-04-05", fileSize: "1.1 MB", uploadedBy: "Nursing", sharedVia: ["SMS", "WhatsApp"], timesShared: 156, status: "Active" },
  { id: "doc-4", title: "Discharge Summary Template", category: "Form", description: "Template for patient discharge summaries including medication, follow-up, and care instructions.", uploadDate: "2026-04-03", fileSize: "0.8 MB", uploadedBy: "Medical Records", sharedVia: ["SMS", "WhatsApp"], timesShared: 312, status: "Active" },
  { id: "doc-5", title: "Al Safwa Health Program", category: "Brochure", description: "Exclusive executive health screening program brochure for VIP patients.", uploadDate: "2026-04-01", fileSize: "4.5 MB", uploadedBy: "Marketing", sharedVia: ["WhatsApp", "QR Code"], timesShared: 89, status: "Active" },
  { id: "doc-6", title: "International Patient Package", category: "Guide", description: "Complete information package for international patients including visa assistance, accommodation, and transport.", uploadDate: "2026-03-28", fileSize: "2.8 MB", uploadedBy: "International Dept", sharedVia: ["SMS", "WhatsApp", "QR Code"], timesShared: 67, status: "Active" },
  { id: "doc-7", title: "Vaccination Schedule - Pediatric", category: "Guide", description: "Age-appropriate vaccination schedule for infants and children as per MOH guidelines.", uploadDate: "2026-03-25", fileSize: "0.6 MB", uploadedBy: "Pediatrics", sharedVia: ["SMS", "WhatsApp"], timesShared: 198, status: "Active" },
  { id: "doc-8", title: "Maternity Care Brochure", category: "Brochure", description: "Comprehensive maternity services overview including birthing suites, prenatal classes, and postnatal care.", uploadDate: "2026-03-20", fileSize: "5.1 MB", uploadedBy: "Marketing", sharedVia: ["WhatsApp", "QR Code"], timesShared: 134, status: "Active" },
  { id: "doc-9", title: "Patient Rights & Responsibilities", category: "Policy", description: "Official document outlining patient rights and responsibilities during their stay.", uploadDate: "2026-03-15", fileSize: "0.4 MB", uploadedBy: "Legal", sharedVia: ["QR Code"], timesShared: 56, status: "Active" },
  { id: "doc-10", title: "Post-Bariatric Surgery Nutrition Guide", category: "Guide", description: "Detailed nutrition and dietary guidelines for patients post-bariatric surgery.", uploadDate: "2026-03-10", fileSize: "1.8 MB", uploadedBy: "Nutrition", sharedVia: ["SMS", "WhatsApp"], timesShared: 78, status: "Active" },
  { id: "doc-11", title: "Lab Results Interpretation Guide", category: "Guide", description: "Patient-friendly guide to understanding common laboratory test results.", uploadDate: "2026-03-05", fileSize: "1.2 MB", uploadedBy: "Laboratory", sharedVia: ["WhatsApp"], timesShared: 45, status: "Draft" },
  { id: "doc-12", title: "Pain Management Patient Guide", category: "Guide", description: "Information about pain management options including CT-guided procedures.", uploadDate: "2026-03-01", fileSize: "0.9 MB", uploadedBy: "Pain Management", sharedVia: ["SMS"], timesShared: 34, status: "Active" },
];

const catStyles: Record<string, string> = {
  Brochure: "bg-burgundy/10 text-burgundy", Form: "bg-info/10 text-info",
  Guide: "bg-success/10 text-success", Policy: "bg-gold/10 text-gold",
};

type ShareMethod = "sms" | "whatsapp" | "qr" | "link" | null;

const Documents = () => {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState<AdminDoc | null>(null);
  const [shareMethod, setShareMethod] = useState<ShareMethod>(null);
  const [shareInput, setShareInput] = useState("");
  const [shareSent, setShareSent] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", category: "Brochure", description: "" });
  const { t } = useLanguage();

  const categories = ["All", ...Array.from(new Set(initialDocs.map(d => d.category)))];

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || d.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleUpload = () => {
    if (uploadForm.title) {
      setDocs(prev => [{
        id: `doc-${Date.now()}`, title: uploadForm.title, category: uploadForm.category,
        description: uploadForm.description, uploadDate: new Date().toISOString().split("T")[0],
        fileSize: "1.0 MB", uploadedBy: "Admin", sharedVia: [], timesShared: 0, status: "Draft" as const,
      }, ...prev]);
      setUploadForm({ title: "", category: "Brochure", description: "" });
      setShowUpload(false);
    }
  };

  const handleShare = () => {
    setShareSent(true);
    setTimeout(() => {
      setShareSent(false);
      setShareMethod(null);
      setShareInput("");
    }, 2000);
  };

  const closeShareModal = () => {
    setShowShareModal(null);
    setShareMethod(null);
    setShareInput("");
    setShareSent(false);
  };

  return (
    <AdminLayout title="Documents">
      <p className="text-sm font-sans text-muted-foreground mb-4">{t("Upload and manage documents to share with patients via SMS, WhatsApp, or QR code.")}</p>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder={t("Search...")} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-section-bg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors
                  ${filterCat === c ? "bg-burgundy text-primary-foreground" : "bg-section-bg text-muted-foreground hover:bg-border"}`}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep transition-colors">
            <Upload size={13} /> {t("Upload Document")}
          </button>
        </div>

        {showUpload && (
          <div className="p-4 border-b border-border bg-section-bg/50 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs font-sans text-muted-foreground">{t("Document Title")} *</label>
                <input type="text" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
              </div>
              <div>
                <label className="text-xs font-sans text-muted-foreground">{t("Category")}</label>
                <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
                  <option>Brochure</option><option>Form</option><option>Guide</option><option>Policy</option>
                </select>
              </div>
              <button onClick={handleUpload}
                className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">{t("Upload")}</button>
            </div>
            <div className="mt-3">
              <label className="text-xs font-sans text-muted-foreground">{t("Description")}</label>
              <textarea value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={2} />
            </div>
          </div>
        )}

        <div className="divide-y divide-border">
          {filtered.map(doc => (
            <div key={doc.id} className="p-4 hover:bg-section-bg/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-section-bg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-burgundy" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-sans font-medium text-foreground">{doc.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${catStyles[doc.category] || "bg-muted text-muted-foreground"}`}>{doc.category}</span>
                      {doc.status === "Draft" && <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-warning/10 text-warning">Draft</span>}
                    </div>
                    <p className="text-xs font-sans text-muted-foreground mt-1">{doc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-sans text-muted-foreground">
                      <span>{doc.fileSize}</span>
                      <span>{doc.uploadDate}</span>
                      <span>{t("Shared")} {doc.timesShared} {t("times")}</span>
                      {doc.sharedVia.length > 0 && (
                        <div className="flex items-center gap-1">
                          {doc.sharedVia.includes("SMS") && <Phone size={10} />}
                          {doc.sharedVia.includes("WhatsApp") && <MessageSquare size={10} />}
                          {doc.sharedVia.includes("QR Code") && <QrCode size={10} />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setShowShareModal(doc)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-burgundy/10 text-burgundy text-xs font-sans font-medium hover:bg-burgundy/20">
                    <Send size={11} /> {t("Share")}
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-section-bg text-xs font-sans font-medium text-muted-foreground hover:bg-border">
                    <Download size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border text-xs font-sans text-muted-foreground">
          {filtered.length} {t("documents")}
        </div>
      </div>

      {/* Share Modal with input interactions */}
      {showShareModal && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={closeShareModal}>
          <div className="bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-serif font-semibold text-foreground">{t("Share Document")}</h3>
              <button onClick={closeShareModal} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">{showShareModal.title}</p>

            {shareSent ? (
              <div className="flex flex-col items-center py-8 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Check size={24} className="text-success" />
                </div>
                <p className="text-sm font-sans font-medium text-foreground">{t("Sent successfully!")}</p>
              </div>
            ) : shareMethod === null ? (
              <div className="space-y-3">
                <button onClick={() => setShareMethod("sms")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-section-bg transition-colors">
                  <Phone size={18} className="text-info" />
                  <div className="text-left">
                    <p className="text-sm font-sans font-medium text-foreground">{t("Send via SMS")}</p>
                    <p className="text-xs font-sans text-muted-foreground">{t("Send document link to patient's phone")}</p>
                  </div>
                </button>
                <button onClick={() => setShareMethod("whatsapp")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-section-bg transition-colors">
                  <MessageSquare size={18} className="text-success" />
                  <div className="text-left">
                    <p className="text-sm font-sans font-medium text-foreground">{t("Send via WhatsApp")}</p>
                    <p className="text-xs font-sans text-muted-foreground">{t("Share through WhatsApp message")}</p>
                  </div>
                </button>
                <button onClick={() => setShareMethod("qr")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-section-bg transition-colors">
                  <QrCode size={18} className="text-burgundy" />
                  <div className="text-left">
                    <p className="text-sm font-sans font-medium text-foreground">{t("Generate QR Code")}</p>
                    <p className="text-xs font-sans text-muted-foreground">{t("Create scannable QR code for this document")}</p>
                  </div>
                </button>
                <button onClick={() => setShareMethod("link")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-section-bg transition-colors">
                  <Copy size={18} className="text-gold" />
                  <div className="text-left">
                    <p className="text-sm font-sans font-medium text-foreground">{t("Copy Link")}</p>
                    <p className="text-xs font-sans text-muted-foreground">{t("Copy document link to clipboard")}</p>
                  </div>
                </button>
              </div>
            ) : shareMethod === "sms" ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={16} className="text-info" />
                  <span className="text-sm font-sans font-medium">{t("Send via SMS")}</span>
                </div>
                <div>
                  <label className="text-xs font-sans text-muted-foreground">{t("Patient Phone Number")} *</label>
                  <input type="tel" value={shareInput} onChange={e => setShareInput(e.target.value)} placeholder="+965 XXXX XXXX"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare} disabled={!shareInput.trim()}
                    className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep disabled:opacity-50">{t("Send")}</button>
                  <button onClick={() => { setShareMethod(null); setShareInput(""); }}
                    className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Back")}</button>
                </div>
              </div>
            ) : shareMethod === "whatsapp" ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-success" />
                  <span className="text-sm font-sans font-medium">{t("Send via WhatsApp")}</span>
                </div>
                <div>
                  <label className="text-xs font-sans text-muted-foreground">{t("Patient Phone Number")} *</label>
                  <input type="tel" value={shareInput} onChange={e => setShareInput(e.target.value)} placeholder="+965 XXXX XXXX"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare} disabled={!shareInput.trim()}
                    className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep disabled:opacity-50">{t("Send")}</button>
                  <button onClick={() => { setShareMethod(null); setShareInput(""); }}
                    className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Back")}</button>
                </div>
              </div>
            ) : shareMethod === "qr" ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={16} className="text-burgundy" />
                  <span className="text-sm font-sans font-medium">{t("Generate QR Code")}</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <div className="w-40 h-40 bg-section-bg rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-3">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-5 h-5 rounded-sm ${Math.random() > 0.4 ? "bg-foreground" : "bg-card"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-sans text-muted-foreground mb-2">{t("Scan to access document")}</p>
                  <div>
                    <label className="text-xs font-sans text-muted-foreground">{t("Patient Email")} ({t("optional")})</label>
                    <input type="email" value={shareInput} onChange={e => setShareInput(e.target.value)} placeholder="patient@email.com"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleShare}
                    className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep">{t("Download QR")}</button>
                  <button onClick={() => { setShareMethod(null); setShareInput(""); }}
                    className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Back")}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Copy size={16} className="text-gold" />
                  <span className="text-sm font-sans font-medium">{t("Copy Link")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={`https://royalehayat.com/docs/${showShareModal.id}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-border text-sm font-sans bg-section-bg" />
                  <button onClick={handleShare}
                    className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep">
                    <Copy size={14} />
                  </button>
                </div>
                <div>
                  <label className="text-xs font-sans text-muted-foreground">{t("Send link to email")} ({t("optional")})</label>
                  <input type="email" value={shareInput} onChange={e => setShareInput(e.target.value)} placeholder="patient@email.com"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
                <button onClick={() => { setShareMethod(null); setShareInput(""); }}
                  className="w-full px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">{t("Back")}</button>
              </div>
            )}

            {!shareSent && shareMethod === null && (
              <button onClick={closeShareModal} className="w-full mt-4 py-2 rounded-md bg-section-bg text-sm font-sans font-medium text-muted-foreground hover:bg-border">
                {t("Close")}
              </button>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Documents;
