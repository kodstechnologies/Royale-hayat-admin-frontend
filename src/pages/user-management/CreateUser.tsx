import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import CreateUserForm from "@/components/user-management/CreateUserForm";

const CreateUser = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Create User">
      <div className="space-y-6">
        <BreadCrumb />

        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40" />

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">User Management</h3>
              <p className="text-sm text-slate-500 mt-1">
                Create a new admin user with role and permissions
              </p>
            </div>

            <CreateUserForm onSuccess={() => navigate("/user-management")} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateUser;
