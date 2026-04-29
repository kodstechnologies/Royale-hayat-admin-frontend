import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { CalendarPlus, Eye, EyeOff, Users, Clock, Search, Pencil, Trash2 } from "lucide-react";
import { createDoctor, deleteDoctor, editDoctor, getDoctors } from "@/api/doctors";
import CreateDoctor, { type CreateDoctorFormData } from "./doctor/createDoctor";

type Doctor = {
  _id: string;
  name: string;
  specialty: string;
  department: string;
  title: string;
  bio: string;
  qualifications: string[];
  expertise: string[];
  languages: string[];
  initials: string;
  color: string;
  symptoms: string[];
  availableOnline: boolean;
  image?: string;
  isActive: boolean;
};

type DoctorForm = {
  name: string;
  specialty: string;
  department: string;
  title: string;
  bio: string;
  qualifications: string;
  expertise: string;
  languages: string;
  initials: string;
  image: string;
  color: string;
  symptoms: string;
  availableOnline: boolean;
  isActive: boolean;
};

const initialForm: DoctorForm = {
  name: "",
  specialty: "",
  department: "",
  title: "",
  bio: "",
  qualifications: "",
  expertise: "",
  languages: "",
  initials: "",
  image: "",
  color: "#7f2346",
  symptoms: "",
  availableOnline: true,
  isActive: true,
};

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<DoctorForm>(initialForm);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getDoctors({ limit: 100 });
      setDoctors(response?.data?.data || []);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(doctors.map((d) => d.department))).filter(Boolean)],
    [doctors]
  );

  const filtered = useMemo(
    () =>
      doctors.filter((d) => {
        const query = search.toLowerCase().trim();
        const matchSearch =
          d.name.toLowerCase().includes(query) ||
          d.department.toLowerCase().includes(query) ||
          d.specialty.toLowerCase().includes(query);
        const matchDept = filterDept === "All" || d.department === filterDept;
        return matchSearch && matchDept;
      }),
    [doctors, filterDept, search]
  );

  const totalOnline = doctors.filter((d) => d.availableOnline).length;
  const totalVisible = doctors.filter((d) => d.isActive).length;

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name || "",
      specialty: doctor.specialty || "",
      department: doctor.department || "",
      title: doctor.title || "",
      bio: doctor.bio || "",
      qualifications: (doctor.qualifications || []).join(", "),
      expertise: (doctor.expertise || []).join(", "),
      languages: (doctor.languages || []).join(", "),
      initials: doctor.initials || "",
      image: doctor.image || "",
      color: doctor.color || "#7f2346",
      symptoms: (doctor.symptoms || []).join(", "),
      availableOnline: Boolean(doctor.availableOnline),
      isActive: Boolean(doctor.isActive),
    });
    setIsModalOpen(true);
  };

  const toArray = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleCreateDoctorFromModal = async (values: CreateDoctorFormData) => {
    setSaving(true);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("doctorId", values.doctorId.trim());
      payload.append("department", values.department.trim());
      payload.append("initials", values.initials.trim().toUpperCase());
      payload.append("name", values.name.trim());
      payload.append("specialty", values.specialty.trim());
      payload.append("title", values.title.trim());
      toArray(values.languages).forEach((item) => payload.append("languages", item));
      toArray(values.expertise).forEach((item) => payload.append("expertise", item));
      toArray(values.qualifications).forEach((item) => payload.append("qualifications", item));
      if (values.imageFile) {
        payload.append("image", values.imageFile);
      }
      await createDoctor(payload as any);
      setMessage("Doctor created successfully.");
      await fetchDoctors();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to create doctor.");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const department = form.department.trim();
      const image = form.image.trim();

      const payload = {
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        qualifications: toArray(form.qualifications),
        expertise: toArray(form.expertise),
        languages: toArray(form.languages),
        initials: form.initials.trim().toUpperCase(),
        ...(department ? { department } : {}),
        ...(image ? { image } : {}),
        color: form.color.trim(),
        symptoms: toArray(form.symptoms),
        availableOnline: form.availableOnline,
        isActive: form.isActive,
      };

      if (editingDoctor?._id) {
        await editDoctor(editingDoctor._id, payload);
        setMessage("Doctor updated successfully.");
      } else {
        await createDoctor(payload);
        setMessage("Doctor created successfully.");
      }

      setIsModalOpen(false);
      setEditingDoctor(null);
      setForm(initialForm);
      await fetchDoctors();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to save doctor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    const ok = window.confirm(`Delete ${doctor.name}?`);
    if (!ok) return;

    setMessage("");
    try {
      await deleteDoctor(doctor._id);
      setMessage("Doctor deleted successfully.");
      await fetchDoctors();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to delete doctor.");
    }
  };

  return (
    <AdminLayout title="Doctors">
     

      <div className="flex flex-wrap gap-3 mb-4">
        <CreateDoctor saving={saving} onSubmit={handleCreateDoctorFromModal} />
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading doctors...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doctor) => (
            <div key={doctor._id} className="bg-card rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                    <span className="text-burgundy font-serif font-bold text-lg">{doctor.name.split(" ").pop()?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-sans font-semibold text-foreground">{doctor.name}</p>
                    <p className="text-xs font-sans text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[11px] ${
                    doctor.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                  }`}
                >
                  {doctor.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="text-foreground">{doctor.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="text-foreground">{doctor.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online</span>
                  <span className="text-foreground">{doctor.availableOnline ? "Yes" : "No"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(doctor)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-xs"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-error text-error text-xs"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card rounded-lg border border-border p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-serif font-semibold">{editingDoctor ? "Update Doctor" : "Create Doctor"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-xs text-muted-foreground">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Initials (e.g. DR)" value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 px-2 py-1 rounded-lg border border-border" />
              <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="md:col-span-2 px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Qualifications (comma separated)" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Expertise (comma separated)" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Languages (comma separated)" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <input placeholder="Symptoms (comma separated)" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm" />
              <label className="text-xs flex items-center gap-2">
                <input type="checkbox" checked={form.availableOnline} onChange={(e) => setForm({ ...form, availableOnline: e.target.checked })} />
                Available Online
              </label>
              <label className="text-xs flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editingDoctor ? "Update Doctor" : "Create Doctor"}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md border border-border text-xs font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {message && <p className="text-xs text-muted-foreground mt-3">{message}</p>}
    </AdminLayout>
  );
};

export default Doctors;
