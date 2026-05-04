import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { fetchAllCatagories, type Catagory } from "@/api/catagory";
import { fetchAllSubspecialities, type Subspeciality } from "@/api/subspeciality";
import {
  DepartmentRichFields,
  richContentInitialValues,
  type DepartmentRichContentValues,
} from "./departmentFormShared";

export type CreateDepartmentFormData = DepartmentRichContentValues & {
  departmentId: string;
  name: string;
  description: string;
  catagoryId: string;
  subspecialityIds: string[];
  imageFile: File | null;
  isActive: boolean;
  order: number;
};

type CreateDepartmentProps = {
  saving: boolean;
  onSubmit: (values: CreateDepartmentFormData) => Promise<void>;
};

const initialValues: CreateDepartmentFormData = {
  ...richContentInitialValues,
  departmentId: "",
  name: "",
  description: "",
  catagoryId: "",
  subspecialityIds: [],
  imageFile: null,
  isActive: true,
  order: 0,
};

const CreateDepartment = ({ saving, onSubmit }: CreateDepartmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Catagory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subspecialities, setSubspecialities] = useState<Subspeciality[]>([]);
  const [subspecialitiesLoading, setSubspecialitiesLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      setSubspecialitiesLoading(true);
      try {
        const [cats, subs] = await Promise.all([fetchAllCatagories(), fetchAllSubspecialities()]);
        if (!cancelled) {
          setCategories(cats);
          setSubspecialities(subs);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setSubspecialities([]);
          toast.error("Failed to load categories or subspecialities.", { position: "top-right" });
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
          setSubspecialitiesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
      toast.error("Please upload an image file", { position: "top-right" });
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

  return (
    <>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
        >
          + Create Department
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card rounded-lg border border-border shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h3 className="text-base font-semibold">Create Department</h3>
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
                const errors: Partial<Record<keyof CreateDepartmentFormData, string>> = {};
                if (!values.departmentId.trim()) errors.departmentId = "Department ID is required";
                if (!values.name.trim()) errors.name = "Name is required";
                if (!values.description.trim()) {
                  errors.description = "Description is required";
                } else if (values.description.trim().length < 10) {
                  errors.description = "Description must be at least 10 characters";
                }
                if (!values.catagoryId) errors.catagoryId = "Category is required";
                return errors;
              }}
              onSubmit={async (values, { resetForm }) => {
                if (!values.departmentId.trim() || !values.name.trim() || !values.description.trim() || !values.catagoryId) {
                  toast.error("Department ID, Name, Description, and Category are required.", { position: "top-right" });
                  return;
                }
                await onSubmit(values);
                resetForm();
                setPreviewUrl("");
                setIsOpen(false);
              }}
            >
              {({ setFieldValue, values, touched, errors }) => (
                <Form className="p-4 space-y-4 overflow-y-auto flex-1">
                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Department ID <span className="text-red-500">*</span>
                    </label>
                    <Field 
                      name="departmentId" 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all" 
                      placeholder="Enter department ID"
                    />
                    <ErrorMessage name="departmentId" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Field 
                      name="name" 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all" 
                      placeholder="Enter department name"
                    />
                    <ErrorMessage name="name" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Field 
                      as="textarea" 
                      name="description" 
                      rows={3} 
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all resize-none" 
                      placeholder="Enter department description (min. 10 characters)"
                    />
                    <ErrorMessage name="description" component="p" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="catagoryId"
                      disabled={categoriesLoading || categories.length === 0}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all disabled:opacity-60"
                    >
                      <option value="">{categoriesLoading ? "Loading categories…" : "Select a category"}</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="catagoryId" component="p" className="text-xs text-red-500 mt-1" />
                    {!categoriesLoading && categories.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">Add categories under Categories in the sidebar first.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-2">
                      Subspecialities <span className="text-muted-foreground font-normal">(optional, multi-select)</span>
                    </label>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 space-y-1.5">
                      {subspecialitiesLoading ? (
                        <p className="text-xs text-muted-foreground px-1 py-2">Loading subspecialities…</p>
                      ) : subspecialities.length === 0 ? (
                        <p className="text-xs text-amber-600 px-1 py-2">
                          Add subspecialities under Subspecialities in the sidebar first.
                        </p>
                      ) : (
                        subspecialities.map((s) => (
                          <label
                            key={s._id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-border"
                              checked={values.subspecialityIds.includes(s._id)}
                              onChange={() => toggleSubspeciality(s._id, values.subspecialityIds, setFieldValue)}
                            />
                            <span>{s.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {values.subspecialityIds.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {values.subspecialityIds.length} selected
                      </p>
                    )}
                  </div>

                  <DepartmentRichFields values={values} setFieldValue={setFieldValue} />

                  <div>
                    <label className="text-xs font-medium block mb-2">Image (optional)</label>
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
                        id="image-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0] || null;
                          if (file) {
                            setFieldValue("imageFile", file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        {previewUrl ? (
                          <div className="relative w-full">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-h-32 w-auto mx-auto rounded-lg object-cover"
                            />
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
                            <p className="text-xs text-muted-foreground mb-1">
                              Click to upload or drag & drop
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              PNG, JPG, GIF up to 5MB
                            </p>
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
                          (!values.departmentId.trim() || !values.name.trim() || !values.description.trim() || !values.catagoryId) &&
                          (touched.departmentId || touched.name || touched.description || touched.catagoryId || Object.keys(errors).length > 0)
                        ) {
                          toast.error("Please fill all required fields.", { position: "top-right" });
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium disabled:opacity-50 hover:bg-burgundy/90 transition-colors"
                    >
                      {saving ? "Creating..." : "Create Department"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
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

export default CreateDepartment;
