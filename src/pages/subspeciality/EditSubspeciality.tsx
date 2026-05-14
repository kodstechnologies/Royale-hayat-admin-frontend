import { useParams } from "react-router-dom";

import AdminLayout from "@/components/layout/AdminLayout";

import SubspecialityForm from "../../components/subspeciality/SubspecialityForm";

const EditSubspeciality = () => {
    const { id } = useParams();

    return (
        <AdminLayout title="Edit Subspeciality">
            <SubspecialityForm
                mode="edit"
                subspecialityId={id}
            />
        </AdminLayout>
    );
};

export default EditSubspeciality;