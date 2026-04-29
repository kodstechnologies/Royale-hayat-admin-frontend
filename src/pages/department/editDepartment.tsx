import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";

export type EditDepartmentFormData = {
  departmentId: string;
  name: string;
  description: string;
  imageFile: File | null;
  subSpecialties: string;
  isActive: boolean;
  order: number;
};

type EditDepartmentModalProps = {
  isOpen: boolean;
  saving: boolean;
  initialValues: EditDepartmentFormData;
  currentImageUrl?: string;
  onClose: () => void;
  onSubmit: (values: EditDepartmentFormData) => Promise<void>;
};

const EditDepartmentModal = ({ isOpen, saving, initialValues, currentImageUrl = "", onClose, onSubmit }: EditDepartmentModalProps) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [specialityInput, setSpecialityInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPreviewUrl(currentImageUrl);
    setSpecialityInput("");
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] bg-card rounded-lg border border-border shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold">Edit Department</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={(values) => {
            const errors: Partial<Record<keyof EditDepartmentFormData, string>> = {};
            if (!values.departmentId.trim()) errors.departmentId = "Department ID is required";
            if (!values.name.trim()) errors.name = "Name is required";
            if (!values.description.trim()) {
              errors.description = "Description is required";
            } else if (values.description.trim().length < 10) {
              errors.description = "Description must be at least 10 characters";
            }
            return errors;
          }}
          onSubmit={async (values) => {
            if (!values.departmentId.trim() || !values.name.trim() || !values.description.trim()) {
              toast.error("Department ID, Name, and Description are required.", { position: "top-right" });
              return;
            }
            await onSubmit(values);
          }}
        >
          {({ setFieldValue, values, touched, errors }) => (
            <Form className="p-4 space-y-4 max-h-[calc(90vh-64px)] overflow-y-auto">
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
                <label className="text-xs font-medium block mb-2">Image (optional)</label>
                <div className="relative rounded-lg border-2 border-dashed border-border bg-muted/30">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-image-upload"
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
                      <img src={previewUrl} alt="Department preview" className="max-h-32 w-auto mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-1">Click to select image</p>
                        <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Subspecialties</label>
                <div className="flex gap-2">
                  <input
                    value={specialityInput}
                    onChange={(e) => setSpecialityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      const next = specialityInput.trim();
                      if (!next) return;
                      const existing = (values.subSpecialties || "")
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      if (existing.some((item) => item.toLowerCase() === next.toLowerCase())) {
                        setSpecialityInput("");
                        return;
                      }
                      setFieldValue("subSpecialties", [...existing, next].join(", "));
                      setSpecialityInput("");
                    }}
                    placeholder="Type a subspecialty"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = specialityInput.trim();
                      if (!next) return;
                      const existing = (values.subSpecialties || "")
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      if (existing.some((item) => item.toLowerCase() === next.toLowerCase())) {
                        setSpecialityInput("");
                        return;
                      }
                      setFieldValue("subSpecialties", [...existing, next].join(", "));
                      setSpecialityInput("");
                    }}
                    className="px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
                {(values.subSpecialties || "")
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(values.subSpecialties || "")
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-burgundy/10 text-burgundy">
                          {item}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (values.subSpecialties || "")
                                .split(",")
                                .map((value) => value.trim())
                                .filter(Boolean)
                                .filter((value) => value !== item);
                              setFieldValue("subSpecialties", updated.join(", "));
                            }}
                          >
                            x
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Status</label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <Field type="checkbox" name="isActive" />
                  Active
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  onClick={() => {
                    if (
                      (!values.departmentId.trim() || !values.name.trim() || !values.description.trim()) &&
                      (touched.departmentId || touched.name || touched.description || Object.keys(errors).length > 0)
                    ) {
                      toast.error("Please fill all required fields.", { position: "top-right" });
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-md bg-burgundy text-primary-foreground text-xs font-medium disabled:opacity-50 hover:bg-burgundy/90 transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
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
  );
};

export default EditDepartmentModal;
