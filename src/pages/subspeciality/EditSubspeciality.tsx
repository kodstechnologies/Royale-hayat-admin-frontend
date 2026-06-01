import { useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import SubspecialityForm from "../../components/subspeciality/SubspecialityForm";

const EditSubspeciality = () => {
    const { id } = useParams();

    return (
        <AdminLayout title="Edit Subspeciality">
            <div className="space-y-4 sm:space-y-6">
                <SubspecialityForm mode="edit" subspecialityId={id} />
            </div>
        </AdminLayout>
    );
};

export default EditSubspeciality;