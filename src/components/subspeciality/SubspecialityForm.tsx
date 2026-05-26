import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X, ArrowLeft, Globe, Languages, Building2 } from "lucide-react";

type Props = {
    mode: "create" | "edit";
    subspecialityId?: string;
};

type CustomBlockDraft = {
    key: string;
    serverId?: string;

    // ENGLISH
    subHeading: string;
    explanationLines: string[];

    // ARABIC
    arabicSubHeading: string;
    arabicExplanationLines: string[];
};

// Dummy departments
const dummyDepartments = [
    { _id: "dept1", name: "Cardiology", arabicName: "أمراض القلب" },
    { _id: "dept2", name: "Neurology", arabicName: "الأعصاب" },
    { _id: "dept3", name: "Pediatrics", arabicName: "طب الأطفال" },
    { _id: "dept4", name: "Orthopedics", arabicName: "جراحة العظام" },
    { _id: "dept5", name: "Dermatology", arabicName: "الأمراض الجلدية" },
    { _id: "dept6", name: "Ophthalmology", arabicName: "طب العيون" },
    { _id: "dept7", name: "ENT", arabicName: "أنف وأذن وحنجرة" },
    { _id: "dept8", name: "Urology", arabicName: "جراحة المسالك البولية" },
    { _id: "dept9", name: "Internal Medicine", arabicName: "الطب الباطني" },
    { _id: "dept10", name: "Radiology", arabicName: "الأشعة" },
];

// Department name mapping for display
const departmentNameMap: Record<string, string> = {
    "dept1": "Cardiology",
    "dept2": "Neurology",
    "dept3": "Pediatrics",
    "dept4": "Orthopedics",
    "dept5": "Dermatology",
    "dept6": "Ophthalmology",
    "dept7": "ENT",
    "dept8": "Urology",
    "dept9": "Internal Medicine",
    "dept10": "Radiology",
};

// Dummy data for existing subspecialities
const dummySubspecialities: Record<string, any> = {
    "1": {
        _id: "1",
        name: "Interventional Cardiology",
        arabicName: "أمراض القلب التداخلية",
        description: "Specialized in catheter-based treatment of heart diseases",
        arabicDescription: "متخصص في العلاج بالقثطرة لأمراض القلب",
        departmentId: "dept1",
        customSubspecialities: [
            {
                _id: "cs1",
                subHeading: "Diagnostic Procedures",
                arabicSubHeading: "الإجراءات التشخيصية",
                explanations: ["Angiography", "Echocardiography", "Stress Test"],
                arabicExplanations: ["تصوير الأوعية", "تخطيط صدى القلب", "اختبار الإجهاد"],
            },
            {
                _id: "cs2",
                subHeading: "Treatment Options",
                arabicSubHeading: "خيارات العلاج",
                explanations: ["Angioplasty", "Stent Placement", "Rotablation"],
                arabicExplanations: ["رأب الأوعية", "تركيب الدعامات", "الاستئصال الدوراني"],
            },
        ],
    },
    "2": {
        _id: "2",
        name: "Pediatric Cardiology",
        arabicName: "أمراض قلب الأطفال",
        description: "Heart care for infants and children",
        arabicDescription: "رعاية القلب للرضع والأطفال",
        departmentId: "dept1",
        customSubspecialities: [
            {
                _id: "cs3",
                subHeading: "Congenital Heart Defects",
                arabicSubHeading: "عيوب القلب الخلقية",
                explanations: ["ASD Closure", "VSD Repair", "Patent Ductus Arteriosus"],
                arabicExplanations: ["إغلاق عيب الحاجز الأذيني", "إصلاح عيب الحاجز البطيني", "القناة الشريانية المفتوحة"],
            },
        ],
    },
};

// Function to load existing user subspecialities from localStorage
const loadUserSubspecialities = () => {
    const stored = localStorage.getItem("rhh_subspecialities");
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
};

// Function to save user subspecialities to localStorage
const saveUserSubspecialities = (subs: any[]) => {
    localStorage.setItem("rhh_subspecialities", JSON.stringify(subs));
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
        subHeading: "",
        arabicSubHeading: "",
        explanationLines: [""],
        arabicExplanationLines: [""],
    };
}

