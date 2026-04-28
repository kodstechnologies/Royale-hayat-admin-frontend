import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, CalendarPlus, UserPlus, MessageSquare, ChevronDown, ChevronUp, Clock, Check, AlertTriangle, X, Download } from "lucide-react";
import { doctors, departments, exportToExcel } from "@/data/mockDatabase";

type AppointmentRequest = {
  id: number; patient: string; patientType: string; department: string;
  doctorPreference: string; symptoms: string; urgency: "urgent" | "normal" | "routine";
  language: string; insurance: string; records: boolean; status: "new" | "converted" | "pending_info" | "awaiting_confirmation";
  phone: string; email: string; requestDate: string; notes: string[];
  history: { date: string; action: string; by: string }[];
};

const requests: AppointmentRequest[] = [
  { id: 1, patient: "Sarah Al-Mutairi", patientType: "Returning", department: "Obstetrics & Gynecology", doctorPreference: "Dr. Layla Ahmed", symptoms: "Regular checkup, 32 weeks pregnant. Mild swelling in ankles.", urgency: "normal", language: "Arabic", insurance: "Gulf Insurance", records: true, status: "new", phone: "+965 5501 1234", email: "sarah@email.com", requestDate: "2026-04-09", notes: ["Patient prefers morning slot"], history: [{ date: "2026-04-09 10:00", action: "Request submitted online", by: "Patient" }] },
  { id: 2, patient: "James Wilson", patientType: "New (International)", department: "Cardiology", doctorPreference: "Any available", symptoms: "Chest pain, shortness of breath during exercise. Family history of heart disease.", urgency: "urgent", language: "English", insurance: "International Health Plan", records: false, status: "new", phone: "+44 7700 900123", email: "james.w@email.com", requestDate: "2026-04-09", notes: ["Traveling from UK", "Needs translator"], history: [{ date: "2026-04-09 08:30", action: "International enquiry received", by: "System" }] },
  { id: 3, patient: "Noura Al-Rashidi", patientType: "Returning", department: "Dermatology", doctorPreference: "Dr. Nadia Farouk", symptoms: "Skin rash, itching on arms and neck for 2 weeks. No known allergies.", urgency: "routine", language: "Arabic", insurance: "Wataniya Insurance", records: true, status: "converted", phone: "+965 5502 3456", email: "noura@email.com", requestDate: "2026-04-07", notes: ["Assigned to Apr 14"], history: [{ date: "2026-04-07 14:00", action: "Request submitted", by: "Patient" }, { date: "2026-04-08 09:00", action: "Converted to appointment", by: "Hana Al-Dosari" }] },
  { id: 4, patient: "Maria Garcia", patientType: "New (International)", department: "Pediatrics", doctorPreference: "Any female doctor", symptoms: "Child fever (39°C), persistent cough for 3 days. 4-year-old female.", urgency: "urgent", language: "English/Spanish", insurance: "None", records: false, status: "pending_info", phone: "+34 612 345 678", email: "maria.g@email.com", requestDate: "2026-04-08", notes: ["Insurance documents needed", "Requested Spanish translator"], history: [{ date: "2026-04-08 11:00", action: "Request submitted", by: "Patient" }, { date: "2026-04-08 14:00", action: "Info requested - insurance docs", by: "Salma Ali" }] },
  { id: 5, patient: "Khalid Ibrahim", patientType: "Returning", department: "Orthopedics", doctorPreference: "Dr. Reem Al-Fahad", symptoms: "Post-surgery follow-up. Knee replacement 6 weeks ago. Mild stiffness.", urgency: "normal", language: "Arabic", insurance: "AXA GIG", records: true, status: "new", phone: "+965 5503 4567", email: "khalid.i@email.com", requestDate: "2026-04-09", notes: [], history: [{ date: "2026-04-09 07:00", action: "Request submitted online", by: "Patient" }] },
  { id: 6, patient: "Fatima Al-Sabah", patientType: "Returning", department: "Internal Medicine", doctorPreference: "Dr. Fatima Al-Sabah", symptoms: "Diabetes management follow-up. HbA1c review needed.", urgency: "routine", language: "Arabic/English", insurance: "Gulf Insurance", records: true, status: "new", phone: "+965 5504 5678", email: "fatima.s@email.com", requestDate: "2026-04-09", notes: ["VIP patient"], history: [{ date: "2026-04-09 09:30", action: "Request submitted by phone", by: "Reception" }] },
  { id: 7, patient: "Chen Wei", patientType: "New (International)", department: "Neurology", doctorPreference: "Dr. Youssef Mansour", symptoms: "Recurring headaches, dizziness, blurred vision for 1 month.", urgency: "urgent", language: "Mandarin/English", insurance: "PICC Health", records: false, status: "new", phone: "+86 138 0013 8000", email: "chen.w@email.com", requestDate: "2026-04-09", notes: ["Needs Mandarin translator", "Arriving Apr 12"], history: [{ date: "2026-04-09 06:00", action: "International enquiry received", by: "System" }] },
  { id: 8, patient: "Abdullah Al-Fadhli", patientType: "Returning", department: "ENT", doctorPreference: "Dr. Sami Haddad", symptoms: "Chronic sinusitis, nasal congestion. Previous surgery 2 years ago.", urgency: "normal", language: "Arabic", insurance: "Kuwait Insurance", records: true, status: "awaiting_confirmation", phone: "+965 5505 6789", email: "abdullah.f@email.com", requestDate: "2026-04-08", notes: ["Dr. Haddad booking closed - confirmation requested"], history: [{ date: "2026-04-08 10:00", action: "Request submitted", by: "Patient" }, { date: "2026-04-08 15:00", action: "Doctor confirmation requested", by: "Hana Al-Dosari" }] },
];

const urgencyStyles: Record<string, string> = {
  urgent: "bg-error/10 text-error", normal: "bg-info/10 text-info", routine: "bg-success/10 text-success",
};
const statusStyles: Record<string, string> = {
  new: "bg-info/10 text-info", converted: "bg-success/10 text-success", pending_info: "bg-warning/10 text-warning", awaiting_confirmation: "bg-gold/10 text-gold",
};

const AppointmentRequests = () => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [data, setData] = useState(requests);
  const [showDoctorModal, setShowDoctorModal] = useState<{ reqId: number; dept: string } | null>(null);
  const [confirmDoctor, setConfirmDoctor] = useState<{ reqId: number; doctor: string } | null>(null);
  const [confirmConvert, setConfirmConvert] = useState<number | null>(null);
  const [confirmDoctorName, setConfirmDoctorName] = useState("");
  const [confirmDeptName, setConfirmDeptName] = useState("");

  const convertToAppointment = (id: number) => {
    const req = data.find(r => r.id === id);
    if (req) {
      setConfirmConvert(id);
      setConfirmDoctorName(req.doctorPreference);
      setConfirmDeptName(req.department);
    }
  };

  const finalizeConversion = () => {
    if (confirmConvert === null) return;
    setData(prev => prev.map(r => r.id === confirmConvert ? { ...r, status: "converted" as const, history: [...r.history, { date: new Date().toISOString(), action: `Confirmed by ${confirmDoctorName} (${confirmDeptName}). Converted to appointment.`, by: "Admin" }] } : r));
    setConfirmConvert(null);
    setConfirmDoctorName("");
    setConfirmDeptName("");
  };

  const requestInfo = (id: number) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status: "pending_info" as const, history: [...r.history, { date: new Date().toISOString(), action: "Additional info requested", by: "Admin" }] } : r));
  };

  const assignDoctor = (reqId: number, doctorName: string) => {
    const doc = doctors.find(d => d.name === doctorName);
    if (doc && !doc.bookingOpen) {
      setConfirmDoctor({ reqId, doctor: doctorName });
      setShowDoctorModal(null);
      return;
    }
    setData(prev => prev.map(r => r.id === reqId ? { ...r, doctorPreference: doctorName, history: [...r.history, { date: new Date().toISOString(), action: `Doctor assigned: ${doctorName}`, by: "Admin" }] } : r));
    setShowDoctorModal(null);
  };

  const requestDoctorConfirmation = (reqId: number, doctorName: string) => {
    setData(prev => prev.map(r => r.id === reqId ? { ...r, status: "awaiting_confirmation" as const, doctorPreference: doctorName, history: [...r.history, { date: new Date().toISOString(), action: `Confirmation requested from ${doctorName}`, by: "Admin" }] } : r));
    setConfirmDoctor(null);
  };

  const getDeptDoctors = (dept: string) => doctors.filter(d => d.department === dept);

  return (
    <AdminLayout title="Appointment Requests">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 text-xs font-sans">
          <span className="px-2 py-1 rounded bg-info/10 text-info">{t("New")}: {data.filter(r => r.status === "new").length}</span>
          <span className="px-2 py-1 rounded bg-warning/10 text-warning">{t("Pending")}: {data.filter(r => r.status === "pending_info").length}</span>
          <span className="px-2 py-1 rounded bg-gold/10 text-gold">{t("Awaiting")}: {data.filter(r => r.status === "awaiting_confirmation").length}</span>
          <span className="px-2 py-1 rounded bg-success/10 text-success">{t("Converted")}: {data.filter(r => r.status === "converted").length}</span>
        </div>
        <button onClick={() => exportToExcel(data.map(r => ({ Patient: r.patient, Department: r.department, Doctor: r.doctorPreference, Urgency: r.urgency, Status: r.status, Date: r.requestDate })), "appointment-requests")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success/10 text-success text-xs font-sans font-medium hover:bg-success/20"><Download size={13} /> {t("Export")}</button>
      </div>

      <div className="space-y-3">
        {data.map((req) => (
          <div key={req.id} className="bg-card rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-section-bg/50 transition-colors"
              onClick={() => setExpanded(expanded === req.id ? null : req.id)}>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-sans font-medium text-foreground">{req.patient}</p>
                  <p className="text-xs font-sans text-muted-foreground">{req.department} · {req.patientType} · {req.requestDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${urgencyStyles[req.urgency]}`}>{t(req.urgency)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${statusStyles[req.status]}`}>{t(req.status.replace(/_/g, " "))}</span>
                {expanded === req.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </div>

            {expanded === req.id && (
              <div className="px-4 pb-4 border-t border-border pt-4 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    [t("Doctor Preference"), req.doctorPreference], [t("Language"), req.language],
                    [t("Insurance"), req.insurance], [t("Records Uploaded"), req.records ? t("Yes") + " ✓" : t("No") + " ✗"],
                    [t("Phone"), req.phone], [t("Email"), req.email],
                    [t("Patient Type"), req.patientType], [t("Request Date"), req.requestDate],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-xs font-sans text-muted-foreground">{label}</p>
                      <p className="text-sm font-sans font-medium text-foreground">{val}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-sans text-muted-foreground">{t("Symptoms / Reason")}</p>
                  <p className="text-sm font-sans text-foreground">{req.symptoms}</p>
                </div>

                <div className="mb-4 bg-section-bg rounded-lg p-3">
                  <p className="text-xs font-sans font-semibold text-foreground mb-2">{t("Available Doctors in")} {req.department}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getDeptDoctors(req.department).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-card rounded p-2 border border-border">
                        <div>
                          <p className="text-xs font-sans font-medium text-foreground">{doc.name}</p>
                          <p className="text-[10px] font-sans text-muted-foreground">{doc.availability} · {t("Next")}: {doc.nextAvailable}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium ${doc.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                          {doc.bookingOpen ? t("Available") : t("Unavailable")}
                        </span>
                      </div>
                    ))}
                    {getDeptDoctors(req.department).length === 0 && (
                      <p className="text-xs font-sans text-muted-foreground">{t("No data available")}</p>
                    )}
                  </div>
                </div>

                {req.notes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-sans text-muted-foreground font-semibold">{t("Notes")}</p>
                    {req.notes.map((note, i) => (
                      <p key={i} className="text-xs font-sans text-foreground mt-0.5">• {note}</p>
                    ))}
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-sans text-muted-foreground font-semibold mb-1">{t("Request History")}</p>
                  {req.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-sans text-muted-foreground py-0.5">
                      <Clock size={10} />
                      <span>{h.date.substring(0, 16)}</span>
                      <span className="text-foreground">{h.action}</span>
                      <span>by {h.by}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {req.status !== "converted" && (
                    <button onClick={() => convertToAppointment(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep transition-colors">
                      <CalendarPlus size={13} /> {t("Convert to Appointment")}
                    </button>
                  )}
                  <button onClick={() => setShowDoctorModal({ reqId: req.id, dept: req.department })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold text-accent-foreground text-xs font-sans font-medium hover:bg-gold-light transition-colors">
                    <UserPlus size={13} /> {t("Assign Doctor")}
                  </button>
                  <button onClick={() => requestInfo(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                    <MessageSquare size={13} /> {t("Request Info")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setShowDoctorModal(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 max-h-[80vh] overflow-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-semibold text-foreground">{t("Select Doctor")}</h3>
              <button onClick={() => setShowDoctorModal(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <p className="text-xs font-sans text-muted-foreground mb-3">{t("Department")}: {showDoctorModal.dept}</p>
            <div className="space-y-2">
              {getDeptDoctors(showDoctorModal.dept).map(doc => (
                <button key={doc.id} onClick={() => assignDoctor(showDoctorModal.reqId, doc.name)}
                  className="w-full text-left p-3 rounded-md border border-border hover:bg-section-bg transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-sans font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs font-sans text-muted-foreground">{doc.specialty}</p>
                      <p className="text-[10px] font-sans text-muted-foreground">{doc.availability} · {t("Next")}: {doc.nextAvailable}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${doc.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {doc.bookingOpen ? t("Open") : t("Closed")}
                    </span>
                  </div>
                </button>
              ))}
              {getDeptDoctors(showDoctorModal.dept).length === 0 && (
                <p className="text-sm font-sans text-muted-foreground text-center py-4">{t("No data available")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Unavailable Confirmation */}
      {confirmDoctor && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setConfirmDoctor(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-warning" />
              <h3 className="font-serif font-semibold text-foreground">{t("Doctor Unavailable")}</h3>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">
              <strong>{confirmDoctor.doctor}</strong> {t("currently has online booking")} <strong>{t("Closed")}</strong>. {t("Would you like to request confirmation from the doctor before assigning?")}
            </p>
            <div className="flex gap-2">
              <button onClick={() => requestDoctorConfirmation(confirmDoctor.reqId, confirmDoctor.doctor)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep transition-colors">
                <MessageSquare size={13} /> {t("Request Confirmation")}
              </button>
              <button onClick={() => setConfirmDoctor(null)}
                className="px-3 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Conversion Modal - asks if doctor and department confirmed */}
      {confirmConvert !== null && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setConfirmConvert(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-96 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarPlus size={18} className="text-burgundy" />
              <h3 className="font-serif font-semibold text-foreground">{t("Confirm Appointment")}</h3>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">
              {t("Has the confirmation been given by the doctor and department?")}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-sans text-muted-foreground">{t("Confirmed by Doctor")} *</label>
                <input type="text" value={confirmDoctorName} onChange={e => setConfirmDoctorName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
              </div>
              <div>
                <label className="text-xs font-sans text-muted-foreground">{t("Department")} *</label>
                <input type="text" value={confirmDeptName} onChange={e => setConfirmDeptName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={finalizeConversion} disabled={!confirmDoctorName.trim() || !confirmDeptName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep disabled:opacity-50 transition-colors">
                <Check size={13} /> {t("Confirm & Convert")}
              </button>
              <button onClick={() => setConfirmConvert(null)}
                className="px-3 py-2 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium hover:bg-border transition-colors">
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AppointmentRequests;
