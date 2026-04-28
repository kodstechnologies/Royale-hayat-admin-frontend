import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Upload, QrCode, Copy, Send, Download, Link, Phone, MessageSquare, FileText, CheckCircle } from "lucide-react";

type UploadLink = {
  id: string;
  url: string;
  createdAt: string;
  patientName: string;
  status: "active" | "used" | "expired";
  uploads: { name: string; type: string; date: string; size: string }[];
};

const PatientDocumentUpload = () => {
  const [links, setLinks] = useState<UploadLink[]>([
    { id: "UL-001", url: "https://upload.royalehayat.com/u/abc123", createdAt: "2026-04-08", patientName: "Sarah Al-Mutairi", status: "used", uploads: [
      { name: "Blood_Test_Results.pdf", type: "Lab Result", date: "2026-04-08", size: "1.2 MB" },
      { name: "MRI_Scan.dcm", type: "Scan", date: "2026-04-08", size: "15.4 MB" },
    ]},
    { id: "UL-002", url: "https://upload.royalehayat.com/u/def456", createdAt: "2026-04-07", patientName: "Ahmed Hassan", status: "active", uploads: [] },
    { id: "UL-003", url: "https://upload.royalehayat.com/u/ghi789", createdAt: "2026-04-06", patientName: "Fatima Al-Sabah", status: "used", uploads: [
      { name: "Prescription_April.pdf", type: "Prescription", date: "2026-04-06", size: "0.5 MB" },
    ]},
  ]);

  const [showGenerate, setShowGenerate] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<{ open: boolean; url: string; name: string; type: "SMS" | "WhatsApp" }>({ open: false, url: "", name: "", type: "SMS" });
  const [sendConfirm, setSendConfirm] = useState(false);

  const generateLink = () => {
    if (newPatientName.trim()) {
      const id = `UL-${String(links.length + 1).padStart(3, "0")}`;
      const url = `https://upload.royalehayat.com/u/${Math.random().toString(36).substring(7)}`;
      setLinks(prev => [{ id, url, createdAt: new Date().toISOString().split("T")[0], patientName: newPatientName, status: "active", uploads: [] }, ...prev]);
      setNewPatientName("");
      setNewPatientPhone("");
      setShowGenerate(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSend = () => {
    setSendConfirm(true);
    setTimeout(() => {
      setSendConfirm(false);
      setSendModal({ ...sendModal, open: false });
    }, 1500);
  };

  return (
    <AdminLayout title="Patient Document Upload">
      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowGenerate(!showGenerate)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
          <Link size={15} /> Generate Upload Link / QR
        </button>
      </div>

      {showGenerate && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6 animate-fade-in">
          <h3 className="font-serif font-semibold text-foreground mb-4">Generate New Upload Link</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-sans text-muted-foreground">Patient Name</label>
              <input type="text" value={newPatientName} onChange={e => setNewPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
            </div>
            <div>
              <label className="text-xs font-sans text-muted-foreground">Phone Number</label>
              <input type="text" value={newPatientPhone} onChange={e => setNewPatientPhone(e.target.value)}
                placeholder="+965 XXXX XXXX"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
            </div>
            <button onClick={generateLink}
              className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Links Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-serif font-semibold text-foreground">Generated Upload Links</h3>
        </div>
        <div className="divide-y divide-border">
          {links.map(link => (
            <div key={link.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-sans font-medium text-foreground">{link.patientName}</p>
                  <p className="text-xs font-sans text-muted-foreground">{link.id} · Created {link.createdAt}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${
                  link.status === "active" ? "bg-success/10 text-success" :
                  link.status === "used" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                }`}>{link.status}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-1.5 rounded bg-section-bg text-xs font-mono text-muted-foreground truncate">{link.url}</code>
                <button onClick={() => copyLink(link.url)}
                  className={`p-1.5 rounded text-xs ${copied === link.url ? "text-success" : "text-muted-foreground hover:text-foreground"}`}>
                  {copied === link.url ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
                <button onClick={() => setShowQR(showQR === link.id ? null : link.id)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground" title="Show QR">
                  <QrCode size={14} />
                </button>
                <button onClick={() => setSendModal({ open: true, url: link.url, name: link.patientName, type: "SMS" })}
                  className="p-1.5 rounded text-muted-foreground hover:text-info" title="Send SMS">
                  <Phone size={14} />
                </button>
                <button onClick={() => setSendModal({ open: true, url: link.url, name: link.patientName, type: "WhatsApp" })}
                  className="p-1.5 rounded text-muted-foreground hover:text-success" title="Send WhatsApp">
                  <MessageSquare size={14} />
                </button>
              </div>

              {showQR === link.id && (
                <div className="bg-section-bg rounded-lg p-4 mb-3 flex items-center gap-4 animate-fade-in">
                  <div className="w-32 h-32 bg-card border border-border rounded-lg flex items-center justify-center">
                    <QrCode size={80} className="text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-sans font-medium text-foreground mb-2">QR Code for {link.patientName}</p>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-sans font-medium hover:bg-muted transition-colors">
                      <Download size={12} /> Download QR
                    </button>
                  </div>
                </div>
              )}

              {link.uploads.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-sans font-semibold text-muted-foreground mb-1">Uploaded Documents:</p>
                  {link.uploads.map((up, j) => (
                    <div key={j} className="flex items-center justify-between py-1.5 px-3 rounded bg-section-bg">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-burgundy" />
                        <span className="text-xs font-sans text-foreground">{up.name}</span>
                        <span className="text-xs font-sans text-muted-foreground">({up.type} · {up.size})</span>
                      </div>
                      <span className="text-xs font-sans text-muted-foreground">{up.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Send Modal */}
      {sendModal.open && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setSendModal({ ...sendModal, open: false })}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            {sendConfirm ? (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-success mx-auto mb-3" />
                <p className="text-sm font-sans font-semibold text-foreground">Link Sent Successfully!</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">{sendModal.type} sent to {sendModal.name}</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif font-semibold text-foreground mb-4">Send Upload Link via {sendModal.type}</h3>
                <p className="text-sm font-sans text-muted-foreground mb-3">
                  Send document upload link to <strong>{sendModal.name}</strong>
                </p>
                <p className="text-xs font-sans text-muted-foreground bg-section-bg p-2 rounded mb-4 break-all">{sendModal.url}</p>
                <div className="flex gap-2">
                  <button onClick={handleSend}
                    className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
                    <Send size={14} className="inline mr-1" /> Send
                  </button>
                  <button onClick={() => setSendModal({ ...sendModal, open: false })}
                    className="px-4 py-2 rounded-md bg-section-bg text-muted-foreground text-sm font-sans font-medium hover:bg-border transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PatientDocumentUpload;