const SubspecialityForm = ({ mode, subspecialityId }: Props) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const [nameDraft, setNameDraft] = useState("");
    const [arabicNameDraft, setArabicNameDraft] = useState("");
    const [descriptionDraft, setDescriptionDraft] = useState("");
    const [arabicDescriptionDraft, setArabicDescriptionDraft] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");

    const [customBlocks, setCustomBlocks] = useState<CustomBlockDraft[]>([]);

    useEffect(() => {
        if (mode !== "edit" || !subspecialityId) {
            // For create mode, initialize empty
            if (mode === "create") {
                setCustomBlocks([]);
            }
            return;
        }

        // Load data for edit mode
        setLoading(true);
        setTimeout(() => {
            // First check if this is a user-created subspeciality from localStorage
            const userSubs = loadUserSubspecialities();
            let dummyData = userSubs.find((sub: any) => sub.id === subspecialityId);
            
            // If not found in user subs, check dummy data
            if (!dummyData) {
                dummyData = dummySubspecialities[subspecialityId];
            }
            
            if (dummyData) {
                setNameDraft(dummyData.name || "");
                setArabicNameDraft(dummyData.arabicName || "");
                setDescriptionDraft(dummyData.description || "");
                setArabicDescriptionDraft(dummyData.arabicDescription || "");
                setDepartmentId(dummyData.departmentId || "");

                const blocks = dummyData.customSubspecialities?.map((c: any) => ({
                    key: c._id || newKey(),
                    serverId: c._id,
                    subHeading: c.subHeading || "",
                    arabicSubHeading: c.arabicSubHeading || "",
                    explanationLines: c.explanations || [""],
                    arabicExplanationLines: c.arabicExplanations || [""],
                })) || [];

                setCustomBlocks(blocks);
            }
            setLoading(false);
        }, 500);
    }, [mode, subspecialityId]);

    const submit = () => {
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

        setSaving(true);

        // Prepare custom sections data
        const customSubspecialities = customBlocks
            .filter(block => block.subHeading.trim() || block.arabicSubHeading.trim())
            .map(block => ({
                _id: block.serverId || newKey(),
                subHeading: block.subHeading,
                arabicSubHeading: block.arabicSubHeading,
                explanations: block.explanationLines.filter(line => line.trim()),
                arabicExplanations: block.arabicExplanationLines.filter(line => line.trim()),
            }))
            .filter(block => block.explanations.length > 0 || block.arabicExplanations.length > 0);

        // Prepare payload
        const payload = {
            id: mode === "create" ? Date.now().toString() : subspecialityId,
            name,
            arabicName,
            description,
            arabicDescription,
            departmentId,
            departmentName: departmentNameMap[departmentId] || departmentId,
            customSubspecialities,
            createdAt: mode === "create" ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
        };

        console.log("Subspeciality data:", payload);

        // Save to localStorage for user-created subspecialities
        const existingSubs = loadUserSubspecialities();
        let updatedSubs;
        
        if (mode === "create") {
            updatedSubs = [payload, ...existingSubs];
        } else {
            updatedSubs = existingSubs.map((sub: any) => 
                sub.id === subspecialityId ? payload : sub
            );
        }
        
        saveUserSubspecialities(updatedSubs);
        
        // Dispatch event to notify list page
        window.dispatchEvent(new Event("subspecialitiesUpdated"));

        setTimeout(() => {
            if (mode === "create") {
                toast.success("Subspeciality created successfully");
            } else {
                toast.success("Subspeciality updated successfully");
            }

            setSaving(false);
            navigate("/subspecialities");
        }, 500);
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

    // Get department display name based on active tab
    const getDepartmentDisplayName = (dept: typeof dummyDepartments[0]) => {
        return activeTab === "arabic" ? dept.arabicName : dept.name;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BreadCrumb />

            <div className="rounded-xl border-2 border-burgundy/30 bg-gradient-to-br from-white via-slate-50/90 to-white shadow-xl backdrop-blur-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

                <div className="p-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/subspecialities")}
                            className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-burgundy" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                {mode === "create" ? "Create Subspeciality" : "Edit Subspeciality"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {mode === "create" 
                                    ? "Fill in the details to create a new subspeciality"
                                    : "Update the subspeciality details"}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8">
                        <div className="flex gap-4 p-1 bg-slate-100/80 rounded-xl w-fit">
                            <button
                                type="button"
                                onClick={() => setActiveTab("english")}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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
                                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
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

                    {/* Department Selection - Common for both tabs */}
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
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                                >
                                    <option value="">Select a department</option>
                                    {dummyDepartments.map((dept) => (
                                        <option key={dept._id} value={dept._id}>
                                            {getDepartmentDisplayName(dept)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ENGLISH TAB */}
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

                            {/* Custom Sections */}
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
                                                placeholder="Enter English heading"
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

                    {/* ARABIC TAB */}
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

                            {/* Arabic Custom Sections */}
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

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                        <Button variant="outline" onClick={() => navigate("/subspecialities")} className="gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={submit} disabled={saving} className="gap-2 bg-burgundy hover:bg-burgundy/90">
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