import { useCallback, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Upload, X, Globe, Languages, Award, GraduationCap } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminDoctors } from "@/data/adminDoctors";
import { adminDepartments } from "@/data/departments";

type FormDataType = {
  doctorId: string;
  name: string;
  title: string;
  initials: string;
  languages: string;
  expertise: string;
  qualifications: string;
  arabicName: string;
  arabicTitle: string;
  arabicLanguages: string;
  arabicExpertise: string;
  arabicQualifications: string;
  department: string;
  subspecialityIds: string[];
  availableOnline: boolean;
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

const getStoredDoctors = () => {
  const stored = localStorage.getItem('rhh_doctors');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

const saveDoctorsToStorage = (doctors: any[]) => {
  localStorage.setItem('rhh_doctors', JSON.stringify(doctors));
};

const dummySubspecialities: Record<string, Array<{ _id: string; name: string; arabicName: string }>> = {
  dept1: [
    { _id: "sub1", name: "Interventional Cardiology", arabicName: "أمراض القلب التداخلية" },
    { _id: "sub2", name: "Pediatric Cardiology", arabicName: "أمراض قلب الأطفال" },
    { _id: "sub3", name: "Cardiac Electrophysiology", arabicName: "فيزيولوجيا القلب الكهربائية" },
  ],
  dept2: [
    { _id: "sub4", name: "Neuro Surgery", arabicName: "جراحة الأعصاب" },
    { _id: "sub5", name: "Pediatric Neurology", arabicName: "أعصاب الأطفال" },
    { _id: "sub6", name: "Stroke Neurology", arabicName: "أمراض السكتة الدماغية" },
  ],
  dept3: [
    { _id: "sub7", name: "Neonatology", arabicName: "حديثي الولادة" },
    { _id: "sub8", name: "Pediatric Emergency", arabicName: "طوارئ الأطفال" },
  ],
  dept4: [
    { _id: "sub9", name: "Sports Medicine", arabicName: "الطب الرياضي" },
    { _id: "sub10", name: "Joint Replacement", arabicName: "استبدال المفاصل" },
  ],
  dept5: [
    { _id: "sub11", name: "Cosmetic Dermatology", arabicName: "الأمراض الجلدية التجميلية" },
    { _id: "sub12", name: "Pediatric Dermatology", arabicName: "الأمراض الجلدية للأطفال" },
  ],
};

const EditDoctorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; arabicName?: string }>>([]);
  const [deptSubspecialities, setDeptSubspecialities] = useState<Array<{ _id: string; name: string; arabicName?: string }>>([]);
  const [deptSubsLoading, setDeptSubsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [arabicLanguageInput, setArabicLanguageInput] = useState("");
  const [isUserDoctor, setIsUserDoctor] = useState(false);
  const [initialValues, setInitialValues] = useState<FormDataType>({
    doctorId: "",
    name: "",
    title: "",
    initials: "",
    languages: "",
    expertise: "",
    qualifications: "",
    arabicName: "",
    arabicTitle: "",
    arabicLanguages: "",
    arabicExpertise: "",
    arabicQualifications: "",
    department: "",
    subspecialityIds: [],
    availableOnline: true,
    imageFile: null,
  });

  useEffect(() => {
    const deptOptions = adminDepartments.map(dept => ({
      _id: dept.id,
      name: dept.name,
      arabicName: dept.nameAr
    }));
    setDepartments(deptOptions);
  }, []);

  const loadDepartmentSubspecialities = useCallback((departmentId: string) => {
    if (!departmentId) {
      setDeptSubspecialities([]);
      return;
    }
    setDeptSubsLoading(true);
    setTimeout(() => {
      const subs = dummySubspecialities[departmentId] || [];
      setDeptSubspecialities(subs.map(s => ({ ...s, arabicName: s.arabicName })));
      setDeptSubsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const loadData = () => {
      if (!id) return;
      setLoading(true);

      setTimeout(() => {
        const userDoctors = getStoredDoctors();
        let foundDoctor = userDoctors.find((doc: any) => doc.id === id);
        let isUserCreated = true;
        let originalImage = "";

        if (!foundDoctor) {
          foundDoctor = adminDoctors.find(doc => doc.id === id);
          isUserCreated = false;
        }

        if (foundDoctor) {
          originalImage = foundDoctor.image || "";

          const deptObj = departments.find(d => d.name === foundDoctor.department);
          const deptId = deptObj?._id || "";

          setInitialValues({
            doctorId: foundDoctor.doctorId || "",
            name: foundDoctor.name || "",
            title: foundDoctor.title || "",
            initials: foundDoctor.initials || "",
            languages: (foundDoctor.languages || []).join(SEPARATOR),
            expertise: (foundDoctor.expertise || []).join(SEPARATOR),
            qualifications: (foundDoctor.qualifications || []).join(SEPARATOR),
            arabicName: foundDoctor.arabicName || "",
            arabicTitle: foundDoctor.arabicTitle || "",
            arabicLanguages: (foundDoctor.arabicLanguages || []).join(SEPARATOR),
            arabicExpertise: (foundDoctor.arabicExpertise || []).join(SEPARATOR),
            arabicQualifications: (foundDoctor.arabicQualifications || []).join(SEPARATOR),
            department: deptId,
            subspecialityIds: foundDoctor.subspecialityIds || [],
            availableOnline: foundDoctor.availableOnline !== undefined ? foundDoctor.availableOnline : true,
            imageFile: null,
          });
          setPreviewUrl(originalImage);
          setIsUserDoctor(isUserCreated);

          if (deptId) {
            loadDepartmentSubspecialities(deptId);
          }
        } else {
          toast.error("Doctor not found.");
          navigate("/doctors");
        }
        setLoading(false);
      }, 500);
    };

    if (departments.length > 0) {
      loadData();
    }
  }, [id, navigate, departments, loadDepartmentSubspecialities]);

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

  const getSubspecialityDisplayName = (sub: typeof deptSubspecialities[0]) => {
    return activeTab === "arabic" ? sub.arabicName || sub.name : sub.name;
  };

  const getDepartmentDisplayName = (dept: typeof departments[0]) => {
    return activeTab === "arabic" ? dept.arabicName || dept.name : dept.name;
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
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Edit Doctor</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Update doctor information</p>
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
              enableReinitialize
              initialValues={initialValues}
              validate={(values) => {
                const errors: Partial<Record<keyof FormDataType, string>> = {};
                if (!values.doctorId.trim()) errors.doctorId = "Doctor ID is required";
                if (!values.name.trim() && activeTab === "english") errors.name = "Name is required";
                if (!values.arabicName.trim() && activeTab === "arabic") errors.arabicName = "Arabic Name is required";
                if (!values.department.trim()) errors.department = "Department is required";
                return errors;
              }}
              onSubmit={async (values) => {
                if (!id) return;
                setSaving(true);

                setTimeout(() => {
                  const selectedDept = departments.find(d => d._id === values.department);
                  const updatedDoctor = {
                    id: id,
                    doctorId: values.doctorId.trim(),
                    name: values.name.trim(),
                    arabicName: values.arabicName.trim(),
                    department: selectedDept?.name || values.department,
                    departmentAr: selectedDept?.arabicName || values.department,
                    title: values.title.trim(),
                    arabicTitle: values.arabicTitle.trim(),
                    initials: values.initials.trim().toUpperCase(),
                    languages: toItems(values.languages),
                    arabicLanguages: toItems(values.arabicLanguages),
                    expertise: toItems(values.expertise),
                    arabicExpertise: toItems(values.arabicExpertise),
                    qualifications: toItems(values.qualifications),
                    arabicQualifications: toItems(values.arabicQualifications),
                    subspecialityIds: values.subspecialityIds,
                    availableOnline: values.availableOnline,
                    image: previewUrl,
                    updatedAt: new Date().toISOString(),
                  };

                  if (isUserDoctor) {
                    const userDoctors = getStoredDoctors();
                    const updatedDoctors = userDoctors.map((doc: any) =>
                      doc.id === id ? updatedDoctor : doc
                    );
                    saveDoctorsToStorage(updatedDoctors);
                  } else {
                    const userDoctors = getStoredDoctors();

                    const existingIndex = userDoctors.findIndex((doc: any) => doc.doctorId === values.doctorId);

                    if (existingIndex !== -1) {
                      userDoctors[existingIndex] = { ...updatedDoctor, createdAt: userDoctors[existingIndex].createdAt };
                      saveDoctorsToStorage(userDoctors);
                    } else {
                      updatedDoctor.createdAt = new Date().toISOString();
                      saveDoctorsToStorage([updatedDoctor, ...userDoctors]);
                    }
                  }

                  window.dispatchEvent(new Event("doctorsUpdated"));

                  toast.success("Doctor updated successfully.", { position: "top-right" });
                  setSaving(false);
                  navigate("/doctors");
                }, 1000);
              }}
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
                          <Globe className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Basic Information (English)</h3>
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
                          <GraduationCap className="h-5 w-5 text-burgundy" />
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

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Award className="h-5 w-5 text-burgundy" />
                          <h3 className="text-md font-semibold text-slate-800">Expertise</h3>
                        </div>

                        <div className="space-y-3">
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
                                className="flex-1 h-11"
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
                            const rows = [...toEditorRows(values.expertise), ""];
                            setFieldValue("expertise", toCommaSeparated(rows));
                          }}
                          className="mt-2 gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        >
                          <Plus className="h-3 w-3" />
                          Add expertise
                        </Button>
                      </div>

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
                          <h3 className="text-md font-semibold text-slate-800">Expertise (Arabic)</h3>
                        </div>

                        <div className="space-y-3">
                          {toEditorRows(values.arabicExpertise).map((line, index) => (
                            <div key={`arabic-expertise-${index}`} className="flex gap-2">
                              <Input
                                value={line}
                                onChange={(e) => {
                                  const next = [...toEditorRows(values.arabicExpertise)];
                                  next[index] = e.target.value;
                                  setFieldValue("arabicExpertise", toCommaSeparated(next));
                                }}
                                placeholder={`الخبرة ${index + 1}`}
                                className="flex-1 h-11"
                                dir="rtl"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const rows = toEditorRows(values.arabicExpertise);
                                  if (rows.length <= 1) {
                                    setFieldValue("arabicExpertise", "");
                                    return;
                                  }
                                  const next = rows.filter((_, i) => i !== index);
                                  setFieldValue("arabicExpertise", toCommaSeparated(next));
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
                            const rows = [...toEditorRows(values.arabicExpertise), ""];
                            setFieldValue("arabicExpertise", toCommaSeparated(rows));
                          }}
                          className="mt-2 gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                        >
                          <Plus className="h-3 w-3" />
                          أضف خبرة
                        </Button>
                      </div>

                      
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <GraduationCap className="h-5 w-5 text-burgundy" />
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
                            setFieldValue("subspecialityIds", []);
                            loadDepartmentSubspecialities(next);
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
                        <label className="text-sm font-semibold text-slate-700">Available online</label>
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
                                  checked={values.subspecialityIds.includes(s._id)}
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
                  </div>

                  
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => navigate("/doctors")} className="gap-2 w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="gap-2 w-full sm:w-auto bg-burgundy hover:bg-burgundy/90">
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