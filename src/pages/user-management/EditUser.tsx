import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import EditUserForm from "@/components/user-management/EditUserForm";
import { Button } from "@/components/ui/button";
import { getAllUsers, type AdminUser } from "@/api/auth";
import { toast } from "sonner";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const userFromNav = (location.state as { user?: AdminUser } | null)?.user;
  const [user, setUser] = useState<AdminUser | null>(
    userFromNav?._id === id ? userFromNav : null,
  );
  const [loading, setLoading] = useState(!user);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    if (userFromNav?._id === id) {
      setUser(userFromNav);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getAllUsers();
      const list = Array.isArray(response?.data) ? response.data : [];
      const found = list.find((u) => u._id === id) ?? null;
      setUser(found);
      if (!found) {
        toast.error("User not found");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id, userFromNav]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const goBack = () => navigate("/user-management");

  return (
    <AdminLayout title="Edit User">
      <div className="space-y-6">
        <BreadCrumb lastCrumbLabel={user?.name} />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">User Management</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Update user details, role, and permissions
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="gap-2 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to users
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-burgundy" />
                Loading user...
              </div>
            ) : user ? (
              <EditUserForm
                user={user}
                onSuccess={goBack}
                onCancel={goBack}
              />
            ) : (
              <div className="text-center py-16 text-slate-500">
                <p className="font-medium">User not found</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className="mt-4 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to users
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditUser;
