// pages/departments/EditDepartment.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchAllCatagories, type Catagory } from "@/api/catagory";
import { fetchAllSubspecialities, type Subspeciality } from "@/api/subspeciality";
import { getDepartmentById, updateDepartment } from "@/api/department";
import {
  DepartmentRichFields,
  richContentFromApi,
  appendDepartmentRichContentToFormData,
  type DepartmentRichContentValues,
} from "@/pages/department/DepartmentFormShared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  description: string;
  catagory?: string | { _id: string; name?: string };
  subspecialities?: (string | { _id: string; name?: string })[];
  image?: string;
  isActive?: boolean;
  order?: number;
  customExplainantions?: any[];
};

export type EditDepartmentFormData = DepartmentRichContentValues & {
  departmentId: string;
  name: string;
  description: string;
  catagoryId: string;
  subspecialityIds: string[];
  imageFile: File | null;
  isActive: boolean;
  order: number;
};

const getCatagoryIdFromDepartment = (dept: Department | null): string => {
  if (!dept?.catagory) return "";
  const c = dept.catagory;
  if (typeof c === "string") return c;
  if (typeof c === "object" && c && "_id" in c) return String(c._id);
  return "";
};

const getSubspecialityIdsFromDepartment = (dept: Department | null): string[] => {
  if (!dept?.subspecialities?.length) return [];
  return dept.subspecialities.map((item) =>
    typeof item === "string" ? item : String(item._id),
  );
};

const EditDepartmentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Catagory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subspecialities, setSubspecialities] = useState<Subspeciality[]>([]);
  const [subspecialitiesLoading, setSubspecialitiesLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<EditDepartmentFormData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [departmentRes, cats, subs] = await Promise.all([
          getDepartmentById(id!),
          fetchAllCatagories(),
          fetchAllSubspecialities(),
        ]);
        
        const department = departmentRes?.data?.data;
        
        setCategories(cats);
        setSubspecialities(subs);
        
        setInitialValues({
          ...richContentFromApi(department as unknown as Record<string, unknown>),
          departmentId: department?.departmentId || "",
          name: department?.name || "",
          description: department?.description || "",
          catagoryId: getCatagoryIdFromDepartment(department),
          subspecialityIds: getSubspecialityIdsFromDepartment(department),
          imageFile: null,
          isActive: Boolean(department?.isActive),
          order: department?.order || 0,
        });
        
        if (department?.image) {
          setPreviewUrl(department.image);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load department.");
        navigate("/departments");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, setFieldValue: (field: string, value: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setFieldValue("imageFile", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Please upload an image file");
    }
  };

  const toggleSubspeciality = (
    id: string,
    current: string[],
    setFieldValue: (field: string, value: string[]) => void,
  ) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFieldValue("subspecialityIds", [...next]);
  };

  const handleSubmit = async (values: EditDepartmentFormData) => {
    const departmentId = values.departmentId.trim();
    const normalizedName = values.name.trim();
    const normalizedDescription = values.description.trim();

    if (!departmentId || !normalizedName || normalizedDescription.length < 10) {
      toast.error("Please provide Department ID, Name, and Description (min 10 characters).");
      return;
    }

    if (!values.catagoryId?.trim()) {
      toast.error("Please select a category.");
      return;
    }

    setSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("departmentId", departmentId);
      formPayload.append("name", normalizedName);
      formPayload.append("description", normalizedDescription);
      formPayload.append("isActive", String(values.isActive));
      formPayload.append("order", String(Number(values.order || 0)));
      formPayload.append("catagory", values.catagoryId.trim());
      formPayload.append("subspecialities", JSON.stringify(values.subspecialityIds));

      appendDepartmentRichContentToFormData(formPayload, {
        customExplainantions: values.customExplainantions,
      });

      if (values.imageFile) {
        formPayload.append("image", values.imageFile);
      }

      await updateDepartment(id!, formPayload);
      toast.success("Department updated successfully.");
      navigate("/departments");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to update department.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Department">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!initialValues) return null;

  return (
    <AdminLayout title="Edit Department">
      <div className="space-y-6">
        <BreadCrumb />
        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            

            <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
              {({ setFieldValue, values, touched, errors }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Department ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="departmentId"
                        value={values.departmentId}
                        onChange={(e) => setFieldValue("departmentId", e.target.value)}
                        placeholder="Enter department ID"
                        className="h-11"
                      />
                      <ErrorMessage name="departmentId" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                        placeholder="Enter department name"
                        className="h-11"
                      />
                      <ErrorMessage name="name" component="p" className="text-xs text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      name="description"
                      value={values.description}
                      onChange={(e) => setFieldValue("description", e.target.value)}
                      rows={4}
                      placeholder="Enter department description (min. 10 characters)"
                      className="resize-none"
                    />
                    <ErrorMessage name="description" component="p" className="text-xs text-red-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={values.catagoryId}
                        onChange={(e) => setFieldValue("catagoryId", e.target.value)}
                        disabled={categoriesLoading || categories.length === 0}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all disabled:opacity-60"
                      >
                        <option value="">{categoriesLoading ? "Loading categories…" : "Select a category"}</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <ErrorMessage name="catagoryId" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Status</label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={values.isActive}
                          onChange={(e) => setFieldValue("isActive", e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-burgundy focus:ring-burgundy"
                        />
                        <span className="text-sm text-slate-600">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Subspecialities <span className="text-slate-400 font-normal">(optional, multi-select)</span>
                    </label>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/30 p-3 space-y-2">
                      {subspecialitiesLoading ? (
                        <p className="text-sm text-slate-500 px-2 py-2">Loading subspecialities…</p>
                      ) : subspecialities.length === 0 ? (
                        <p className="text-sm text-amber-600 px-2 py-2">Add subspecialities under Subspecialities first.</p>
                      ) : (
                        subspecialities.map((s) => (
                          <label key={s._id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-burgundy focus:ring-burgundy"
                              checked={values.subspecialityIds.includes(s._id)}
                              onChange={() => toggleSubspeciality(s._id, values.subspecialityIds, setFieldValue)}
                            />
                            <span className="text-sm text-slate-700">{s.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {values.subspecialityIds.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">{values.subspecialityIds.length} selected</p>
                    )}
                  </div>

                  <DepartmentRichFields values={values} setFieldValue={setFieldValue} />

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Image (optional)</label>
                    <div
                      className={`relative rounded-xl border-2 border-dashed transition-all ${
                        dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-200 bg-slate-50/30"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, setFieldValue)}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] || null;
                          if (file) {
                            setFieldValue("imageFile", file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        {previewUrl ? (
                          <div className="relative">
                            <img src={previewUrl} alt="Preview" className="max-h-40 w-auto mx-auto rounded-lg object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl("");
                                setFieldValue("imageFile", null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 mb-1">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate("/departments")} className="gap-2">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditDepartmentPage;