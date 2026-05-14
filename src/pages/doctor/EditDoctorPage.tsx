import { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import Loader from "@/components/SkeletonLoader";
import { Switch } from "@/components/ui/switch";
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

  if (loading) return <AdminLayout title="Edit Doctor"><Loader /></AdminLayout>;

  return (
    <AdminLayout title="Edit Doctor">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/doctors")}
          className="mb-4 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted"
        >
          Back to Doctors
        </button>
      </div>
      <div className="max-w-3xl mx-auto bg-card rounded-xl border border-border p-5">
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
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-medium">Doctor ID *</label><Field name="doctorId" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="doctorId" component="p" className="text-xs text-red-500 mt-1" /></div>
                <div>
                  <label className="text-xs font-medium">Department *</label>
                  <Field name="department">
                    {({ field, form }: { field: { value: string; name: string; onBlur: () => void }; form: { setFieldValue: (f: string, v: unknown) => void } }) => (
                      <select
                        name={field.name}
                        value={field.value}
                        onBlur={field.onBlur}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        onChange={(e) => {
                          const next = e.target.value;
                          form.setFieldValue("department", next);
                          form.setFieldValue("subspecialityIds", []);
                          void loadDepartmentSubspecialities(next);
                        }}
                      >
                        <option value="">Select department</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <ErrorMessage name="department" component="p" className="text-xs text-red-500 mt-1" />
                </div>
                <div><label className="text-xs font-medium">Initials</label><Field name="initials" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
                <div><label className="text-xs font-medium">Doctor Name *</label><Field name="name" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /><ErrorMessage name="name" component="p" className="text-xs text-red-500 mt-1" /></div>
                <div><label className="text-xs font-medium">Specialty</label><Field name="specialty" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
                <div><label className="text-xs font-medium">Title</label><Field name="title" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              </div>

              {values.department && (
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <label className="text-xs font-medium block mb-2">
                    Subspecialities <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  {deptSubsLoading ? (
                    <p className="text-xs text-muted-foreground">Loading subspecialities…</p>
                  ) : deptSubspecialities.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      This department has no linked subspecialities. Add them on the department edit screen.
                    </p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                      {deptSubspecialities.map((s) => (
                        <label key={s._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-background/80 rounded-md px-2 py-1">
                          <input
                            type="checkbox"
                            className="rounded border-border"
                            checked={values.subspecialityIds.includes(s._id)}
                            onChange={() =>
                              setFieldValue("subspecialityIds", toggleSubId(s._id, values.subspecialityIds))
                            }
                          />
                          <span>{s.name || s._id}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {values.subspecialityIds.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-2">{values.subspecialityIds.length} selected</p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Available online</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When on, this doctor can be booked online from the public site.
                  </p>
                </div>
                <Switch
                  checked={values.availableOnline}
                  onCheckedChange={(checked) => setFieldValue("availableOnline", checked)}
                  aria-label="Available online"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Languages</label>
                <div className="mt-1 flex gap-2">
                  <input value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <button type="button" onClick={() => { setFieldValue("languages", addUniqueItem(values.languages, languageInput)); setLanguageInput(""); }} className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs">Add</button>
                </div>
                {toItems(values.languages).length > 0 && <div className="mt-2 flex flex-wrap gap-2">{toItems(values.languages).map((item) => <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">{item}<button type="button" onClick={() => setFieldValue("languages", removeItem(values.languages, item))}>x</button></span>)}</div>}
              </div>

              <div>
                <label className="text-xs font-medium">Expertise</label>
                <div className="mt-1 space-y-2">
                  {toEditorRows(values.expertise).map((line, index) => (
                    <div key={`expertise-${index}`} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const next = [...toEditorRows(values.expertise)];
                          next[index] = e.target.value;
                          setFieldValue("expertise", toCommaSeparated(next));
                        }}
                        placeholder="Add expertise"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rows = toEditorRows(values.expertise);
                          if (rows.length <= 1) {
                            setFieldValue("expertise", "");
                            return;
                          }
                          const next = rows.filter((_, i) => i !== index);
                          setFieldValue("expertise", toCommaSeparated(next));
                        }}
                        className="shrink-0 p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                        title="Remove line"
                        aria-label="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rows = [...toEditorRows(values.expertise), ""];
                    setFieldValue("expertise", toCommaSeparated(rows));
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-burgundy/50 hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add line
                </button>
              </div>

              <div>
                <label className="text-xs font-medium">Qualifications</label>
                <div className="mt-1 space-y-2">
                  {toEditorRows(values.qualifications).map((line, index) => (
                    <div key={`qualification-${index}`} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const next = [...toEditorRows(values.qualifications)];
                          next[index] = e.target.value;
                          setFieldValue("qualifications", toCommaSeparated(next));
                        }}
                        placeholder="Add qualification"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const rows = toEditorRows(values.qualifications);
                          if (rows.length <= 1) {
                            setFieldValue("qualifications", "");
                            return;
                          }
                          const next = rows.filter((_, i) => i !== index);
                          setFieldValue("qualifications", toCommaSeparated(next));
                        }}
                        className="shrink-0 p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                        title="Remove line"
                        aria-label="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rows = [...toEditorRows(values.qualifications), ""];
                    setFieldValue("qualifications", toCommaSeparated(rows));
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-burgundy/50 hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add line
                </button>
              </div>

              <div>
                <label className="text-xs font-medium block mb-2">Doctor Image</label>
                <div
                  className={`relative rounded-lg border-2 border-dashed transition-all ${dragActive ? "border-burgundy bg-burgundy/5" : "border-border bg-muted/30"
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
                      if (file && file.type.startsWith("image/")) {
                        setFieldValue("imageFile", file);
                        setPreviewUrl(URL.createObjectURL(file));
                      } else if (file) {
                        toast.error("Please upload an image file", { position: "top-right" });
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    {previewUrl ? (
                      <div className="relative w-full">
                        <img src={previewUrl} alt="Preview" className="max-h-32 w-auto mx-auto rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl("");
                            setFieldValue("imageFile", null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-muted-foreground mb-1">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2"><button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button><button type="button" onClick={() => navigate("/doctors")} className="px-4 py-2 rounded-md border border-border text-xs font-medium">Cancel</button></div>
            </Form>
          )}
        </Formik>
      </div>
    </AdminLayout>
  );
};

export default EditDoctorPage;
