import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { UserPlus, Edit, Trash2, Shield, Search, MoreVertical, Key, Ban, CheckCircle, History, X } from "lucide-react";

type UserRole = {
  id: number; name: string; email: string; role: "Admin" | "Staff" | "Coordinator" | "Content Manager";
  status: "active" | "inactive" | "suspended"; lastLogin: string; department: string; phone: string;
  createdAt: string;
};

const usersData: UserRole[] = [
  { id: 1, name: "Abdullah Al-Rashid", email: "abdullah@royalehayat.com", role: "Admin", status: "active", lastLogin: "2026-04-08 09:30", department: "Administration", phone: "+965 5500 1234", createdAt: "2025-01-15" },
  { id: 2, name: "Hana Al-Dosari", email: "hana@royalehayat.com", role: "Coordinator", status: "active", lastLogin: "2026-04-08 08:15", department: "Patient Relations", phone: "+965 5500 2345", createdAt: "2025-03-20" },
  { id: 3, name: "Salma Ali", email: "salma@royalehayat.com", role: "Coordinator", status: "active", lastLogin: "2026-04-07 14:20", department: "International Patients", phone: "+965 5500 3456", createdAt: "2025-05-10" },
  { id: 4, name: "Omar Fahad", email: "omar@royalehayat.com", role: "Staff", status: "active", lastLogin: "2026-04-08 10:00", department: "Reception", phone: "+965 5500 4567", createdAt: "2025-06-01" },
  { id: 5, name: "Noor Hassan", email: "noor@royalehayat.com", role: "Content Manager", status: "inactive", lastLogin: "2026-04-01 11:00", department: "Marketing", phone: "+965 5500 5678", createdAt: "2025-02-28" },
  { id: 6, name: "Faisal Al-Kandari", email: "faisal@royalehayat.com", role: "Staff", status: "active", lastLogin: "2026-04-08 07:45", department: "Cardiology", phone: "+965 5500 6789", createdAt: "2025-07-15" },
  { id: 7, name: "Maha Al-Enezi", email: "maha@royalehayat.com", role: "Coordinator", status: "suspended", lastLogin: "2026-03-25 09:00", department: "Appointments", phone: "+965 5500 7890", createdAt: "2025-04-05" },
  { id: 8, name: "Tariq Jaber", email: "tariq@royalehayat.com", role: "Admin", status: "active", lastLogin: "2026-04-08 11:00", department: "IT", phone: "+965 5500 8901", createdAt: "2024-12-01" },
];

const roleColors: Record<string, string> = {
  Admin: "bg-burgundy/10 text-burgundy", Staff: "bg-info/10 text-info",
  Coordinator: "bg-gold/10 text-gold", "Content Manager": "bg-success/10 text-success",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-error/10 text-error",
};

const UsersRoles = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(usersData);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Staff" as UserRole["role"], department: "", phone: "" });

  const [activityLog] = useState([
    { id: 1, user: "Abdullah Al-Rashid", action: "Updated settings", time: "2 min ago" },
    { id: 2, user: "Hana Al-Dosari", action: "Approved appointment #1234", time: "15 min ago" },
    { id: 3, user: "Tariq Jaber", action: "Added new user Faisal", time: "1 hour ago" },
    { id: 4, user: "Salma Ali", action: "Replied to international enquiry", time: "2 hours ago" },
    { id: 5, user: "Omar Fahad", action: "Logged in", time: "3 hours ago" },
  ]);

  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers((prev) => [...prev, {
        id: Date.now(), name: newUser.name, email: newUser.email,
        role: newUser.role, status: "active", lastLogin: "Never",
        department: newUser.department, phone: newUser.phone, createdAt: new Date().toISOString().split("T")[0],
      }]);
      setNewUser({ name: "", email: "", role: "Staff", department: "", phone: "" });
      setShowAdd(false);
    }
  };

  const removeUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setActionMenuId(null);
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    setActionMenuId(null);
  };

  const updateRole = (id: number, role: UserRole["role"]) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
    setEditingUser(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "All" || u.role === filterRole;
    const matchStatus = filterStatus === "All" || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <AdminLayout title="Users & Roles">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="xl:col-span-3">
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                {["Admin", "Staff", "Coordinator", "Content Manager"].map((role) => (
                  <div key={role} className="flex items-center gap-1.5">
                    <Shield size={12} className="text-muted-foreground" />
                    <span className="text-xs font-sans text-muted-foreground">{role}: {users.filter((u) => u.role === role).length}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowAdd(!showAdd)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-burgundy text-primary-foreground text-xs font-sans font-medium hover:bg-burgundy-deep transition-colors">
                <UserPlus size={13} /> Add User
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-border flex flex-wrap gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search users..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
                <option value="All">All Roles</option>
                <option>Admin</option><option>Staff</option><option>Coordinator</option><option>Content Manager</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
                <option value="All">All Status</option>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
              </select>
            </div>

            {showAdd && (
              <div className="p-4 border-b border-border bg-section-bg/50 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-xs font-sans text-muted-foreground">Name</label>
                    <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="text-xs font-sans text-muted-foreground">Email</label>
                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="text-xs font-sans text-muted-foreground">Department</label>
                    <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold" />
                  </div>
                  <div>
                    <label className="text-xs font-sans text-muted-foreground">Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole["role"] })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold">
                      <option>Staff</option><option>Coordinator</option><option>Content Manager</option><option>Admin</option>
                    </select>
                  </div>
                  <button onClick={addUser}
                    className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors">
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-section-bg">
                    {["Name", "Role", "Department", "Status", "Last Login", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-section-bg/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/users/${user.id}`)}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-sans font-medium text-foreground">{user.name}</p>
                          <p className="text-xs font-sans text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${roleColors[user.role]}`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{user.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium capitalize ${statusColors[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{user.lastLogin}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                            className="p-1.5 rounded hover:bg-section-bg text-muted-foreground hover:text-foreground">
                            <MoreVertical size={14} />
                          </button>
                          {actionMenuId === user.id && (
                            <div className="absolute right-0 top-8 z-10 bg-card rounded-lg shadow-lg border border-border py-1 w-44 animate-fade-in">
                              <button onClick={() => { setEditingUser(user); setActionMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-foreground hover:bg-section-bg">
                                <Edit size={13} /> Edit Role
                              </button>
                              <button onClick={() => toggleStatus(user.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-foreground hover:bg-section-bg">
                                {user.status === "active" ? <Ban size={13} /> : <CheckCircle size={13} />}
                                {user.status === "active" ? "Suspend User" : "Activate User"}
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-foreground hover:bg-section-bg">
                                <Key size={13} /> Reset Password
                              </button>
                              <button onClick={() => removeUser(user.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-error hover:bg-section-bg">
                                <Trash2 size={13} /> Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Activity Log + User Detail */}
        <div className="space-y-4">
          {/* Activity Log */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <h3 className="font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
              <History size={16} /> Activity Log
            </h3>
            <div className="space-y-3">
              {activityLog.map((log) => (
                <div key={log.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                  <p className="text-xs font-sans font-medium text-foreground">{log.user}</p>
                  <p className="text-xs font-sans text-muted-foreground">{log.action}</p>
                  <p className="text-xs font-sans text-muted-foreground/60 mt-0.5">{log.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selected User Detail */}
          {selectedUser && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-semibold text-foreground text-sm">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{selectedUser.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground text-right">{selectedUser.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{selectedUser.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className={`px-2 py-0.5 rounded-full font-medium ${roleColors[selectedUser.role]}`}>{selectedUser.role}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="text-foreground">{selectedUser.department}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[selectedUser.status]}`}>{selectedUser.status}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground">{selectedUser.createdAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Login</span><span className="text-foreground">{selectedUser.lastLogin}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 w-80 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif font-semibold text-foreground mb-4">Change Role for {editingUser.name}</h3>
            <div className="space-y-2">
              {(["Admin", "Staff", "Coordinator", "Content Manager"] as UserRole["role"][]).map((role) => (
                <button key={role} onClick={() => updateRole(editingUser.id, role)}
                  className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-sans transition-colors border
                    ${editingUser.role === role ? "border-burgundy bg-burgundy/5 text-burgundy font-medium" : "border-border hover:bg-section-bg text-foreground"}`}>
                  {role}
                </button>
              ))}
            </div>
            <button onClick={() => setEditingUser(null)}
              className="mt-4 w-full py-2 rounded-md border border-border text-sm font-sans text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersRoles;
