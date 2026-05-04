import { Plus, Trash2 } from "lucide-react";

/** One department content block (matches backend `CustomExplainantion`). */
export type DepartmentCustomExplanationBlock = {
  subHeading: string;
  explaination: string[];
};

export type DepartmentRichContentValues = {
  customExplainantions: DepartmentCustomExplanationBlock[];
};

export const richContentInitialValues: DepartmentRichContentValues = {
  customExplainantions: [],
};

type RichFieldsProps = {
  values: DepartmentRichContentValues;
  setFieldValue: (field: string, value: DepartmentCustomExplanationBlock[] | string) => void;
};

/** One input per row; add/remove lines. Empty state shows one blank row to type into. */
function AddableLinesField({
  label,
  optional,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  optional?: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const displayRows = value.length === 0 ? [""] : value;

  const updateRow = (index: number, text: string) => {
    const next = [...displayRows];
    next[index] = text;
    onChange(next);
  };

  const addRow = () => {
    onChange([...displayRows, ""]);
  };

  const removeRow = (index: number) => {
    if (displayRows.length <= 1) {
      onChange([]);
      return;
    }
    onChange(displayRows.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-xs font-medium block mb-1">
        {label}{" "}
        {optional && <span className="text-muted-foreground font-normal">(optional)</span>}
      </label>
      <div className="space-y-2">
        {displayRows.map((line, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              value={line}
              onChange={(e) => updateRow(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="shrink-0 p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
              title="Remove line"
              aria-label="Remove line"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-burgundy/50 hover:bg-muted/50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add line
      </button>
    </div>
  );
}

function FieldTextInput({
  label,
  optional,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1">
        {label}{" "}
        {optional && <span className="text-muted-foreground font-normal">(optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all"
      />
    </div>
  );
}

/** Repeatable sections (sub-heading + bullet lines) for create & edit department modals */
export function DepartmentRichFields({ values, setFieldValue }: RichFieldsProps) {
  const blocks = values.customExplainantions;

  const updateBlock = (index: number, next: DepartmentCustomExplanationBlock) => {
    const copy = [...blocks];
    copy[index] = next;
    setFieldValue("customExplainantions", copy);
  };

  const addBlock = () => {
    setFieldValue("customExplainantions", [...blocks, { subHeading: "", explaination: [] }]);
  };

  const removeBlock = (index: number) => {
    setFieldValue(
      "customExplainantions",
      blocks.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">Department page content</p>
        <button
          type="button"
          onClick={addBlock}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-burgundy/50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add section
        </button>
      </div>

      {blocks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No extra sections. Use &quot;Add section&quot; for sub-headings and bullet points.</p>
      ) : null}

      {blocks.map((block, index) => (
        <div
          key={index}
          className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-3 relative"
        >
          <button
            type="button"
            onClick={() => removeBlock(index)}
            className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-background/80 transition-colors"
            title="Remove section"
            aria-label="Remove section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="pr-10">
            <FieldTextInput
              label="Section heading"
              optional
              value={block.subHeading}
              onChange={(v) => updateBlock(index, { ...block, subHeading: v })}
              placeholder="e.g. Our services"
            />
          </div>
          <AddableLinesField
            label="Points"
            optional
            value={block.explaination}
            onChange={(lines) => updateBlock(index, { ...block, explaination: lines })}
            placeholder="One bullet per line"
          />
        </div>
      ))}
    </div>
  );
}

/** Append rich content to multipart body (JSON for customExplainantions). */
export function appendDepartmentRichContentToFormData(
  formPayload: FormData,
  content: DepartmentRichContentValues,
) {
  const normalized = content.customExplainantions
    .map((b) => ({
      subHeading: (b.subHeading || "").trim(),
      explaination: (b.explaination || []).map((s) => s.trim()).filter(Boolean),
    }))
    .filter((b) => b.subHeading.length > 0 || b.explaination.length > 0);
  formPayload.append("customExplainantions", JSON.stringify(normalized));
}

/** Map API department document to rich content initial values */
export function richContentFromApi(dept: Record<string, unknown> | null | undefined): DepartmentRichContentValues {
  if (!dept) return { ...richContentInitialValues };

  const raw = dept.customExplainantions;
  if (!Array.isArray(raw) || raw.length === 0) return { ...richContentInitialValues };

  return {
    customExplainantions: raw.map((item) => {
      const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const ex = o.explaination ?? o.explanations;
      return {
        subHeading: typeof o.subHeading === "string" ? o.subHeading : "",
        explaination: Array.isArray(ex) ? ex.map((x) => String(x).trim()).filter(Boolean) : [],
      };
    }),
  };
}
