import { useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resetPassword } from "@/api/auth";
import AddUserForm from "@/pages/settings/AddUserForm";

const SubAdmin = () => {
  const [activeTab, setActiveTab] = useState<"change-password" | "add-user">(
    "change-password"
  );

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = () => {
    let isValid = true;
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      const response = await resetPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSaved(true);
      toast.success(response?.message || "Password updated successfully");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string; meta?: string[] } };
      };

      if (apiError.response?.data?.meta?.length) {
        apiError.response.data.meta.forEach((msg) => toast.error(msg));
      } else {
        toast.error(apiError.response?.data?.message || "Failed to update password");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Settings</h3>
              <p className="text-sm text-slate-500 mt-1">
                Manage password and sub admin user access.
              </p>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setActiveTab("change-password")}
                className={
                  activeTab === "change-password"
                    ? "bg-burgundy hover:bg-burgundy/90"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }
              >
                Change Password
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("add-user")}
                className={
                  activeTab === "add-user"
                    ? "bg-burgundy hover:bg-burgundy/90"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }
              >
                Add User
              </Button>
            </div>

            {activeTab === "change-password" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-burgundy" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800">
                      Change Password
                    </h4>
                    <p className="text-xs text-slate-500">Update your account password</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className={`h-11 pr-11 ${
                          passwordErrors.currentPassword
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Enter new password (min. 6 characters)"
                        className={`h-11 pr-11 ${
                          passwordErrors.newPassword ? "border-red-500 focus:ring-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        className={`h-11 pr-11 ${
                          passwordErrors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="gap-2 bg-burgundy hover:bg-burgundy/90"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isChangingPassword ? "Updating..." : "Change Password"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "add-user" && <AddUserForm />}

            {passwordSaved && (
              <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-right-5 duration-300 z-50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">
                    Password updated successfully!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubAdmin;