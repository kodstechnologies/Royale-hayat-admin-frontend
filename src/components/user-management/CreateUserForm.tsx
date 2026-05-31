import { useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSubadmin } from "@/api/auth";
import { getAllPermissionOptions } from "@/utils/permissionOptions";
import { applyViewPermissionRules } from "@/utils/permissionSelection";
import PermissionGroupsPicker from "@/components/user-management/PermissionGroupsPicker";

type CreateUserFormProps = {
  onSuccess?: () => void;
};

const permissionOptions = getAllPermissionOptions();

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSaved, setUserSaved] = useState(false);

  const canSubmit = useMemo(
    () =>
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.password.trim().length >= 6 &&
      formData.role.trim().length > 0 &&
      selectedPermissions.length > 0,
    [
      formData.name,
      formData.email,
      formData.password,
      formData.role,
      selectedPermissions.length,
    ],
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
      const response = await createSubadmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role.trim().replace(/\s+/g, "_").toLowerCase(),
        permissions: applyViewPermissionRules(selectedPermissions),
      });

      setFormData({ name: "", email: "", password: "", role: "" });
      setSelectedPermissions([]);
      setShowPassword(false);
      setUserSaved(true);
      toast.success(response?.message || "User created successfully");
      setTimeout(() => setUserSaved(false), 2500);
      onSuccess?.();
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string; meta?: string[] } };
      };

      if (apiError.response?.data?.meta?.length) {
        apiError.response.data.meta.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          apiError.response?.data?.message || "Failed to create user",
        );
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
            <h4 className="text-lg font-semibold text-slate-800">Create User</h4>
            <p className="text-xs text-slate-500">
              Enter credentials, role, and assign permissions
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
              placeholder="Enter full name"
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
              placeholder="Enter email address"
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
                className="h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Role</label>
            <Input
              type="text"
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

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="gap-2 bg-burgundy hover:bg-burgundy/90"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>

      {userSaved && (
        <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-5 duration-300 z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              User created successfully!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateUserForm;
