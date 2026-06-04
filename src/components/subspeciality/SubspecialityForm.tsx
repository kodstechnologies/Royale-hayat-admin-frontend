import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X, ArrowLeft, Globe, Languages, Building2 } from "lucide-react";
import { getDepartments } from "@/api/department";
import {
  buildCustomSubspecialityPayload,
  createSubspeciality,
  getSubspecialityById,
  mapApiSubspecialityToDetail,
  updateSubspeciality,
} from "@/api/subspeciality";
import { showApiErrorToast } from "@/lib/apiError";

type Props = {
  mode: "create" | "edit";
  subspecialityId?: string;
};

type DepartmentOption = {
  _id: string;
  name: string;
  arabicName: string;
};

type CustomBlockDraft = {
  key: string;
  heading: string;
  subHeading: string;
  explanationLines: string[];
  arabicHeading: string;
  arabicSubHeading: string;
  arabicExplanationLines: string[];
};
function newKey() {
    return typeof crypto !== "undefined" &&
        crypto.randomUUID
        ? crypto.randomUUID()
        : `k-${Date.now()}`;
}

function emptyBlock(): CustomBlockDraft {
    return {
        key: newKey(),
        heading: "",
        subHeading: "",
        arabicHeading: "",
        arabicSubHeading: "",
        explanationLines: [""],
        arabicExplanationLines: [""],
    };
}

