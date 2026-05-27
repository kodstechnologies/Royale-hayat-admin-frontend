import { useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Permission = {
  key: string;
  label: string;
};

const permissions: Permission[] = [
  { key: "dashboard", label: "Dashboard Access" },
  { key: "appointments", label: "Appointment Requests" },
  { key: "doctors", label: "Doctors Management" },
  { key: "departments", label: "Departments Management" },
  { key: "enquiries", label: "Enquiries Management" },
  { key: "reports", label: "Reports & Documents" },
  { key: "settings", label: "Settings Access" },
];

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [userSaved, setUserSaved] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      formData.role.trim().length > 0 &&
      selectedPermissions.length > 0
    );
  }, [formData.email, formData.password, formData.role, selectedPermissions.length]);

  const handlePermissionToggle = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((item) => item !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // UI-only behavior until API integration is wired.
    setUserSaved(true);
    setTimeout(() => setUserSaved(false), 2500);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-burgundy" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Add User</h4>
            <p className="text-xs text-slate-500">
              Enter credentials and choose permissions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter user email"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Input
                type={showAddUserPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter user password"
                className="h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showAddUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <Input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              placeholder="Enter role (e.g. Sub Admin)"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-burgundy" />
            <h5 className="text-sm font-semibold text-slate-700">Permissions</h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {permissions.map((permission) => (
              <label
                key={permission.key}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:border-burgundy/30 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.key)}
                  onChange={() => handlePermissionToggle(permission.key)}
                  className="h-4 w-4 accent-burgundy"
                />
                <span className="text-sm text-slate-700">{permission.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="gap-2 bg-burgundy hover:bg-burgundy/90"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </form>

      {userSaved && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-5 duration-300 z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              User UI data captured successfully!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserForm;
