import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type JobFormListFieldProps = {
  label: string;
  fieldName: string;
  values: string[];
  setFieldValue: (field: string, value: string[]) => void;
  placeholderPrefix: string;
  dir?: "ltr" | "rtl";
};

export const mapApiListField = (job: Record<string, unknown>, key: string): string[] =>
  Array.isArray(job[key]) && (job[key] as string[]).length
    ? (job[key] as string[])
    : [""];

export const filterListField = (items: string[]) => items.filter((item) => item.trim());

export const JobFormListField = ({
  label,
  fieldName,
  values,
  setFieldValue,
  placeholderPrefix,
  dir = "ltr",
}: JobFormListFieldProps) => {
  const isRtl = dir === "rtl";
  const items = values.length ? values : [""];

  const addItem = () => {
    setFieldValue(fieldName, [...items, ""]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setFieldValue(fieldName, updated.length ? updated : [""]);
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setFieldValue(fieldName, updated);
  };

  return (
    <div className="space-y-3" dir={dir}>
      <div
        className={`flex items-center justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <label
          className={`text-sm font-semibold text-slate-700 ${isRtl ? "text-right" : ""}`}
        >
          {label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1 border-burgundy/30 text-burgundy hover:bg-burgundy/5 shrink-0"
        >
          <Plus className="h-3 w-3" />
          {isRtl ? "أضف بنداً" : "Add Item"}
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <Input
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`${placeholderPrefix} ${idx + 1}`}
              className={`flex-1 h-10 ${isRtl ? "text-right" : ""}`}
              dir={dir}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(idx)}
              className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
