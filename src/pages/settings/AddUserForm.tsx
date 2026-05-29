import { useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/constants/permissions";
import { toast } from "sonner";
import { createSubadmin } from "@/api/subadmin";

type Permission = {
  key: string;
  label: string;
};

const permissions: Permission[] = [
  {
    key: PERMISSIONS.APPOINTMENT_VIEW_ALL,
    label: "View All Appointment Requests",
  },
  {
    key: PERMISSIONS.APPOINTMENT_BOOKING_VIEW_ALL,
    label: "View All Bookings",
  },
  {
    key: PERMISSIONS.APPOINTMENT_REQUEST_ACCEPT,
    label: "Accept Appointment Request",
  },
  {
    key: PERMISSIONS.APPOINTMENT_CANCEL,
    label: "Cancel Appointment Request",
  },
];
const defaultPermissionKeys = permissions.map((permission) => permission.key);

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "call_center",
  });
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    defaultPermissionKeys
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSaved, setUserSaved] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      formData.role.trim().length > 0 &&
      selectedPermissions.length > 0
    );
  }, [formData.name, formData.email, formData.password, formData.role, selectedPermissions.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const response = await createSubadmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        permissions: selectedPermissions,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "call_center",
      });
      setSelectedPermissions(defaultPermissionKeys);
      setShowAddUserPassword(false);
      setUserSaved(true);
      toast.success(response?.message || "User added successfully");
      setTimeout(() => setUserSaved(false), 2500);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string; meta?: string[] } };
      };

      if (apiError.response?.data?.meta?.length) {
        apiError.response.data.meta.forEach((msg) => toast.error(msg));
      } else {
        toast.error(apiError.response?.data?.message || "Failed to add user");
      }
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter user name"
              className="h-11"
            />
          </div>
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
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="call_center">Call Center Executive</option>
            </select>
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
                  disabled
                  readOnly
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
            disabled={!canSubmit || isSubmitting}
            className="gap-2 bg-burgundy hover:bg-burgundy/90"
          >
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add User"}
          </Button>
        </div>
      </form>

      {userSaved && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-5 duration-300 z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              User added successfully!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserForm;
