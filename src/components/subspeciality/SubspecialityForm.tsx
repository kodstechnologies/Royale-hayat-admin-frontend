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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

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
    const out: CustomSubspecialityInput[] =
        [];

    for (const b of blocks) {
        out.push({
            subHeading: b.subHeading,
            arabicSubHeading:
                b.arabicSubHeading,

            explanations: explanationPayload(
                b.explanationLines
            ),

            arabicExplanations:
                explanationPayload(
                    b.arabicExplanationLines
                ),
        });
    }

    return out;
}

const SubspecialityForm = ({
    mode,
    subspecialityId,
}: Props) => {
    const { t } = useLanguage();

    const navigate = useNavigate();

    const [saving, setSaving] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [nameDraft, setNameDraft] =
        useState("");

    const [
        arabicNameDraft,
        setArabicNameDraft,
    ] = useState("");

    const [
        descriptionDraft,
        setDescriptionDraft,
    ] = useState("");

    const [
        arabicDescriptionDraft,
        setArabicDescriptionDraft,
    ] = useState("");

    const [customBlocks, setCustomBlocks] =
        useState<CustomBlockDraft[]>([]);
    const [activeTab, setActiveTab] = useState<
        "english" | "arabic"
    >("english");
    const initialCustomByIdRef =
        useRef(new Map());

    useEffect(() => {
        if (
            mode !== "edit" ||
            !subspecialityId
        )
            return;

        const load = async () => {
            setLoading(true);

            try {
                const res =
                    await getSubspecialityById(
                        subspecialityId
                    );

                const row: Subspeciality =
                    res?.data?.data;

                setNameDraft(row.name || "");

                setArabicNameDraft(
                    row.arabicName || ""
                );

                setDescriptionDraft(
                    row.description || ""
                );

                setArabicDescriptionDraft(
                    row.arabicDescription || ""
                );

                const blocks =
                    row.customSubspecialities?.map(
                        (c: any) => ({
                            key:
                                c._id || crypto.randomUUID(),

                            serverId: c._id,

                            subHeading:
                                c.subHeading || "",

                            arabicSubHeading:
                                c.arabicSubHeading || "",

                            explanationLines:
                                c.explanations || [""],

                            arabicExplanationLines:
                                c.arabicExplanations || [""],
                        })
                    ) || [];

                setCustomBlocks(blocks);
            } catch {
                toast.error(
                    t(
                        "Failed to load subspeciality"
                    )
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [mode, subspecialityId]);

    const submit = async () => {
        const name = nameDraft.trim();

        const arabicName =
            arabicNameDraft.trim();

        const description =
            descriptionDraft.trim();

        const arabicDescription =
            arabicDescriptionDraft.trim();

        if (!name) {
            toast.error(t("Name is required"));
            return;
        }

        if (!arabicName) {
            toast.error(
                t("Arabic name is required")
            );
            return;
        }

        if (!description) {
            toast.error(
                t("Description is required")
            );
            return;
        }

        if (!arabicDescription) {
            toast.error(
                t(
                    "Arabic description is required"
                )
            );
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name,
                arabicName,

                description,
                arabicDescription,

                customSubspecialities:
                    buildCreateCustomPayload(
                        customBlocks
                    ),
            };

            if (mode === "create") {
                await createSubspeciality(
                    payload
                );

                toast.success(
                    t(
                        "Subspeciality created successfully"
                    )
                );
            } else {
                await updateSubspecialityApi(
                    subspecialityId!,
                    payload
                );

                toast.success(
                    t(
                        "Subspeciality updated successfully"
                    )
                );
            }

            navigate("/subspecialities");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("Failed to save")
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-5xl mx-auto">

            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">

                {/* HEADER */}

                <div className="border-b px-6 py-5">

                    <h1 className="text-2xl font-bold">
                        {mode === "create"
                            ? "Create Subspeciality"
                            : "Edit Subspeciality"}
                    </h1>

                    <p className="text-muted-foreground mt-1">
                        Manage multilingual subspeciality content
                    </p>

                </div>

                {/* TABS */}

                <div className="border-b px-6">

                    <div className="flex gap-6">

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("english")
                            }
                            className={`pb-4 pt-4 text-sm font-medium border-b-2 transition ${activeTab === "english"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground"
                                }`}
                        >
                            English Content
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab("arabic")
                            }
                            className={`pb-4 pt-4 text-sm font-medium border-b-2 transition ${activeTab === "arabic"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground"
                                }`}
                        >
                            Arabic Content
                        </button>

                    </div>

                </div>

                {/* BODY */}

                <div className="p-6 space-y-8">

                    {/* ENGLISH TAB */}

                    {activeTab === "english" && (
                        <div className="space-y-8">

                            {/* BASIC */}

                            <div className="grid grid-cols-1 gap-6">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        English Name
                                    </label>

                                    <Input
                                        value={nameDraft}
                                        onChange={(e) =>
                                            setNameDraft(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter English name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        English Description
                                    </label>

                                    <Textarea
                                        rows={5}
                                        value={descriptionDraft}
                                        onChange={(e) =>
                                            setDescriptionDraft(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter English description"
                                    />
                                </div>

                            </div>

                            {/* CUSTOM SECTIONS */}

                            <div className="space-y-5">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            English Custom Sections
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Add English headings and explanations
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setCustomBlocks(
                                                (prev) => [
                                                    ...prev,
                                                    emptyBlock(),
                                                ]
                                            )
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Section
                                    </Button>

                                </div>

                                {customBlocks.map((block) => (
                                    <div
                                        key={block.key}
                                        className="border rounded-xl p-5 space-y-4 bg-muted/20"
                                    >

                                        <div className="flex justify-end">

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setCustomBlocks(
                                                        (prev) =>
                                                            prev.filter(
                                                                (x) =>
                                                                    x.key !==
                                                                    block.key
                                                            )
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                        </div>

                                        <Input
                                            placeholder="English heading"
                                            value={block.subHeading}
                                            onChange={(e) =>
                                                setCustomBlocks(
                                                    (prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key
                                                                ? {
                                                                    ...b,
                                                                    subHeading:
                                                                        e.target.value,
                                                                }
                                                                : b
                                                        )
                                                )
                                            }
                                        />

                                        {block.explanationLines.map(
                                            (line, idx) => (
                                                <Input
                                                    key={idx}
                                                    placeholder={`English explanation ${idx + 1
                                                        }`}
                                                    value={line}
                                                    onChange={(e) =>
                                                        setCustomBlocks(
                                                            (prev) =>
                                                                prev.map((b) => {
                                                                    if (
                                                                        b.key !==
                                                                        block.key
                                                                    )
                                                                        return b;

                                                                    const next = [
                                                                        ...b.explanationLines,
                                                                    ];

                                                                    next[idx] =
                                                                        e.target.value;

                                                                    return {
                                                                        ...b,
                                                                        explanationLines:
                                                                            next,
                                                                    };
                                                                })
                                                        )
                                                    }
                                                />
                                            )
                                        )}

                                    </div>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* ARABIC TAB */}

                    {activeTab === "arabic" && (
                        <div className="space-y-8">

                            <div className="grid grid-cols-1 gap-6">

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Arabic Name
                                    </label>

                                    <Input
                                        dir="rtl"
                                        value={arabicNameDraft}
                                        onChange={(e) =>
                                            setArabicNameDraft(
                                                e.target.value
                                            )
                                        }
                                        placeholder="الاسم بالعربية"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Arabic Description
                                    </label>

                                    <Textarea
                                        dir="rtl"
                                        rows={5}
                                        value={
                                            arabicDescriptionDraft
                                        }
                                        onChange={(e) =>
                                            setArabicDescriptionDraft(
                                                e.target.value
                                            )
                                        }
                                        placeholder="الوصف بالعربية"
                                    />
                                </div>

                            </div>

                            <div className="space-y-5">

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Arabic Custom Sections
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Add Arabic headings and explanations
                                    </p>
                                </div>

                                {customBlocks.map((block) => (
                                    <div
                                        key={block.key}
                                        className="border rounded-xl p-5 space-y-4 bg-muted/20"
                                    >

                                        <Input
                                            dir="rtl"
                                            placeholder="العنوان بالعربية"
                                            value={
                                                block.arabicSubHeading
                                            }
                                            onChange={(e) =>
                                                setCustomBlocks(
                                                    (prev) =>
                                                        prev.map((b) =>
                                                            b.key === block.key
                                                                ? {
                                                                    ...b,
                                                                    arabicSubHeading:
                                                                        e.target.value,
                                                                }
                                                                : b
                                                        )
                                                )
                                            }
                                        />

                                        {block.arabicExplanationLines.map(
                                            (line, idx) => (
                                                <Input
                                                    key={idx}
                                                    dir="rtl"
                                                    placeholder={`الشرح ${idx + 1
                                                        }`}
                                                    value={line}
                                                    onChange={(e) =>
                                                        setCustomBlocks(
                                                            (prev) =>
                                                                prev.map((b) => {
                                                                    if (
                                                                        b.key !==
                                                                        block.key
                                                                    )
                                                                        return b;

                                                                    const next = [
                                                                        ...b.arabicExplanationLines,
                                                                    ];

                                                                    next[idx] =
                                                                        e.target.value;

                                                                    return {
                                                                        ...b,
                                                                        arabicExplanationLines:
                                                                            next,
                                                                    };
                                                                })
                                                        )
                                                    }
                                                />
                                            )
                                        )}

                                    </div>
                                ))}

                            </div>

                        </div>
                    )}

                </div>

                {/* FOOTER */}

                <div className="border-t px-6 py-5 flex justify-end gap-3">

                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                "/subspecialities"
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={submit}
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : mode === "create"
                                ? "Create Subspeciality"
                                : "Update Subspeciality"}
                    </Button>

                </div>

            </div>

        </div>
    );
};

export default SubspecialityForm;