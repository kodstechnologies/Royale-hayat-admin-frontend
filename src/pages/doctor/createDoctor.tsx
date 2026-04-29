import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { getDepartments } from "@/api/department";

export type CreateDoctorFormData = {
  doctorId: string;
  department: string;
  initials: string;
  name: string;
  specialty: string;
  title: string;
  languages: string;
  expertise: string;
  qualifications: string;
  imageFile: File | null;
};

type CreateDoctorProps = {
  saving: boolean;
  onSubmit: (values: CreateDoctorFormData) => Promise<void>;
};

const initialValues: CreateDoctorFormData = {
  doctorId: "",
  department: "",
  initials: "",
  name: "",
  specialty: "",
  title: "",
  languages: "",
  expertise: "",
  qualifications: "",
  imageFile: null,
};

const toItems = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toJoinedUniqueItems = (current: string, nextValue: string) => {
  const next = nextValue.trim();
  if (!next) return current;
  const existing = toItems(current);
  if (existing.some((item) => item.toLowerCase() === next.toLowerCase())) {
    return current;
  }
  return [...existing, next].join(", ");
};

const removeItem = (current: string, itemToRemove: string) =>
  toItems(current)
    .filter((item) => item !== itemToRemove)
    .join(", ");

const CreateDoctor = ({ saving, onSubmit }: CreateDoctorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [languageInput, setLanguageInput] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [qualificationInput, setQualificationInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string }>>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, setFieldValue: (field: string, value: any) => void) => {
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

  useEffect(() => {
    if (!isOpen) return;
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const response = await getDepartments({ limit: 100 });
        const list = (response?.data?.data || []).map((item: any) => ({
          _id: item?._id || "",
          name: item?.name || "",
        }));
        setDepartments(list.filter((item: { _id: string; name: string }) => item._id && item.name));
      } catch (error) {
        toast.error("Failed to fetch departments.", { position: "top-right" });
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, [isOpen]);

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
        >
          + Create Doctor
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-lg border border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-base font-semibold">Create Doctor</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Formik
              initialValues={initialValues}
              validate={(values) => {
                const errors: Partial<Record<keyof CreateDoctorFormData, string>> = {};
                if (!values.doctorId.trim()) errors.doctorId = "Doctor ID is required";
                if (!values.department.trim()) errors.department = "Department is required";
                if (!values.name.trim()) errors.name = "Name is required";
                if (!values.specialty.trim()) errors.specialty = "Specialty is required";
                if (!values.title.trim()) errors.title = "Title is required";
                return errors;
              }}
              onSubmit={async (values, { resetForm }) => {
                if (!values.doctorId.trim() || !values.department.trim() || !values.name.trim() || !values.specialty.trim() || !values.title.trim()) {
                  toast.error("Doctor ID, Department, Name, Specialty and Title are required.", { position: "top-right" });
                  return;
                }
                await onSubmit(values);
                resetForm();
                setLanguageInput("");
                setExpertiseInput("");
                setQualificationInput("");
                setPreviewUrl("");
                setIsOpen(false);
              }}
            >
              {({ values, setFieldValue, touched, errors }) => (
                <Form className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Doctor ID <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="doctorId"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      placeholder="Enter doctor ID"
                    />
                    <ErrorMessage name="doctorId" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="department"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      disabled={departmentsLoading}
                    >
                      <option value="">{departmentsLoading ? "Loading departments..." : "Select department"}</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="department" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Initials</label>
                    <Field
                      name="initials"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      placeholder="Enter initials"
                    />
                    <ErrorMessage name="initials" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="name"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      placeholder="Enter doctor name"
                    />
                    <ErrorMessage name="name" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Specialty <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="specialty"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      placeholder="Enter specialty"
                    />
                    <ErrorMessage name="specialty" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="title"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      placeholder="Enter doctor title"
                    />
                    <ErrorMessage name="title" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Languages</label>
                    <div className="flex gap-2">
                      <input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          setFieldValue("languages", toJoinedUniqueItems(values.languages, languageInput));
                          setLanguageInput("");
                        }}
                        placeholder="Type a language"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("languages", toJoinedUniqueItems(values.languages, languageInput));
                          setLanguageInput("");
                        }}
                        className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {toItems(values.languages).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toItems(values.languages).map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                            {item}
                            <button type="button" onClick={() => setFieldValue("languages", removeItem(values.languages, item))}>
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Experience (Expertise)</label>
                    <div className="flex gap-2">
                      <input
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          setFieldValue("expertise", toJoinedUniqueItems(values.expertise, expertiseInput));
                          setExpertiseInput("");
                        }}
                        placeholder="Type experience/expertise"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("expertise", toJoinedUniqueItems(values.expertise, expertiseInput));
                          setExpertiseInput("");
                        }}
                        className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {toItems(values.expertise).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toItems(values.expertise).map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                            {item}
                            <button type="button" onClick={() => setFieldValue("expertise", removeItem(values.expertise, item))}>
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Qualifications</label>
                    <div className="flex gap-2">
                      <input
                        value={qualificationInput}
                        onChange={(e) => setQualificationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          setFieldValue("qualifications", toJoinedUniqueItems(values.qualifications, qualificationInput));
                          setQualificationInput("");
                        }}
                        placeholder="Type a qualification"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("qualifications", toJoinedUniqueItems(values.qualifications, qualificationInput));
                          setQualificationInput("");
                        }}
                        className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {toItems(values.qualifications).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {toItems(values.qualifications).map((item) => (
                          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                            {item}
                            <button
                              type="button"
                              onClick={() => setFieldValue("qualifications", removeItem(values.qualifications, item))}
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-2">Profile Image (optional)</label>
                    <div
                      className={`relative rounded-lg border-2 border-dashed transition-all ${
                        dragActive ? "border-burgundy bg-burgundy/5" : "border-border bg-muted/30"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, setFieldValue)}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="doctor-image-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] || null;
                          if (file) {
                            setFieldValue("imageFile", file);
                            setPreviewUrl(URL.createObjectURL(file));
                          } else {
                            setPreviewUrl("");
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

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      onClick={() => {
                        if (
                          (!values.doctorId.trim() || !values.department.trim() || !values.name.trim() || !values.specialty.trim() || !values.title.trim()) &&
                          (touched.doctorId || touched.department || touched.name || touched.specialty || touched.title || Object.keys(errors).length > 0)
                        ) {
                          toast.error("Please fill all required fields.", { position: "top-right" });
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium disabled:opacity-50 hover:bg-burgundy/90 transition-colors"
                    >
                      {saving ? "Creating..." : "Create Doctor"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguageInput("");
                        setExpertiseInput("");
                        setQualificationInput("");
                        setPreviewUrl("");
                        setIsOpen(false);
                      }}
                      className="flex-1 px-4 py-2 rounded-md border border-border text-xs font-medium hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateDoctor;
