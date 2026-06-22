import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExpertiseSectionForm } from "@/lib/doctorForm";

type ExpertiseSectionsEditorProps = {
  sections: ExpertiseSectionForm[];
  onChange: (sections: ExpertiseSectionForm[]) => void;
  lang: "english" | "arabic";
};

const emptySection = (): ExpertiseSectionForm => ({
  subHeading: "",
  subHeadingAr: "",
  points: [""],
  pointsAr: [""],
});

const normalizePointRows = (rows: string[]) => {
  const trimmed = rows.map((row) => row.trim());
  return trimmed.length ? trimmed : [""];
};

const ExpertiseSectionsEditor = ({
  sections,
  onChange,
  lang,
}: ExpertiseSectionsEditorProps) => {
  const isArabic = lang === "arabic";
  const safeSections = sections.length ? sections : [emptySection()];
  const pointsField = isArabic ? "pointsAr" : "points";

  const updateSection = (index: number, patch: Partial<ExpertiseSectionForm>) => {
    const next = safeSections.map((section, i) =>
      i === index ? { ...section, ...patch } : { ...section },
    );
    onChange(next);
  };

  const updatePoint = (sectionIndex: number, pointIndex: number, value: string) => {
    const section = safeSections[sectionIndex];
    const nextPoints = [...normalizePointRows(section[pointsField])];
    nextPoints[pointIndex] = value;
    updateSection(sectionIndex, { [pointsField]: nextPoints });
  };

  const addPoint = (sectionIndex: number) => {
    const section = safeSections[sectionIndex];
    updateSection(sectionIndex, {
      [pointsField]: [...normalizePointRows(section[pointsField]), ""],
    });
  };

  const removePoint = (sectionIndex: number, pointIndex: number) => {
    const section = safeSections[sectionIndex];
    const rows = normalizePointRows(section[pointsField]);
    const next = rows.length <= 1 ? [""] : rows.filter((_, i) => i !== pointIndex);
    updateSection(sectionIndex, { [pointsField]: next });
  };

  const addSection = () => {
    onChange([...safeSections, emptySection()]);
  };

  const removeSection = (index: number) => {
    if (safeSections.length <= 1) {
      onChange([emptySection()]);
      return;
    }
    onChange(safeSections.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-md font-semibold text-slate-800">
            {isArabic ? "الخبرة" : "Experience"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic
              ? "أضف عناوين الأقسام ونقاط الخبرة بالعربية."
              : "Add section headings and experience bullet points in English."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5 shrink-0"
        >
          <Plus className="h-3 w-3" />
          {isArabic ? "أضف قسمًا" : "Add section"}
        </Button>
      </div>

      <div className="space-y-6">
        {safeSections.map((section, sectionIndex) => (
          <div
            key={section.id ?? `expertise-section-${sectionIndex}`}
            className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                {isArabic ? `القسم ${sectionIndex + 1}` : `Section ${sectionIndex + 1}`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSection(sectionIndex)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isArabic ? "حذف القسم" : "Remove section"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? "العنوان الفرعي" : "Sub-heading"}
              </label>
              <Input
                value={isArabic ? section.subHeadingAr ?? "" : section.subHeading ?? ""}
                onChange={(e) =>
                  updateSection(
                    sectionIndex,
                    isArabic
                      ? { subHeadingAr: e.target.value }
                      : { subHeading: e.target.value },
                  )
                }
                placeholder={isArabic ? "مثال: مجالات الخبرة:" : "e.g. Areas of experience:"}
                className="h-11"
                dir={isArabic ? "rtl" : "ltr"}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                {isArabic ? "النقاط" : "Points"}
              </label>
              {normalizePointRows(section[pointsField]).map((point, pointIndex) => (
                <div key={`point-${sectionIndex}-${pointIndex}`} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => updatePoint(sectionIndex, pointIndex, e.target.value)}
                    placeholder={isArabic ? `نقطة ${pointIndex + 1}` : `Point ${pointIndex + 1}`}
                    className="flex-1 h-11"
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePoint(sectionIndex, pointIndex)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-11 w-11"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addPoint(sectionIndex)}
                className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5"
              >
                <Plus className="h-3 w-3" />
                {isArabic ? "أضف نقطة" : "Add point"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpertiseSectionsEditor;