const SubspecialityForm = ({ mode, subspecialityId }: Props) => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);

    const [nameDraft, setNameDraft] = useState("");
    const [arabicNameDraft, setArabicNameDraft] = useState("");
    const [descriptionDraft, setDescriptionDraft] = useState("");
    const [arabicDescriptionDraft, setArabicDescriptionDraft] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");

    const [customBlocks, setCustomBlocks] = useState<CustomBlockDraft[]>([]);

    useEffect(() => {
        const loadDepartments = async () => {
            setLoadingDepartments(true);
            try {
                const response = await getDepartments({
                    page: 1,
                    limit: 100,
                    sortBy: "name",
                    sortOrder: "asc",
                });
                const list = Array.isArray(response.data?.data) ? response.data.data : [];
                setDepartments(
                    list.map((dept: { _id?: string; name?: string; arabicName?: string }) => ({
                        _id: String(dept._id ?? ""),
                        name: String(dept.name ?? ""),
                        arabicName: String(dept.arabicName ?? dept.name ?? ""),
                    })),
                );
            } catch (error) {
                console.error("Error loading departments:", error);
                toast.error("Failed to load departments");
                setDepartments([]);
            } finally {
                setLoadingDepartments(false);
            }
        };

        void loadDepartments();
    }, []);

    useEffect(() => {
        if (mode !== "edit" || !subspecialityId) {
            return;
        }

        const loadSubspeciality = async () => {
            setLoading(true);

            try {
                const response = await getSubspecialityById(subspecialityId);
                const raw = response.data?.data ?? response.data;

                if (!raw?._id) {
                    toast.error("Subspeciality not found");
                    navigate("/subspecialities");
                    return;
                }

                const detail = mapApiSubspecialityToDetail(raw);
                setNameDraft(detail.name);
                setArabicNameDraft(detail.arabicName);
                setDescriptionDraft(detail.description);
                setArabicDescriptionDraft(detail.arabicDescription);
                setDepartmentId(detail.departmentId);

                setCustomBlocks(
                    detail.customSubspecialities.map((section) => {
                        const legacySubHeading = section.subHeading || "";
                        const heading = section.heading || "";
                        const hasHeading = heading.length > 0;
                        const legacyArabicSubHeading = section.arabicSubHeading || "";
                        const arabicHeading = section.arabicHeading || "";
                        const hasArabicHeading = arabicHeading.length > 0;

                        return {
                            key: section._id || newKey(),
                            heading: hasHeading ? heading : legacySubHeading,
                            subHeading: hasHeading ? legacySubHeading : "",
                            arabicHeading: hasArabicHeading ? arabicHeading : legacyArabicSubHeading,
                            arabicSubHeading: hasArabicHeading ? legacyArabicSubHeading : "",
                            explanationLines:
                                section.explanations?.length > 0 ? section.explanations : [""],
                            arabicExplanationLines:
                                section.arabicExplanations?.length > 0
                                    ? section.arabicExplanations
                                    : [""],
                        };
                    }),
                );
            } catch (error: unknown) {
                console.error("Error loading subspeciality:", error);
                showApiErrorToast(error, "Failed to load subspeciality", toast.error);
                navigate("/subspecialities");
            } finally {
                setLoading(false);
            }
        };

        void loadSubspeciality();
    }, [mode, subspecialityId, navigate]);

    const submit = async () => {
        const name = nameDraft.trim();
        const arabicName = arabicNameDraft.trim();
        const description = descriptionDraft.trim();
        const arabicDescription = arabicDescriptionDraft.trim();

        if (!name) {
            toast.error("Name is required");
            return;
        }

        if (!arabicName) {
            toast.error("Arabic name is required");
            return;
        }

        if (!description) {
            toast.error("Description is required");
            return;
        }

        if (!arabicDescription) {
            toast.error("Arabic description is required");
            return;
        }

        if (!departmentId) {
            toast.error("Department is required");
            return;
        }

        const customSubspecialities = buildCustomSubspecialityPayload(
            customBlocks.map((block) => ({
                heading: block.heading,
                subHeading: block.subHeading,
                arabicHeading: block.arabicHeading,
                arabicSubHeading: block.arabicSubHeading,
                explanations: block.explanationLines,
                arabicExplanations: block.arabicExplanationLines,
            })),
        );

        setSaving(true);

        try {
            if (mode === "create") {
                await createSubspeciality({
                    name,
                    arabicName,
                    description,
                    arabicDescription,
                    department: departmentId,
                    customSubspecialities,
                });
                toast.success("Subspeciality created successfully");
            } else {
                if (!subspecialityId) return;

                await updateSubspeciality(subspecialityId, {
                    name,
                    arabicName,
                    description,
                    arabicDescription,
                    department: departmentId,
                    customSubspecialities,
                });
                toast.success("Subspeciality updated successfully");
            }

            navigate("/subspecialities");
        } catch (error: unknown) {
            console.error("Error saving subspeciality:", error);
            showApiErrorToast(
                error,
                mode === "create" ? "Failed to create subspeciality" : "Failed to update subspeciality",
                toast.error,
            );
        } finally {
            setSaving(false);
        }
    };
    const addExplanationLine = (blockKey: string, isArabic: boolean) => {
        setCustomBlocks((prev) =>
            prev.map((block) =>
                block.key === blockKey
                    ? {
                          ...block,
                          ...(isArabic
                              ? { arabicExplanationLines: [...block.arabicExplanationLines, ""] }
                              : { explanationLines: [...block.explanationLines, ""] }),
                      }
                    : block
            )
        );
    };

    const removeExplanationLine = (blockKey: string, index: number, isArabic: boolean) => {
        setCustomBlocks((prev) =>
            prev.map((block) =>
                block.key === blockKey
                    ? {
                          ...block,
                          ...(isArabic
                              ? { arabicExplanationLines: block.arabicExplanationLines.filter((_, i) => i !== index) }
                              : { explanationLines: block.explanationLines.filter((_, i) => i !== index) }),
                      }
                    : block
            )
        );
    };

    const addCustomSection = () => {
        setCustomBlocks((prev) => [...prev, emptyBlock()]);
    };

    const removeCustomSection = (key: string) => {
        setCustomBlocks((prev) => prev.filter((x) => x.key !== key));
    };

    const getDepartmentDisplayName = (dept: DepartmentOption) => dept.name;
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <BreadCrumb />

            <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

                <div className="p-4 sm:p-6">
                    
                    <div className="flex items-start gap-3 sm:gap-4 mb-6 min-w-0">
                        <button
                            onClick={() => navigate("/subspecialities")}
                            className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                        </button>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                {mode === "create" ? "Create Subspeciality" : "Edit Subspeciality"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {mode === "create" 
                                    ? "Fill in the details to create a new subspeciality"
                                    : "Update the subspeciality details"}
                            </p>
                        </div>
                    </div>

                    
                    <div className="mb-8">
                        <div className="flex w-full sm:w-fit gap-2 sm:gap-4 p-1 bg-slate-100/80 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setActiveTab("english")}
                                className={`
                                    flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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
                                    flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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

                    
                    <div className="mb-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Building2 className="h-5 w-5 text-burgundy" />
                                <h3 className="text-md font-semibold text-slate-800">Department</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Select Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    disabled={loadingDepartments}
                                    dir="ltr"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-left focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {loadingDepartments ? "Loading departments..." : "Select a department"}
                                    </option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept._id}>
                                            {getDepartmentDisplayName(dept)}
                                        </option>
                                    ))}
                                </select>                            </div>
                        </div>
                    </div>

                    
                    {activeTab === "english" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                    <Globe className="h-5 w-5 text-burgundy" />
                                    <h3 className="text-md font-semibold text-slate-800">Basic Information (English)</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        placeholder="Enter English name"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        rows={4}
                                        value={descriptionDraft}
                                        onChange={(e) => setDescriptionDraft(e.target.value)}
                                        placeholder="Enter English description"
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-md font-semibold text-slate-800">Custom Sections</h3>
                                        <p className="text-xs text-slate-500">Add headings and explanations for this subspeciality</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addCustomSection}
                                        className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Section
                                    </Button>
                                </div>

                                {customBlocks.length === 0 && (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500">No custom sections added yet</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={addCustomSection}
                                            className="mt-2 gap-1"
                                        >
                                            <Plus className="h-3 w-3" />
                                            Add your first section
                                        </Button>
                                    </div>
                                )}

                                {customBlocks.map((block) => (
                                    <div key={block.key} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30 relative">
                                        <div className="absolute -top-2 -left-2 bg-burgundy/10 text-burgundy text-xs px-2 py-0.5 rounded-full">
                                            Section
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeCustomSection(block.key)}
                                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Heading</label>
                                            <Input
                                                placeholder="Enter heading"
                                                value={block.heading}
                                                onChange={(e) =>
                                                    setCustomBlocks((prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key ? { ...b, heading: e.target.value } : b
                                                        )
                                                    )
                                                }
                                                className="h-9"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Subheading</label>
                                            <Input
                                                placeholder="Enter subheading"
                                                value={block.subHeading}
                                                onChange={(e) =>
                                                    setCustomBlocks((prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key ? { ...b, subHeading: e.target.value } : b
                                                        )
                                                    )
                                                }
                                                className="h-9"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Explanations</label>
                                            <div className="space-y-2">
                                                {block.explanationLines.map((line, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input
                                                            placeholder={`Explanation ${idx + 1}`}
                                                            value={line}
                                                            onChange={(e) =>
                                                                setCustomBlocks((prev) =>
                                                                    prev.map((b) => {
                                                                        if (b.key !== block.key) return b;
                                                                        const next = [...b.explanationLines];
                                                                        next[idx] = e.target.value;
                                                                        return { ...b, explanationLines: next };
                                                                    })
                                                                )
                                                            }
                                                            className="flex-1 h-9"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeExplanationLine(block.key, idx, false)}
                                                            className="h-9 w-9 text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addExplanationLine(block.key, false)}
                                                className="mt-2 gap-1 text-xs"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add explanation
                                            </Button>
                                        </div>
                                    </div>
                                ))}
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

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Name (Arabic) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        dir="rtl"
                                        value={arabicNameDraft}
                                        onChange={(e) => setArabicNameDraft(e.target.value)}
                                        placeholder="الاسم بالعربية"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Description (Arabic) <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        dir="rtl"
                                        rows={4}
                                        value={arabicDescriptionDraft}
                                        onChange={(e) => setArabicDescriptionDraft(e.target.value)}
                                        placeholder="الوصف بالعربية"
                                        className="resize-none"
                                    />
                                </div>
                            </div>

                            
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                                <div className="pb-2 border-b border-slate-100">
                                    <h3 className="text-md font-semibold text-slate-800">Arabic Custom Sections</h3>
                                    <p className="text-xs text-slate-500">Arabic translations for headings and explanations</p>
                                </div>

                                {customBlocks.map((block) => (
                                    <div key={block.key} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Heading (Arabic)</label>
                                            <Input
                                                dir="rtl"
                                                placeholder="العنوان بالعربية"
                                                value={block.arabicHeading}
                                                onChange={(e) =>
                                                    setCustomBlocks((prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key ? { ...b, arabicHeading: e.target.value } : b
                                                        )
                                                    )
                                                }
                                                className="h-9"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Subheading (Arabic)</label>
                                            <Input
                                                dir="rtl"
                                                placeholder="العنوان الفرعي بالعربية"
                                                value={block.arabicSubHeading}
                                                onChange={(e) =>
                                                    setCustomBlocks((prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key ? { ...b, arabicSubHeading: e.target.value } : b
                                                        )
                                                    )
                                                }
                                                className="h-9"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-slate-600 block mb-1">Explanations (Arabic)</label>
                                            <div className="space-y-2">
                                                {block.arabicExplanationLines.map((line, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input
                                                            dir="rtl"
                                                            placeholder={`الشرح ${idx + 1}`}
                                                            value={line}
                                                            onChange={(e) =>
                                                                setCustomBlocks((prev) =>
                                                                    prev.map((b) => {
                                                                        if (b.key !== block.key) return b;
                                                                        const next = [...b.arabicExplanationLines];
                                                                        next[idx] = e.target.value;
                                                                        return { ...b, arabicExplanationLines: next };
                                                                    })
                                                                )
                                                            }
                                                            className="flex-1 h-9"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeExplanationLine(block.key, idx, true)}
                                                            className="h-9 w-9 text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addExplanationLine(block.key, true)}
                                                className="mt-2 gap-1 text-xs"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Add explanation
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                        <Button variant="outline" onClick={() => navigate("/subspecialities")} className="gap-2 w-full sm:w-auto">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90 w-full sm:w-auto">
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : mode === "create" ? "Create Subspeciality" : "Update Subspeciality"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubspecialityForm;