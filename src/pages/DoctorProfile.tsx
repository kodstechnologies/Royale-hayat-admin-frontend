import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { doctors as allDoctors } from "@/data/mockDatabase";
import { ArrowLeft, Edit, Save, X, Calendar, Clock, Star, Users, Eye, EyeOff, Image, Trash2, CalendarPlus } from "lucide-react";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const doctorData = allDoctors.find(d => d.id === Number(id));

  const [editing, setEditing] = useState(false);
  const [doctor, setDoctor] = useState(doctorData ? { ...doctorData } : null);
  const [editForm, setEditForm] = useState(doctorData ? { ...doctorData, bio: "Distinguished specialist with extensive experience in advanced medical procedures. Published researcher and member of multiple international medical associations.", expertise: ["Advanced Diagnostics", "Minimally Invasive Procedures", "Patient Care Excellence", "Research & Publications"], joinedDate: "2018-03-15", currentWork: "Full-time consultant and department lead." } : null);
  const [photos, setPhotos] = useState<string[]>(["Profile Photo"]);

  if (!doctor || !editForm) {
    return (
      <AdminLayout title={t("Doctor Profile")}>
        <div className="text-center py-10">
          <p className="text-muted-foreground font-sans">{t("No data available")}</p>
          <button onClick={() => navigate("/doctors")} className="mt-4 text-burgundy font-sans text-sm">← {t("Back")}</button>
        </div>
      </AdminLayout>
    );
  }

  const saveChanges = () => {
    setDoctor({ ...doctor, ...editForm });
    setEditing(false);
  };

  return (
    <AdminLayout title={t("Doctor Profile")}>
      <button onClick={() => navigate("/doctors")} className="flex items-center gap-1 text-sm font-sans text-burgundy hover:text-burgundy-deep mb-4">
        <ArrowLeft size={14} /> {t("Back")}
      </button>

      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-burgundy/10 flex items-center justify-center">
              <span className="text-burgundy font-serif font-bold text-2xl">{doctor.name.split(" ").pop()?.[0]}</span>
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground">{editing ? editForm.name : doctor.name}</h2>
              <p className="text-sm font-sans text-muted-foreground">{doctor.specialty} · {doctor.department}</p>
              <p className="text-xs font-sans text-muted-foreground mt-0.5">{doctor.qualifications} · {doctor.experience} {t("years experience")}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gold text-sm">★ {doctor.rating}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${doctor.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                  {doctor.bookingOpen ? t("Booking Open") : t("Booking Closed")}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${doctor.visible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {doctor.visible ? t("Visible") : t("Hidden")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={saveChanges} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium"><Save size={12} /> {t("Save")}</button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-section-bg text-muted-foreground text-xs font-sans font-medium"><X size={12} /> {t("Cancel")}</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium"><Edit size={12} /> {t("Edit Profile")}</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Profile Details")}</h3>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t("Name"), key: "name" }, { label: t("Specialty"), key: "specialty" },
                  { label: t("Department"), key: "department" }, { label: t("Qualifications"), key: "qualifications" },
                  { label: t("Phone"), key: "phone" }, { label: t("Email"), key: "email" },
                  { label: t("Availability"), key: "availability" }, { label: t("Joined Date"), key: "joinedDate" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-sans text-muted-foreground">{field.label}</label>
                    <input type="text" value={(editForm as any)[field.key] || ""} onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value } as any)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs font-sans text-muted-foreground">{t("Bio")}</label>
                  <textarea value={(editForm as any).bio || ""} onChange={e => setEditForm({ ...editForm, bio: e.target.value } as any)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-none" rows={3} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-sans text-muted-foreground">{t("Current Work")}</label>
                  <input type="text" value={(editForm as any).currentWork || ""} onChange={e => setEditForm({ ...editForm, currentWork: e.target.value } as any)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    [t("Name"), doctor.name], [t("Department"), doctor.department], [t("Specialty"), doctor.specialty],
                    [t("Qualifications"), doctor.qualifications], [t("Experience"), `${doctor.experience} years`], [t("Phone"), doctor.phone],
                    [t("Email"), doctor.email], [t("Languages"), doctor.languages.join(", ")], [t("Availability"), doctor.availability],
                    [t("Next Available"), doctor.nextAvailable], [t("Joined"), (editForm as any).joinedDate || "2018-03-15"], [t("Online Appts"), String(doctor.onlineAppointments)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] font-sans text-muted-foreground">{label}</p>
                      <p className="text-xs font-sans font-medium text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-sans text-muted-foreground">{t("Bio")}</p>
                  <p className="text-xs font-sans text-foreground">{(editForm as any).bio}</p>
                </div>
                <div>
                  <p className="text-[10px] font-sans text-muted-foreground">{t("Current Work")}</p>
                  <p className="text-xs font-sans text-foreground">{(editForm as any).currentWork}</p>
                </div>
                <div>
                  <p className="text-[10px] font-sans text-muted-foreground">{t("Expertise")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {((editForm as any).expertise || []).map((e: string) => (
                      <span key={e} className="px-2 py-0.5 rounded-full bg-section-bg text-[10px] font-sans text-foreground border border-border">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Statistics")}</h3>
            <div className="space-y-3">
              {[
                { icon: Users, label: t("Total Patients"), value: String(doctor.totalPatients) },
                { icon: CalendarPlus, label: t("Online Appointments"), value: String(doctor.onlineAppointments) },
                { icon: Star, label: t("Rating"), value: `★ ${doctor.rating}` },
                { icon: Clock, label: t("Next Available"), value: doctor.nextAvailable },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <s.icon size={13} className="text-muted-foreground" />
                    <span className="text-xs font-sans text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="text-xs font-sans font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Controls")}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-foreground">{t("Online Booking")}</span>
                <button onClick={() => setDoctor({ ...doctor, bookingOpen: !doctor.bookingOpen })}
                  className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-colors ${doctor.bookingOpen ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                  {doctor.bookingOpen ? t("Open") : t("Closed")}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-foreground">{t("Website Visibility")}</span>
                <button onClick={() => setDoctor({ ...doctor, visible: !doctor.visible })}
                  className={`p-1.5 rounded transition-colors ${doctor.visible ? "text-success" : "text-muted-foreground"}`}>
                  {doctor.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="font-serif font-semibold text-foreground mb-3 text-sm">{t("Photos")}</h3>
            <div className="space-y-2">
              {photos.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-section-bg rounded p-2">
                  <div className="flex items-center gap-2">
                    <Image size={14} className="text-muted-foreground" />
                    <span className="text-xs font-sans text-foreground">{p}</span>
                  </div>
                  <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="text-error hover:text-error/80"><Trash2 size={12} /></button>
                </div>
              ))}
              <button onClick={() => setPhotos([...photos, `Photo ${photos.length + 1}`])}
                className="w-full py-2 border-2 border-dashed border-border rounded-lg text-xs font-sans text-muted-foreground hover:border-burgundy hover:text-burgundy transition-colors">
                + {t("Add Photo")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DoctorProfile;
