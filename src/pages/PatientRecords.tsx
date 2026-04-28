import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { patients, exportToExcel, Patient } from "@/data/mockDatabase";
import { Search, Filter, Download, Eye, Phone, MessageSquare, X, FileText, Calendar, CreditCard, Bed, Wrench, Shield } from "lucide-react";
import MessageModal from "@/components/MessageModal";

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Discharged: "bg-muted text-muted-foreground",
  Scheduled: "bg-info/10 text-info",
};

const PatientRecords = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [msgModal, setMsgModal] = useState<{ open: boolean; name: string; phone: string; type: "SMS" | "WhatsApp" }>({ open: false, name: "", phone: "", type: "SMS" });

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.patientId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleExport = () => {
    exportToExcel(filtered.map(p => ({
      PatientID: p.patientId, Name: p.name, Phone: p.phone, Email: p.email,
      Nationality: p.nationality, Gender: p.gender, BloodType: p.bloodType,
      Insurance: p.insurance, Status: p.status, TotalVisits: p.totalVisits, LastVisit: p.lastVisit,
    })), "patient-records");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "financials", label: "Financials", icon: CreditCard },
    { id: "services", label: "Services", icon: Wrench },
    { id: "admission", label: "Admission", icon: Bed },
    { id: "insurance", label: "Insurance", icon: Shield },
    { id: "communications", label: "Messages", icon: MessageSquare },
  ];

  return (
    <AdminLayout title="Patient Records">
      {selectedPatient ? (
        <div className="animate-fade-in">
          <button onClick={() => setSelectedPatient(null)}
            className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
            ← Back to Patient List
          </button>

          {/* Patient Header */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <span className="text-burgundy font-serif font-bold text-xl">{selectedPatient.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-lg font-serif font-semibold text-foreground">{selectedPatient.name}</h2>
                  <p className="text-sm font-sans text-muted-foreground">ID: {selectedPatient.patientId} · {selectedPatient.nationality} · {selectedPatient.gender}</p>
                  <p className="text-xs font-sans text-muted-foreground mt-0.5">{selectedPatient.phone} · {selectedPatient.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMsgModal({ open: true, name: selectedPatient.name, phone: selectedPatient.phone, type: "SMS" })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-info/10 text-info text-xs font-sans font-medium hover:bg-info/20 transition-colors">
                  <Phone size={12} /> SMS
                </button>
                <button onClick={() => setMsgModal({ open: true, name: selectedPatient.name, phone: selectedPatient.phone, type: "WhatsApp" })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20 transition-colors">
                  <MessageSquare size={12} /> WhatsApp
                </button>
                <button onClick={() => exportToExcel([selectedPatient], `patient-${selectedPatient.patientId}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
            <p className="text-[10px] font-sans text-muted-foreground/60 mt-2 italic">Data synced from Afiyati.royale.hayat.com portal</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-sans font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.id ? "bg-burgundy text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-section-bg"}`}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  ["Blood Type", selectedPatient.bloodType],
                  ["DOB", selectedPatient.dob],
                  ["Total Visits", String(selectedPatient.totalVisits)],
                  ["Last Visit", selectedPatient.lastVisit],
                  ["Status", selectedPatient.status],
                  ["Language", selectedPatient.language],
                  ["Emergency Contact", selectedPatient.emergencyContact],
                  ["Emergency Phone", selectedPatient.emergencyPhone],
                  ["Room", selectedPatient.roomNumber || "N/A"],
                  ["Departments", selectedPatient.departments.join(", ")],
                  ["Doctors", selectedPatient.doctors.join(", ")],
                  ["Notes", selectedPatient.notes || "None"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-sans text-muted-foreground">{label}</p>
                    <p className="text-sm font-sans font-medium text-foreground">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border bg-section-bg">
                    {["Date", "Department", "Doctor", "Type", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-sans font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {selectedPatient.appointments.map(apt => (
                      <tr key={apt.id} className="border-b border-border">
                        <td className="px-4 py-2 text-sm font-sans">{apt.date}</td>
                        <td className="px-4 py-2 text-sm font-sans text-muted-foreground">{apt.department}</td>
                        <td className="px-4 py-2 text-sm font-sans text-muted-foreground">{apt.doctor}</td>
                        <td className="px-4 py-2 text-sm font-sans text-muted-foreground">{apt.type}</td>
                        <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${apt.status === "Completed" ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}>{apt.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-2">
                {selectedPatient.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-burgundy" />
                      <div>
                        <p className="text-sm font-sans font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs font-sans text-muted-foreground">{doc.type} · {doc.size} · {doc.uploadDate}</p>
                      </div>
                    </div>
                    <button className="text-xs font-sans text-burgundy hover:text-burgundy-deep font-medium">Download</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "financials" && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    ["Total Billed", `${selectedPatient.financials.totalBilled} ${selectedPatient.financials.currency}`],
                    ["Total Paid", `${selectedPatient.financials.totalPaid} ${selectedPatient.financials.currency}`],
                    ["Outstanding", `${selectedPatient.financials.outstanding} ${selectedPatient.financials.currency}`],
                    ["Insurance Covered", `${selectedPatient.financials.insuranceCovered} ${selectedPatient.financials.currency}`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-section-bg rounded-lg p-3">
                      <p className="text-xs font-sans text-muted-foreground">{label}</p>
                      <p className="text-lg font-serif font-bold text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
                <h4 className="text-sm font-sans font-semibold text-foreground mb-2">Invoices</h4>
                {selectedPatient.financials.invoices.map(inv => (
                  <div key={inv.id} className="flex justify-between py-2 border-b border-border text-sm font-sans">
                    <span>{inv.date}</span>
                    <span>{inv.amount} KWD</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === "Paid" ? "bg-success/10 text-success" : inv.status === "Pending" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "services" && (
              <div className="flex flex-wrap gap-2">
                {selectedPatient.services.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-section-bg text-sm font-sans text-foreground border border-border">{s}</span>
                ))}
                {selectedPatient.utilitiesUsed.map(u => (
                  <span key={u} className="px-3 py-1.5 rounded-full bg-gold/10 text-sm font-sans text-gold border border-gold/20">{u}</span>
                ))}
              </div>
            )}

            {activeTab === "admission" && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Check-in", selectedPatient.checkIn || "N/A"],
                  ["Check-out", selectedPatient.checkOut || "N/A"],
                  ["Room Number", selectedPatient.roomNumber || "N/A"],
                  ["Status", selectedPatient.status],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-sans text-muted-foreground">{label}</p>
                    <p className="text-sm font-sans font-medium text-foreground">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "insurance" && (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Insurance Provider", selectedPatient.insurance],
                  ["Insurance ID", selectedPatient.insuranceId],
                  ["Coverage", selectedPatient.financials.insuranceCovered + " KWD"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-sans text-muted-foreground">{label}</p>
                    <p className="text-sm font-sans font-medium text-foreground">{String(val)}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "communications" && (
              <div className="space-y-2">
                {selectedPatient.communications.map(comm => (
                  <div key={comm.id} className="flex items-start gap-3 py-2 border-b border-border">
                    <div className={`p-1.5 rounded-lg ${comm.type === "SMS" ? "bg-info/10 text-info" : comm.type === "WhatsApp" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {comm.type === "WhatsApp" ? <MessageSquare size={14} /> : <Phone size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-sans text-foreground">{comm.message}</p>
                      <p className="text-xs font-sans text-muted-foreground">{comm.date} · {comm.direction} · {comm.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Patient List */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search by name or ID..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-section-bg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
              </div>
              <div className="flex gap-2">
                {["All", "Active", "Discharged", "Scheduled"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors
                      ${filterStatus === s ? "bg-burgundy text-primary-foreground" : "bg-section-bg text-muted-foreground hover:bg-border"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20 transition-colors">
                <Download size={13} /> Export Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-section-bg">
                    {["Patient ID", "Name", "Phone", "Nationality", "Insurance", "Status", "Last Visit", "Visits", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 25).map(patient => (
                    <tr key={patient.id} className="border-b border-border hover:bg-section-bg/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPatient(patient)}>
                      <td className="px-4 py-3 text-sm font-sans font-mono text-muted-foreground">{patient.patientId}</td>
                      <td className="px-4 py-3 text-sm font-sans font-medium text-foreground">{patient.name}</td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{patient.phone}</td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{patient.nationality}</td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{patient.insurance}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[patient.status]}`}>{patient.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{patient.lastVisit}</td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{patient.totalVisits}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedPatient(patient)} className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                          <button onClick={() => setMsgModal({ open: true, name: patient.name, phone: patient.phone, type: "SMS" })}
                            className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-info"><Phone size={14} /></button>
                          <button onClick={() => setMsgModal({ open: true, name: patient.name, phone: patient.phone, type: "WhatsApp" })}
                            className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-success"><MessageSquare size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-border text-xs font-sans text-muted-foreground">
              Showing {Math.min(25, filtered.length)} of {filtered.length} patients
            </div>
          </div>
        </>
      )}
      <MessageModal isOpen={msgModal.open} onClose={() => setMsgModal({ ...msgModal, open: false })}
        patientName={msgModal.name} patientPhone={msgModal.phone} type={msgModal.type} />
    </AdminLayout>
  );
};

export default PatientRecords;
