import AdminLayout from "@/components/layout/AdminLayout";
import SubspecialityForm from "../../components/subspeciality/SubspecialityForm";

const CreateSubspeciality = () => {
    return (
        <AdminLayout title="Create Subspeciality">
            <div className="space-y-4 sm:space-y-6">
                <SubspecialityForm mode="create" />
            </div>
        </AdminLayout>
    );
};

export default CreateSubspeciality;