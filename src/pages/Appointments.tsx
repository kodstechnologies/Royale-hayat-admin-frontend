import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import MessageModal from "@/components/MessageModal";
import { appointments as mockAppointments, doctors, exportToExcel, Appointment } from "@/data/mockDatabase";
import { Check, X, RefreshCw, Filter, Download, Phone, MessageSquare, MoreVertical, ChevronLeft, Calendar, Clock, FileText, Pill } from "lucide-react";

const statusStyles: Record<string, string> = {
  confirmed: "bg-success/10 text-success", pending: "bg-warning/10 text-warning",
  cancelled: "bg-error/10 text-error", rescheduled: "bg-info/10 text-info",
  completed: "bg-muted text-muted-foreground",
};

const timeSlots = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

const Appointments = () => {
  const [data, setData] = useState(mockAppointments);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [msgModal, setMsgModal] = useState<{ open: boolean; name: string; phone: string; type: "SMS" | "WhatsApp" }>({ open: false, name: "", phone: "", type: "SMS" });
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ apt: Appointment; action: string } | null>(null);

  const filtered = data.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = (id: number, status: Appointment["status"]) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setMenuOpen(null);
    setConfirmModal(null);
  };

  const handleReschedule = (id: number, time: string) => {
    setData(prev => prev.map(a => a.id === id ? { ...a, status: "rescheduled" as const, time } : a));
    setRescheduleModal(null);
  };

  const handleExport = () => {
    exportToExcel(filtered.map(a => ({
      Patient: a.patient, Department: a.department, Doctor: a.doctor,
      Date: a.date, Time: a.time, Type: a.type, Status: a.status, Source: a.source,
    })), "appointments-report");
  };

  if (selectedPatient) {
    return (
      <AdminLayout title="Appointments">
        <button onClick={() => setSelectedPatient(null)}
          className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
          <ChevronLeft size={14} /> Back to Appointments
        </button>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground">{selectedPatient.patient}</h2>
              <p className="text-sm font-sans text-muted-foreground">
                {selectedPatient.department} · {selectedPatient.doctor} · {selectedPatient.date} at {selectedPatient.time}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[selectedPatient.status]}`}>{selectedPatient.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2"><FileText size={14} /> Treatment Details</h3>
            <div className="space-y-2 text-sm font-sans">
              <div><p className="text-xs text-muted-foreground">Treatment Done</p><p className="text-foreground">General consultation and examination completed. Vitals recorded. Blood work ordered.</p></div>
              <div><p className="text-xs text-muted-foreground">Diagnosis</p><p className="text-foreground">Routine check-up - no concerns identified</p></div>
              <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-foreground">{selectedPatient.notes || "Patient in good condition. Continue current medication."}</p></div>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2"><Calendar size={14} /> Follow-up</h3>
            <div className="space-y-2 text-sm font-sans">
              <div><p className="text-xs text-muted-foreground">Next Follow-up</p><p className="text-foreground">2026-04-24 at 10:00 AM</p></div>
              <div><p className="text-xs text-muted-foreground">Follow-up Type</p><p className="text-foreground">Review lab results</p></div>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2"><Pill size={14} /> Prescribed Medications</h3>
            <div className="space-y-1.5">
              {["Paracetamol 500mg - Twice daily", "Vitamin D3 1000IU - Once daily", "Omeprazole 20mg - Before breakfast"].map(med => (
                <p key={med} className="text-sm font-sans text-foreground">• {med}</p>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3 flex items-center gap-2"><Clock size={14} /> Completion Details</h3>
            <div className="space-y-2 text-sm font-sans">
              <div><p className="text-xs text-muted-foreground">Duration</p><p className="text-foreground">35 minutes</p></div>
              <div><p className="text-xs text-muted-foreground">Completed By</p><p className="text-foreground">{selectedPatient.doctor}</p></div>
              <div><p className="text-xs text-muted-foreground">Billing</p><p className="text-foreground">45 KWD - Insurance covered</p></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Appointments">
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search patient or doctor..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] pl-4 pr-4 py-2 rounded-lg bg-section-bg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            {["all", "pending", "confirmed", "completed", "cancelled", "rescheduled"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-sans font-medium capitalize transition-colors
                  ${statusFilter === s ? "bg-burgundy text-primary-foreground" : "bg-section-bg text-muted-foreground hover:bg-border"}`}>
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
                {["Patient", "Department", "Doctor", "Date", "Time", "Type", "Source", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((apt) => (
                <tr key={apt.id} className="border-b border-border hover:bg-section-bg/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-sans font-medium text-foreground cursor-pointer hover:text-burgundy"
                    onClick={() => apt.status === "completed" && setSelectedPatient(apt)}>{apt.patient}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{apt.department}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{apt.doctor}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{apt.date}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{apt.time}</td>
                  <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{apt.type}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-section-bg text-muted-foreground">{apt.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[apt.status]}`}>{apt.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === apt.id ? null : apt.id)}
                        className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-foreground">
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === apt.id && (
                        <div className="absolute right-0 top-full mt-1 bg-card rounded-lg shadow-lg border border-border z-50 py-1 w-44 animate-fade-in">
                          <button onClick={() => setConfirmModal({ apt, action: "confirm" })} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-foreground"><Check size={12} /> Confirm</button>
                          <button onClick={() => setRescheduleModal(apt)} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-foreground"><RefreshCw size={12} /> Reschedule</button>
                          <button onClick={() => setConfirmModal({ apt, action: "cancel" })} className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-error"><X size={12} /> Cancel</button>
                          <button onClick={() => { setMsgModal({ open: true, name: apt.patient, phone: "+965 5500 1234", type: "SMS" }); setMenuOpen(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-foreground"><Phone size={12} /> Send SMS</button>
                          <button onClick={() => { setMsgModal({ open: true, name: apt.patient, phone: "+965 5500 1234", type: "WhatsApp" }); setMenuOpen(null); }}
                            className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-foreground"><MessageSquare size={12} /> WhatsApp</button>
                          {apt.status === "completed" && (
                            <button onClick={() => { setSelectedPatient(apt); setMenuOpen(null); }}
                              className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-section-bg flex items-center gap-2 text-burgundy"><FileText size={12} /> View Details</button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border text-xs font-sans text-muted-foreground">
          Showing {Math.min(20, filtered.length)} of {filtered.length} appointments
        </div>
      </div>

      
      {rescheduleModal && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setRescheduleModal(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleModal(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <p className="text-xs font-sans text-muted-foreground mb-3">Patient: {rescheduleModal.patient} · Doctor: {rescheduleModal.doctor}</p>
            <p className="text-xs font-sans font-semibold text-foreground mb-2">Available Slots</p>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-auto">
              {timeSlots.map(slot => (
                <button key={slot} onClick={() => handleReschedule(rescheduleModal.id, slot)}
                  className="px-3 py-2 rounded-md text-xs font-sans font-medium bg-section-bg text-foreground hover:bg-burgundy hover:text-primary-foreground transition-colors border border-border">
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {confirmModal && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setConfirmModal(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-semibold text-foreground mb-2">Confirm Action</h3>
            <p className="text-sm font-sans text-muted-foreground mb-4">
              Are you sure you want to <strong>{confirmModal.action}</strong> the appointment for <strong>{confirmModal.apt.patient}</strong>?
            </p>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(confirmModal.apt.id, confirmModal.action === "confirm" ? "confirmed" : "cancelled")}
                className="flex-1 px-3 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium">Yes, {confirmModal.action}</button>
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 px-3 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <MessageModal isOpen={msgModal.open} onClose={() => setMsgModal({ ...msgModal, open: false })}
        patientName={msgModal.name} patientPhone={msgModal.phone} type={msgModal.type} />
    </AdminLayout>
  );
};

export default Appointments;
