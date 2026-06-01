import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateUser, type AdminUser } from "@/api/auth";
import { getAllPermissionOptions, filterAssignablePermissions } from "@/utils/permissionOptions";
import { applyViewPermissionRules } from "@/utils/permissionSelection";
import PermissionGroupsPicker from "@/components/user-management/PermissionGroupsPicker";

type EditUserFormProps = {
  user: AdminUser;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const permissionOptions = getAllPermissionOptions();

const EditUserForm = ({ user, onSuccess, onCancel }: EditUserFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setSelectedPermissions(
      applyViewPermissionRules(filterAssignablePermissions(user.permissions ?? [])),
    );
    setShowPassword(false);
  }, [user]);

  const canSubmit = useMemo(
    () =>
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.role.trim().length > 0 &&
      selectedPermissions.length > 0,
    [formData.name, formData.email, formData.role, selectedPermissions.length],
  );

  const selectAllPermissions = () => {
    setSelectedPermissions(
      applyViewPermissionRules(permissionOptions.map((p) => p.key)),
    );
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const payload: Parameters<typeof updateUser>[1] = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role.trim().replace(/\s+/g, "_").toLowerCase(),
        permissions: applyViewPermissionRules(
          filterAssignablePermissions(selectedPermissions),
        ),
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const response = await updateUser(user._id, payload);
      toast.success(response?.message || "User updated successfully");
      onSuccess?.();
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string; meta?: string[] } };
      };

      if (apiError.response?.data?.meta?.length) {
        apiError.response.data.meta.forEach((msg) => toast.error(msg));
      } else {
        toast.error(apiError.response?.data?.message || "Failed to update user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
          <Pencil className="h-5 w-5 text-burgundy" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-800">Edit User</h4>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Name</label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
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
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            New password (optional)
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Leave blank to keep current"
              className="h-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Role</label>
          <Input
            value={formData.role}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, role: e.target.value }))
            }
            placeholder="e.g. call_center, sub_admin"
            className="h-11"
          />
        </div>
      </div>

      <PermissionGroupsPicker
        selectedPermissions={selectedPermissions}
        onSelectionChange={setSelectedPermissions}
        onSelectAll={selectAllPermissions}
        onClearAll={clearAllPermissions}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="gap-2 bg-burgundy hover:bg-burgundy/90"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditUserForm;
