import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    createSubspeciality,
    getSubspecialityById,
    updateSubspeciality as updateSubspecialityApi,
    type CustomSubspecialityInput,
    type Subspeciality,
} from "@/api/subspeciality";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, X } from "lucide-react";

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

function explanationPayload(lines: string[]) {
    return lines
        .map((s) => s.trim())
        .filter(Boolean);
}

function buildCreateCustomPayload(
    blocks: CustomBlockDraft[]
): CustomSubspecialityInput[] {
    const out: CustomSubspecialityInput[] = [];

    for (const b of blocks) {
        out.push({
            subHeading: b.subHeading,
            arabicSubHeading: b.arabicSubHeading,

            explanations: explanationPayload(b.explanationLines),
            arabicExplanations: explanationPayload(b.arabicExplanationLines),
        });
    }

    return out;
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

    const [customBlocks, setCustomBlocks] = useState<CustomBlockDraft[]>([]);
    const [activeTab, setActiveTab] = useState<"english" | "arabic">("english");
    const initialCustomByIdRef = useRef(new Map());

    useEffect(() => {
        if (mode !== "edit" || !subspecialityId) return;

        const load = async () => {
            setLoading(true);

            try {
                const res = await getSubspecialityById(subspecialityId);
                const row: Subspeciality = res?.data?.data;

                setNameDraft(row.name || "");
                setArabicNameDraft(row.arabicName || "");
                setDescriptionDraft(row.description || "");
                setArabicDescriptionDraft(row.arabicDescription || "");

                const blocks = row.customSubspecialities?.map((c: any) => ({
                    key: c._id || crypto.randomUUID(),
                    serverId: c._id,
                    subHeading: c.subHeading || "",
                    arabicSubHeading: c.arabicSubHeading || "",
                    explanationLines: c.explanations || [""],
                    arabicExplanationLines: c.arabicExplanations || [""],
                })) || [];

                setCustomBlocks(blocks);
            } catch {
                toast.error(t("Failed to load subspeciality"));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [mode, subspecialityId]);

    const submit = async () => {
        const name = nameDraft.trim();
        const arabicName = arabicNameDraft.trim();
        const description = descriptionDraft.trim();
        const arabicDescription = arabicDescriptionDraft.trim();

        if (!name) {
            toast.error(t("Name is required"));
            return;
        }

        if (!arabicName) {
            toast.error(t("Arabic name is required"));
            return;
        }

        if (!description) {
            toast.error(t("Description is required"));
            return;
        }

        if (!arabicDescription) {
            toast.error(t("Arabic description is required"));
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name,
                arabicName,
                description,
                arabicDescription,
                customSubspecialities: buildCreateCustomPayload(customBlocks),
            };

            if (mode === "create") {
                await createSubspeciality(payload);
                toast.success(t("Subspeciality created successfully"));
            } else {
                await updateSubspecialityApi(subspecialityId!, payload);
                toast.success(t("Subspeciality updated successfully"));
            }

            navigate("/subspecialities");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to save"));
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

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <BreadCrumb />

            <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {/* HEADER */}
                {/* <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {mode === "create" ? "Create Subspeciality" : "Edit Subspeciality"}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage multilingual subspeciality content and custom sections
                    </p>
                </div> */}

                {/* TABS */}
                <div className="border-b border-slate-100 px-6">
                    <div className="flex gap-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab("english")}
                            className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                                activeTab === "english"
                                    ? "border-burgundy text-burgundy"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            English Content
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("arabic")}
                            className={`pb-3 pt-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                                activeTab === "arabic"
                                    ? "border-burgundy text-burgundy"
                                    : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Arabic Content
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {/* ENGLISH TAB */}
                    {activeTab === "english" && (
                        <div className="space-y-8">
                            {/* BASIC INFO */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                                        English Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        placeholder="Enter English name"
                                        className="h-11"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                                        English Description <span className="text-red-500">*</span>
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

                            {/* CUSTOM SECTIONS */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Custom Sections
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Add headings and explanations for this subspeciality
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCustomBlocks((prev) => [...prev, emptyBlock()])}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Section
                                    </Button>
                                </div>

                                {customBlocks.length === 0 && (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-slate-500">No custom sections added yet</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setCustomBlocks((prev) => [...prev, emptyBlock()])}
                                            className="mt-2 gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add your first section
                                        </Button>
                                    </div>
                                )}

                                {customBlocks.map((block) => (
                                    <div key={block.key} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/30">
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setCustomBlocks((prev) => prev.filter((x) => x.key !== block.key))}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-2">
                                                Heading
                                            </label>
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
                                                className="h-10"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-2">
                                                Explanations
                                            </label>
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
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeExplanationLine(block.key, idx, false)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addExplanationLine(block.key, false)}
                                                className="mt-2 gap-1"
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
                        <div className="space-y-8">
                            {/* BASIC INFO */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                                        Arabic Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        dir="rtl"
                                        value={arabicNameDraft}
                                        onChange={(e) => setArabicNameDraft(e.target.value)}
                                        placeholder="الاسم بالعربية"
                                        className="h-11"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                                        Arabic Description <span className="text-red-500">*</span>
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

                            {/* CUSTOM SECTIONS */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Arabic Custom Sections
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Arabic translations for headings and explanations
                                    </p>
                                </div>

                                {customBlocks.map((block) => (
                                    <div key={block.key} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/30">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-2">
                                                Heading (Arabic)
                                            </label>
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
                                                className="h-10"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-2">
                                                Explanations (Arabic)
                                            </label>
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
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeExplanationLine(block.key, idx, true)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addExplanationLine(block.key, true)}
                                                className="mt-2 gap-1"
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
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-100 px-6 py-5 flex justify-end gap-3 bg-slate-50/30">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/subspecialities")}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={saving}
                        className="gap-2 bg-burgundy hover:bg-burgundy/90"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : mode === "create" ? "Create Subspeciality" : "Update Subspeciality"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubspecialityForm;