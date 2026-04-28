import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { ArrowLeft, Save, Shield, Mail, Phone, Building2, Calendar, Clock, Key, CheckCircle, Ban } from "lucide-react";

type UserRole = "Admin" | "Staff" | "Coordinator" | "Content Manager";

const allUsers = [
  { id: 1, name: "Abdullah Al-Rashid", email: "abdullah@royalehayat.com", role: "Admin" as UserRole, status: "active", lastLogin: "2026-04-08 09:30", department: "Administration", phone: "+965 5500 1234", createdAt: "2025-01-15", nationality: "Kuwaiti", employeeId: "RHH-001", position: "System Administrator", supervisor: "Dr. Mohammad Al-Sabah", emergencyContact: "+965 5500 9999", address: "Salmiya, Block 5, Kuwait", notes: "Full system access granted. Primary admin contact.", permissions: ["Dashboard", "Appointments", "Patients", "Doctors", "Departments", "Services", "Reports", "Users", "Settings", "Content", "Documents"] },
  { id: 2, name: "Hana Al-Dosari", email: "hana@royalehayat.com", role: "Coordinator" as UserRole, status: "active", lastLogin: "2026-04-08 08:15", department: "Patient Relations", phone: "+965 5500 2345", createdAt: "2025-03-20", nationality: "Kuwaiti", employeeId: "RHH-002", position: "Senior Patient Coordinator", supervisor: "Abdullah Al-Rashid", emergencyContact: "+965 5500 8888", address: "Hawally, Block 3, Kuwait", notes: "Handles VIP and international patient coordination.", permissions: ["Dashboard", "Appointments", "Patients", "Documents"] },
  { id: 3, name: "Salma Ali", email: "salma@royalehayat.com", role: "Coordinator" as UserRole, status: "active", lastLogin: "2026-04-07 14:20", department: "International Patients", phone: "+965 5500 3456", createdAt: "2025-05-10", nationality: "Egyptian", employeeId: "RHH-003", position: "International Patient Coordinator", supervisor: "Hana Al-Dosari", emergencyContact: "+965 5500 7777", address: "Farwaniya, Block 1, Kuwait", notes: "Fluent in Arabic, English, French.", permissions: ["Dashboard", "Appointments", "Patients", "International"] },
  { id: 4, name: "Omar Fahad", email: "omar@royalehayat.com", role: "Staff" as UserRole, status: "active", lastLogin: "2026-04-08 10:00", department: "Reception", phone: "+965 5500 4567", createdAt: "2025-06-01", nationality: "Kuwaiti", employeeId: "RHH-004", position: "Front Desk Officer", supervisor: "Hana Al-Dosari", emergencyContact: "+965 5500 6666", address: "Jabriya, Block 2, Kuwait", notes: "Morning shift coordinator.", permissions: ["Dashboard", "Appointments"] },
  { id: 5, name: "Noor Hassan", email: "noor@royalehayat.com", role: "Content Manager" as UserRole, status: "inactive", lastLogin: "2026-04-01 11:00", department: "Marketing", phone: "+965 5500 5678", createdAt: "2025-02-28", nationality: "Lebanese", employeeId: "RHH-005", position: "Digital Content Manager", supervisor: "Abdullah Al-Rashid", emergencyContact: "+965 5500 5555", address: "Mangaf, Block 4, Kuwait", notes: "Currently on leave.", permissions: ["Dashboard", "Content"] },
  { id: 6, name: "Faisal Al-Kandari", email: "faisal@royalehayat.com", role: "Staff" as UserRole, status: "active", lastLogin: "2026-04-08 07:45", department: "Cardiology", phone: "+965 5500 6789", createdAt: "2025-07-15", nationality: "Kuwaiti", employeeId: "RHH-006", position: "Department Assistant", supervisor: "Dr. Ahmad Khalil", emergencyContact: "+965 5500 4444", address: "Mishref, Block 6, Kuwait", notes: "Assists cardiology department operations.", permissions: ["Dashboard", "Appointments", "Patients"] },
  { id: 7, name: "Maha Al-Enezi", email: "maha@royalehayat.com", role: "Coordinator" as UserRole, status: "suspended", lastLogin: "2026-03-25 09:00", department: "Appointments", phone: "+965 5500 7890", createdAt: "2025-04-05", nationality: "Kuwaiti", employeeId: "RHH-007", position: "Appointments Coordinator", supervisor: "Abdullah Al-Rashid", emergencyContact: "+965 5500 3333", address: "Salwa, Block 8, Kuwait", notes: "Account suspended pending review.", permissions: ["Dashboard", "Appointments"] },
  { id: 8, name: "Tariq Jaber", email: "tariq@royalehayat.com", role: "Admin" as UserRole, status: "active", lastLogin: "2026-04-08 11:00", department: "IT", phone: "+965 5500 8901", createdAt: "2024-12-01", nationality: "Jordanian", employeeId: "RHH-008", position: "IT Manager", supervisor: "Dr. Mohammad Al-Sabah", emergencyContact: "+965 5500 2222", address: "Salmiya, Block 10, Kuwait", notes: "Manages IT infrastructure and security.", permissions: ["Dashboard", "Appointments", "Patients", "Doctors", "Departments", "Services", "Reports", "Users", "Settings", "Content", "Documents"] },
];

const roleColors: Record<string, string> = {
  Admin: "bg-burgundy/10 text-burgundy", Staff: "bg-info/10 text-info",
  Coordinator: "bg-gold/10 text-gold", "Content Manager": "bg-success/10 text-success",
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = allUsers.find(u => u.id === Number(id));
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || allUsers[0]);
  const [saved, setSaved] = useState(false);

  if (!user) return <AdminLayout title="User Not Found"><p className="text-muted-foreground font-sans">User not found.</p></AdminLayout>;

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div>
      <label className="text-xs font-sans text-muted-foreground mb-1 block">{label}</label>
      {editing ? (
        <input type="text" value={(form as any)[field] || value}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold bg-background" />
      ) : (
        <p className="text-sm font-sans text-foreground font-medium">{value}</p>
      )}
    </div>
  );

  return (
    <AdminLayout title={`User Profile – ${user.name}`}>
      <div className="max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate("/users")} className="flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Back to Users
          </button>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-sans text-success flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-md border border-border text-xs font-sans text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep">
                  <Save size={12} /> Save Changes
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep">
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy text-xl font-serif font-bold">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-serif font-bold text-foreground">{user.name}</h2>
              <p className="text-sm font-sans text-muted-foreground">{user.position} · {user.department}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium ${roleColors[user.role]}`}>{user.role}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-sans font-medium capitalize ${user.status === "active" ? "bg-success/10 text-success" : user.status === "suspended" ? "bg-error/10 text-error" : "bg-muted text-muted-foreground"}`}>{user.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Personal Info */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-4 flex items-center gap-2"><Mail size={14} /> Personal Information</h3>
            <div className="space-y-3">
              <Field label="Full Name" value={user.name} field="name" />
              <Field label="Email" value={user.email} field="email" />
              <Field label="Phone" value={user.phone} field="phone" />
              <Field label="Nationality" value={user.nationality} field="nationality" />
              <Field label="Address" value={user.address} field="address" />
              <Field label="Emergency Contact" value={user.emergencyContact} field="emergencyContact" />
            </div>
          </div>

          {/* Official Info */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-4 flex items-center gap-2"><Building2 size={14} /> Official Details</h3>
            <div className="space-y-3">
              <Field label="Employee ID" value={user.employeeId} field="employeeId" />
              <Field label="Position" value={user.position} field="position" />
              <Field label="Department" value={user.department} field="department" />
              <Field label="Supervisor" value={user.supervisor} field="supervisor" />
              <Field label="Date Joined" value={user.createdAt} field="createdAt" />
              <Field label="Last Login" value={user.lastLogin} field="lastLogin" />
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-4 flex items-center gap-2"><Shield size={14} /> Access & Permissions</h3>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map(p => (
                <span key={p} className="px-2 py-1 rounded-md bg-section-bg text-xs font-sans text-foreground border border-border">{p}</span>
              ))}
            </div>
            {editing && (
              <p className="text-[10px] font-sans text-muted-foreground mt-3">Permission changes require admin approval.</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-5">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-4 flex items-center gap-2"><Clock size={14} /> Notes & Actions</h3>
            <div className="space-y-3">
              {editing ? (
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold bg-background h-20 resize-none" />
              ) : (
                <p className="text-sm font-sans text-foreground">{user.notes}</p>
              )}
              <div className="flex gap-2 pt-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs font-sans text-muted-foreground hover:text-foreground">
                  <Key size={11} /> Reset Password
                </button>
                <button className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-sans ${user.status === "active" ? "border border-error/30 text-error hover:bg-error/5" : "border border-success/30 text-success hover:bg-success/5"}`}>
                  {user.status === "active" ? <><Ban size={11} /> Suspend</> : <><CheckCircle size={11} /> Activate</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserProfile;
