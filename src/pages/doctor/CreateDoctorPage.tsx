import { useCallback, useEffect, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Upload, X, Globe, Languages, User, Award } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDepartments, mapApiDepartmentToListItem } from "@/api/department";
import { getSubspecialities, mapApiSubspecialityToListItem } from "@/api/subspeciality";
import { createDoctor } from "@/api/doctors";
import ExpertiseSectionsEditor from "@/components/doctor/ExpertiseSectionsEditor";
import {
  buildDoctorFormData,
  createEmptyExpertiseSection,
  DOCTOR_LIST_SEPARATOR as SEPARATOR,
  toItems,
  type DeptSubspecialityOption,
  type DoctorFormValues,
} from "@/lib/doctorForm";

const initialValues: DoctorFormValues = {
  doctorId: "",
  name: "",
  title: "",
  languages: "",
  expertiseSections: [createEmptyExpertiseSection()],
  qualifications: "",
  arabicName: "",
  arabicTitle: "",
  arabicLanguages: "",
  arabicQualifications: "",
  department: "",
  subspecialityIds: [],
  availableOnline: true,
  imageFile: null,
};

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

const CreateDoctorPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; arabicName: string }>>([]);
  const [deptSubspecialities, setDeptSubspecialities] = useState<DeptSubspecialityOption[]>([]);
  const [deptSubsLoading, setDeptSubsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [arabicLanguageInput, setArabicLanguageInput] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartments({ page: 1, limit: 100, sortBy: "order", sortOrder: "asc" });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setDepartments(
          list.map((row) => {
            const mapped = mapApiDepartmentToListItem(row);
            return { _id: mapped._id, name: mapped.name, arabicName: mapped.nameAr };
          }),
        );
      } catch {
        setDepartments([]);
      }
    };
    void loadDepartments();
  }, []);

  const loadDepartmentSubspecialities = useCallback(async (departmentId: string): Promise<DeptSubspecialityOption[]> => {
    if (!departmentId) {
      setDeptSubspecialities([]);
      return [];
    }
    setDeptSubsLoading(true);
    try {
      const res = await getSubspecialities({ department: departmentId, page: 1, limit: 100 });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const options = list.map((row) => {
        const mapped = mapApiSubspecialityToListItem(row);
        return { _id: mapped.id, name: mapped.name, arabicName: mapped.arabicName };
      });
      setDeptSubspecialities(options);
      return options;
    } catch {
      setDeptSubspecialities([]);
      return [];
    } finally {
      setDeptSubsLoading(false);
    }
  }, []);

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
      toast.error("Please upload an image file");
    }
  };

  const getSubspecialityDisplayName = (sub: typeof deptSubspecialities[0]) => {
    return activeTab === "arabic" ? sub.arabicName : sub.name;
  };

  const getDepartmentDisplayName = (dept: typeof departments[0]) => {
    return activeTab === "arabic" ? dept.arabicName : dept.name;
  };

  const handleSubmit = async (values: DoctorFormValues) => {
    if (!values.doctorId.trim()) {
      toast.error("Doctor ID is required");
      return;
    }
    if (!values.name.trim()) {
      toast.error("English Name is required");
      return;
    }
    if (!values.arabicName.trim()) {
      toast.error("Arabic Name is required");
      return;
    }
    if (!values.department.trim()) {
      toast.error("Department is required");
      return;
    }

    setSaving(true);

    try {
      const formData = buildDoctorFormData(values, deptSubspecialities);
      await createDoctor(formData);
      toast.success("Doctor created successfully");
      navigate("/doctors");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create doctor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Create Doctor">
      <div className="space-y-4 sm:space-y-6">
        <BreadCrumb />

        
        <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          <div className="p-4 sm:p-6">
            
            <div className="flex items-start gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group shrink-0"
                aria-label="Back to doctors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
              </button>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Create Doctor</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Fill in the details to create a new doctor profile</p>
              </div>
            </div>

            
            <div className="mb-6 sm:mb-8">
              <div className="flex gap-2 sm:gap-4 p-1 bg-slate-100/80 rounded-xl w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("english")}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === "english"
                      ? "bg-white text-burgundy shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                  `}
                >
                  <Globe className="h-4 w-4" />
                  English Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("arabic")}
                  className={`
                    flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === "arabic"
                      ? "bg-white text-burgundy shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }
                  `}
                >
                  <Languages className="h-4 w-4" />
                  Arabic Content
                </button>
              </div>
            </div>

            <Formik
              initialValues={initialValues}
              validate={(values) => {
                const errors: Partial<Record<keyof DoctorFormValues, string>> = {};
                if (!values.doctorId.trim()) errors.doctorId = "Doctor ID is required";
                if (!values.name.trim() && activeTab === "english") errors.name = "Name is required";
                if (!values.arabicName.trim() && activeTab === "arabic") errors.arabicName = "Arabic Name is required";
                if (!values.department.trim()) errors.department = "Department is required";
                return errors;
              }}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                  
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
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
                  </div>

                  
                  {activeTab === "english" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <User className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                              Doctor Name <span className="text-red-500">*</span>
                            </label>
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
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Languages</h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={languageInput}
                              onChange={(e) => setLanguageInput(e.target.value)}
                              placeholder="Enter language"
                              className="flex-1 h-11"
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
                              className="px-6"
                            >
                              Add
                            </Button>
                          </div>
                          {toItems(values.languages).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {toItems(values.languages).map((item) => (
                                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-burgundy/10 text-burgundy">
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => setFieldValue("languages", removeItem(values.languages, item))}
                                    className="hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Award className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Qualifications</h3>
                        </div>

                        <div className="space-y-3">
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
                                className="flex-1 h-11"
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
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-11 w-11"
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
                          className="mt-2 gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        >
                          <Plus className="h-3 w-3" />
                          Add qualification
                        </Button>
                      </div>

                      <ExpertiseSectionsEditor
                        lang="english"
                        sections={values.expertiseSections}
                        onChange={(sections) => setFieldValue("expertiseSections", sections)}
                      />
                    </div>
                  )}

                  
                  {activeTab === "arabic" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Languages className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information (Arabic)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                              Doctor Name (Arabic) <span className="text-red-500">*</span>
                            </label>
                            <Input
                              name="arabicName"
                              value={values.arabicName}
                              onChange={(e) => setFieldValue("arabicName", e.target.value)}
                              placeholder="اسم الطبيب"
                              className="h-11"
                              dir="rtl"
                            />
                            <ErrorMessage name="arabicName" component="p" className="text-xs text-red-500" />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Title (Arabic)</label>
                            <Input
                              name="arabicTitle"
                              value={values.arabicTitle}
                              onChange={(e) => setFieldValue("arabicTitle", e.target.value)}
                              placeholder="اللقب"
                              className="h-11"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Languages (Arabic)</h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={arabicLanguageInput}
                              onChange={(e) => setArabicLanguageInput(e.target.value)}
                              placeholder="أدخل اللغة"
                              className="flex-1 h-11"
                              dir="rtl"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  setFieldValue("arabicLanguages", addUniqueItem(values.arabicLanguages, arabicLanguageInput));
                                  setArabicLanguageInput("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                setFieldValue("arabicLanguages", addUniqueItem(values.arabicLanguages, arabicLanguageInput));
                                setArabicLanguageInput("");
                              }}
                              variant="outline"
                              className="px-6"
                            >
                              Add
                            </Button>
                          </div>
                          {toItems(values.arabicLanguages).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {toItems(values.arabicLanguages).map((item) => (
                                <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-burgundy/10 text-burgundy">
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => setFieldValue("arabicLanguages", removeItem(values.arabicLanguages, item))}
                                    className="hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Award className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Qualifications (Arabic)</h3>
                        </div>

                        <div className="space-y-3">
                          {toEditorRows(values.arabicQualifications).map((line, index) => (
                            <div key={`arabic-qualification-${index}`} className="flex gap-2">
                              <Input
                                value={line}
                                onChange={(e) => {
                                  const next = [...toEditorRows(values.arabicQualifications)];
                                  next[index] = e.target.value;
                                  setFieldValue("arabicQualifications", toCommaSeparated(next));
                                }}
                                placeholder={`المؤهل ${index + 1}`}
                                className="flex-1 h-11"
                                dir="rtl"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const rows = toEditorRows(values.arabicQualifications);
                                  if (rows.length <= 1) {
                                    setFieldValue("arabicQualifications", "");
                                    return;
                                  }
                                  const next = rows.filter((_, i) => i !== index);
                                  setFieldValue("arabicQualifications", toCommaSeparated(next));
                                }}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-11 w-11"
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
                            const rows = [...toEditorRows(values.arabicQualifications), ""];
                            setFieldValue("arabicQualifications", toCommaSeparated(rows));
                          }}
                          className="mt-2 gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        >
                          <Plus className="h-3 w-3" />
                          أضف مؤهلاً
                        </Button>
                      </div>

                      <ExpertiseSectionsEditor
                        lang="arabic"
                        sections={values.expertiseSections}
                        onChange={(sections) => setFieldValue("expertiseSections", sections)}
                      />
                    </div>
                  )}

                  
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={values.department}
                          onChange={(e) => {
                            const next = e.target.value;
                            setFieldValue("department", next);
                            if (!next) {
                              setFieldValue("subspecialityIds", []);
                              void loadDepartmentSubspecialities("");
                              return;
                            }
                            void loadDepartmentSubspecialities(next).then((subs) => {
                              setFieldValue(
                                "subspecialityIds",
                                subs.map((sub) => String(sub._id)).filter(Boolean),
                              );
                            });
                          }}
                          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        >
                          <option value="">Select department</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d._id}>
                              {getDepartmentDisplayName(d)}
                            </option>
                          ))}
                        </select>
                        <ErrorMessage name="department" component="p" className="text-xs text-red-500" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Available for online booking</label>
                        <div className="flex items-center gap-3 pt-2">
                          <Switch
                            checked={values.availableOnline}
                            onCheckedChange={(checked) => setFieldValue("availableOnline", checked)}
                            aria-label="Available online"
                          />
                          <span className="text-sm text-slate-600">
                            {values.availableOnline ? "Yes" : "No"}
                          </span>
                        </div>
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
                                  checked={values.subspecialityIds.some(
                                    (selectedId) => String(selectedId) === String(s._id),
                                  )}
                                  onChange={() => setFieldValue("subspecialityIds", toggleSubId(s._id, values.subspecialityIds))}
                                />
                                <span className="text-sm text-slate-700">{getSubspecialityDisplayName(s)}</span>
                              </label>
                            ))
                          )}
                        </div>
                        {values.subspecialityIds.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1">{values.subspecialityIds.length} selected</p>
                        )}
                      </div>
                    )}

                    
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
                              toast.error("Please upload an image file");
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
                  </div>

                  
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate("/doctors")} className="gap-2 w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90">
                      {saving ? "Creating..." : "Create Doctor"}
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

export default CreateDoctorPage;