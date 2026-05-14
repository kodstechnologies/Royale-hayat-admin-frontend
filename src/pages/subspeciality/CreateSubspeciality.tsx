import AdminLayout from "@/components/layout/AdminLayout";
import SubspecialityForm from "../../components/subspeciality/SubspecialityForm";

const CreateSubspeciality = () => {
    return (
        <AdminLayout title="Create Subspeciality">
            <SubspecialityForm mode="create" />
        </AdminLayout>
    );
};

export default CreateSubspeciality;