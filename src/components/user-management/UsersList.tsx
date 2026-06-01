import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AlertBox from "@/components/AlertBox";
import {
  deleteUser,
  getAllUsers,
  updateUserStatus,
  type AdminUser,
} from "@/api/auth";
import { formatPermissionLabel } from "@/utils/permissionOptions";
import { PERMISSIONS } from "@/constants/permissions";
import PermissionGate, { hasPermission } from "@/utils/PermissionGate";

const formatRoleLabel = (role: string) =>
  role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const list = Array.isArray(response?.data) ? response.data : [];
      setUsers(list);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  const handleStatusToggle = async (user: AdminUser) => {
    if (!hasPermission(PERMISSIONS.USER_UPDATE)) return;
    const nextActive = user.isActive === false;
    setStatusUpdatingId(user._id);
    try {
      const response = await updateUserStatus(user._id, nextActive);
      toast.success(response?.message || "User status updated");
      await fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !hasPermission(PERMISSIONS.USER_DELETE)) return;
    setIsDeleting(true);
    try {
      const response = await deleteUser(deleteTarget._id);
      toast.success(response?.message || "User deleted successfully");
      setDeleteTarget(null);
      await fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-burgundy/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-burgundy" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-800">All Users</h4>
              <p className="text-xs text-slate-500">
                {users.length} user{users.length === 1 ? "" : "s"} registered
              </p>
            </div>
          </div>
          <PermissionGate permission={PERMISSIONS.USER_CREATE}>
            <Button
              onClick={() => navigate("/user-management/create")}
              className="gap-2 bg-burgundy hover:bg-burgundy/90 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          </PermissionGate>
        </div>

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="h-11 pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-burgundy" />
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Create your first user to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Permissions</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isActive = user.isActive !== false;
                  const isUpdating = statusUpdatingId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">{user.name}</td>
                      <td className="py-3 px-4 text-slate-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-burgundy/10 text-burgundy">
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-800">
                          {user.permissions?.length ?? 0}
                        </span>
                        <span className="text-slate-400 ml-1">assigned</span>
                        {user.permissions?.length ? (
                          <details className="mt-1">
                            <summary className="text-xs text-burgundy cursor-pointer hover:underline">
                              View list
                            </summary>
                            <ul className="mt-2 space-y-0.5 text-xs text-slate-500 max-w-xs">
                              {user.permissions.map((perm) => (
                                <li key={perm} title={perm}>
                                  {formatPermissionLabel(perm)}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/user-management/edit/${user._id}`, {
                                  state: { user },
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-burgundy hover:bg-burgundy/10"
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => void handleStatusToggle(user)}
                              className={`p-1.5 rounded-lg disabled:opacity-50 ${
                                isActive
                                  ? "text-amber-500 hover:bg-amber-50"
                                  : "text-emerald-500 hover:bg-emerald-50"
                              }`}
                              title={isActive ? "Deactivate user" : "Activate user"}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                          </PermissionGate>
                          <PermissionGate permission={PERMISSIONS.USER_DELETE}>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertBox
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDeleting={isDeleting}
      />
    </>
  );
};

export default UsersList;
