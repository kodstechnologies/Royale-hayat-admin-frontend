import { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Upload, X } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { editDoctor, getDoctorById } from "@/api/doctors";
import { getDepartments, getDepartmentById } from "@/api/department";

type FormDataType = {
  doctorId: string;
  name: string;
  department: string;
  subspecialityIds: string[];
  specialty: string;
  title: string;
  initials: string;
  availableOnline: boolean;
  languages: string;
  expertise: string;
  qualifications: string;
  imageFile: File | null;
};

const SEPARATOR = "|||";

const toItems = (value: string) => value.split(SEPARATOR).map((v) => v.trim()).filter(Boolean);
const removeItem = (value: string, itemToRemove: string) =>
  toItems(value)
    .filter((item) => item !== itemToRemove)
    .join(SEPARATOR);
const addUniqueItem = (value: string, next: string) => {
  const normalized = next.trim();
  if (!normalized) return value;
  const existing = toItems(value);
  if (existing.some((item) => item.toLowerCase() === normalized.toLowerCase())) return value;
  return [...existing, normalized].join(SEPARATOR);
};
const toEditorRows = (value: string) => {
  if (!value) return [""];
  const rows = value.split(SEPARATOR).map((row) => row.trim());
  return rows.length ? rows : [""];
};
const toCommaSeparated = (rows: string[]) =>
  rows
    .map((row) => row.trim())
    .join(SEPARATOR);

const toggleSubId = (id: string, current: string[]) => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return [...next];
};

const EditDoctorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [deptSubspecialities, setDeptSubspecialities] = useState<Array<{ _id: string; name: string }>>([]);
  const [deptSubsLoading, setDeptSubsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [initialValues, setInitialValues] = useState<FormDataType>({
    doctorId: "",
    name: "",
    department: "",
    subspecialityIds: [],
    specialty: "",
    title: "",
    initials: "",
    availableOnline: true,
    languages: "",
    expertise: "",
    qualifications: "",
    imageFile: null,
  });

  const loadDepartmentSubspecialities = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setDeptSubspecialities([]);
      return;
    }
    setDeptSubsLoading(true);
    try {
      const res = await getDepartmentById(departmentId);
      const dept = res?.data?.data;
      const raw = Array.isArray(dept?.subspecialities) ? dept.subspecialities : [];
      setDeptSubspecialities(
        raw
          .filter((s: { _id?: string }) => s && typeof s === "object" && s._id)
          .map((s: { _id: string; name?: string }) => ({ _id: String(s._id), name: String(s.name || "") })),
      );
    } catch {
      setDeptSubspecialities([]);
      toast.error("Could not load subspecialities for this department.", { position: "top-right" });
    } finally {
      setDeptSubsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const doctorRes = await getDoctorById(id);
        const doctor = doctorRes?.data?.data || {};
        const deptId =
          typeof doctor?.department === "string"
            ? doctor.department
            : doctor?.department?._id
              ? String(doctor.department._id)
              : "";
        const subIds = (Array.isArray(doctor?.subspecialities) ? doctor.subspecialities : [])
          .map((s: { _id?: string } | string) =>
            typeof s === "object" && s && "_id" in s ? String(s._id) : String(s),
          )
          .filter(Boolean);

        setInitialValues({
          doctorId: doctor?.doctorId || "",
          name: doctor?.name || "",
          department: deptId,
          subspecialityIds: subIds,
          specialty: doctor?.specialty || "",
          title: doctor?.title || "",
          initials: doctor?.initials || "",
          availableOnline: Boolean(doctor?.availableOnline),
          languages: (doctor?.languages || []).join(SEPARATOR),
          expertise: (doctor?.expertise || []).join(SEPARATOR),
          qualifications: (doctor?.qualifications || []).join(SEPARATOR),
          imageFile: null,
        });
        setPreviewUrl(doctor?.image || "");

        if (deptId) {
          void loadDepartmentSubspecialities(deptId);
        }

        try {
          const departmentRes = await getDepartments({ limit: 100 });
          const rawDepartments =
            departmentRes?.data?.data?.data ||
            departmentRes?.data?.data ||
            departmentRes?.data?.items ||
            [];
          setDepartments(
            (Array.isArray(rawDepartments) ? rawDepartments : []).filter(
              (d: { _id?: string; name?: string }) => d?._id && d?.name,
            ),
          );
        } catch {
          toast.error("Failed to fetch departments.", { position: "top-right" });
        }
      } catch {
        toast.error("Failed to load doctor details.", { position: "top-right" });
        navigate("/doctors");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, loadDepartmentSubspecialities]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, setFieldValue: (field: string, value: unknown) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      setFieldValue("imageFile", file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error("Please upload an image file", { position: "top-right" });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Doctor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Doctor">
      <div className="space-y-6">
        <BreadCrumb />

        {/* Main Card */}
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>
          
          <div className="p-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/doctors")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
             
            </div>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validate={(values) => {
                const errors: Partial<Record<keyof FormDataType, string>> = {};
                if (!values.doctorId.trim()) errors.doctorId = "Doctor ID is required";
                if (!values.name.trim()) errors.name = "Name is required";
                if (!values.department.trim()) errors.department = "Department is required";
                return errors;
              }}
              onSubmit={async (values) => {
                if (!id) return;
                setSaving(true);
                try {
                  const payload = new FormData();
                  payload.append("doctorId", values.doctorId.trim());
                  payload.append("name", values.name.trim());
                  payload.append("department", values.department.trim());
                  payload.append("subspecialities", JSON.stringify(values.subspecialityIds));
                  payload.append("availableOnline", String(values.availableOnline));
                  if (values.specialty.trim()) payload.append("specialty", values.specialty.trim());
                  if (values.title.trim()) payload.append("title", values.title.trim());
                  if (values.initials.trim()) payload.append("initials", values.initials.trim().toUpperCase());
                  toItems(values.languages).forEach((item) => payload.append("languages", item));
                  toItems(values.expertise).forEach((item) => payload.append("expertise", item));
                  toItems(values.qualifications).forEach((item) => payload.append("qualifications", item));
                  if (values.imageFile) payload.append("image", values.imageFile);
                  await editDoctor(id, payload);
                  toast.success("Doctor updated successfully.", { position: "top-right" });
                  navigate("/doctors");
                } catch (error: unknown) {
                  const err = error as { response?: { data?: { message?: string } } };
                  toast.error(err?.response?.data?.message || "Failed to update doctor.", { position: "top-right" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Doctor ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="doctorId"
                        value={values.doctorId}
                        onChange={(e) => setFieldValue("doctorId", e.target.value)}
                        placeholder="Enter doctor ID"
                        className="h-11"
                      />
                      <ErrorMessage name="doctorId" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={values.department}
                        onChange={(e) => {
                          const next = e.target.value;
                          setFieldValue("department", next);
                          setFieldValue("subspecialityIds", []);
                          void loadDepartmentSubspecialities(next);
                        }}
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                      >
                        <option value="">Select department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                      <ErrorMessage name="department" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Doctor Name *</label>
                      <Input
                        name="name"
                        value={values.name}
                        onChange={(e) => setFieldValue("name", e.target.value)}
                        placeholder="Enter doctor name"
                        className="h-11"
                      />
                      <ErrorMessage name="name" component="p" className="text-xs text-red-500" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Initials</label>
                      <Input
                        name="initials"
                        value={values.initials}
                        onChange={(e) => setFieldValue("initials", e.target.value.toUpperCase())}
                        placeholder="Enter initials (e.g., JD)"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Specialty</label>
                      <Input
                        name="specialty"
                        value={values.specialty}
                        onChange={(e) => setFieldValue("specialty", e.target.value)}
                        placeholder="Enter specialty"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Title</label>
                      <Input
                        name="title"
                        value={values.title}
                        onChange={(e) => setFieldValue("title", e.target.value)}
                        placeholder="Enter title (e.g., Consultant)"
                        className="h-11"
                      />
                    </div>
                  </div>

                  {values.department && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Subspecialities <span className="text-slate-400 font-normal">(optional, multi-select)</span>
                      </label>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/30 p-3 space-y-2">
                        {deptSubsLoading ? (
                          <p className="text-sm text-slate-500 px-2 py-2">Loading subspecialities…</p>
                        ) : deptSubspecialities.length === 0 ? (
                          <p className="text-sm text-amber-600 px-2 py-2">
                            This department has no linked subspecialities. Add them on the department edit screen.
                          </p>
                        ) : (
                          deptSubspecialities.map((s) => (
                            <label key={s._id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 text-burgundy focus:ring-burgundy"
                                checked={values.subspecialityIds.includes(s._id)}
                                onChange={() => setFieldValue("subspecialityIds", toggleSubId(s._id, values.subspecialityIds))}
                              />
                              <span className="text-sm text-slate-700">{s.name || s._id}</span>
                            </label>
                          ))
                        )}
                      </div>
                      {values.subspecialityIds.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">{values.subspecialityIds.length} selected</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Available online</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        When enabled, this doctor can be booked online from the public site.
                      </p>
                    </div>
                    <Switch
                      checked={values.availableOnline}
                      onCheckedChange={(checked) => setFieldValue("availableOnline", checked)}
                      aria-label="Available online"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Languages</label>
                    <div className="flex gap-2">
                      <Input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        placeholder="Enter language"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setFieldValue("languages", addUniqueItem(values.languages, languageInput));
                            setLanguageInput("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setFieldValue("languages", addUniqueItem(values.languages, languageInput));
                          setLanguageInput("");
                        }}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    {toItems(values.languages).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toItems(values.languages).map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                            {item}
                            <button
                              type="button"
                              onClick={() => setFieldValue("languages", removeItem(values.languages, item))}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Expertise</label>
                    <div className="space-y-2">
                      {toEditorRows(values.expertise).map((line, index) => (
                        <div key={`expertise-${index}`} className="flex gap-2">
                          <Input
                            value={line}
                            onChange={(e) => {
                              const next = [...toEditorRows(values.expertise)];
                              next[index] = e.target.value;
                              setFieldValue("expertise", toCommaSeparated(next));
                            }}
                            placeholder={`Expertise ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const rows = toEditorRows(values.expertise);
                              if (rows.length <= 1) {
                                setFieldValue("expertise", "");
                                return;
                              }
                              const next = rows.filter((_, i) => i !== index);
                              setFieldValue("expertise", toCommaSeparated(next));
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rows = [...toEditorRows(values.expertise), ""];
                        setFieldValue("expertise", toCommaSeparated(rows));
                      }}
                      className="mt-2 gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add expertise
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Qualifications</label>
                    <div className="space-y-2">
                      {toEditorRows(values.qualifications).map((line, index) => (
                        <div key={`qualification-${index}`} className="flex gap-2">
                          <Input
                            value={line}
                            onChange={(e) => {
                              const next = [...toEditorRows(values.qualifications)];
                              next[index] = e.target.value;
                              setFieldValue("qualifications", toCommaSeparated(next));
                            }}
                            placeholder={`Qualification ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const rows = toEditorRows(values.qualifications);
                              if (rows.length <= 1) {
                                setFieldValue("qualifications", "");
                                return;
                              }
                              const next = rows.filter((_, i) => i !== index);
                              setFieldValue("qualifications", toCommaSeparated(next));
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rows = [...toEditorRows(values.qualifications), ""];
                        setFieldValue("qualifications", toCommaSeparated(rows));
                      }}
                      className="mt-2 gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add qualification
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Doctor Image</label>
                    <div
                      className={`relative rounded-xl border-2 border-dashed transition-all ${dragActive ? "border-burgundy bg-burgundy/5" : "border-slate-200 bg-slate-50/30"}`}
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
                          if (file && file.type.startsWith("image/")) {
                            setFieldValue("imageFile", file);
                            setPreviewUrl(URL.createObjectURL(file));
                          } else if (file) {
                            toast.error("Please upload an image file", { position: "top-right" });
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
                    <Button variant="outline" onClick={() => navigate("/doctors")} className="gap-2">
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

export default EditDoctorPage;