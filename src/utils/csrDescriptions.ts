export const normalizeDescriptionField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : [""];
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [""];
};

export const getDescriptionList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

export const appendDescriptionsToFormData = (
  formData: FormData,
  description: string[],
  descriptionArabic: string[],
) => {
  description
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      formData.append("description", item);
    });

  descriptionArabic
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      formData.append("descriptionArabic", item);
    });
};
