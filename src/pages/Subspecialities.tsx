import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createSubspeciality,
  deleteSubspeciality as deleteSubspecialityApi,
  getSubspecialities,
  updateSubspeciality as updateSubspecialityApi,
  type CustomSubspecialityInput,
  type Subspeciality,
} from "@/api/subspeciality";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AlertBox from "@/components/AlertBox";
import Loader from "@/components/SkeletonLoader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomBlockDraft = {
  key: string;
  /** When loaded from API — unchanged blocks are sent back as id on update */
  serverId?: string;
  subHeading: string;
  explanationLines: string[];
};

function newKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function explanationPayload(lines: string[]) {
  return lines.map((s) => s.trim()).filter(Boolean);
}

function emptyBlock(): CustomBlockDraft {
  return { key: newKey(), subHeading: "", explanationLines: [""] };
}

function blocksFromRow(row: Subspeciality): CustomBlockDraft[] {
  const raw = row.customSubspecialities;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item, i) => {
    if (typeof item === "string") {
      return {
        key: item,
        serverId: item,
        subHeading: "",
        explanationLines: [""],
      };
    }
    const explanations = Array.isArray(item.explanations)
      ? item.explanations.map((x) => String(x))
      : [];
    return {
      key: String(item._id ?? `row-${i}`),
      serverId: item._id,
      subHeading: item.subHeading ?? "",
      explanationLines: explanations.length > 0 ? [...explanations] : [""],
    };
  });
}

function buildCreateCustomPayload(blocks: CustomBlockDraft[]): CustomSubspecialityInput[] | undefined {
  const out: CustomSubspecialityInput[] = [];
  for (const b of blocks) {
    const explanations = explanationPayload(b.explanationLines);
    const subHeading = b.subHeading.trim();
    if (!subHeading && explanations.length === 0) continue;
    out.push({
      ...(subHeading ? { subHeading } : {}),
      explanations,
    });
  }
  return out.length > 0 ? out : undefined;
}

function buildUpdateCustomPayload(
  blocks: CustomBlockDraft[],
  initialById: Map<string, { subHeading: string; explanations: string[] }>,
): (string | CustomSubspecialityInput)[] {
  const out: (string | CustomSubspecialityInput)[] = [];
  for (const b of blocks) {
    const explanations = explanationPayload(b.explanationLines);
    const subHeading = b.subHeading.trim();
    if (!subHeading && explanations.length === 0) continue;
    if (b.serverId) {
      const orig = initialById.get(b.serverId);
      if (
        orig &&
        orig.subHeading === subHeading &&
        JSON.stringify(orig.explanations) === JSON.stringify(explanations)
      ) {
        out.push(b.serverId);
        continue;
      }
    }
    out.push({
      ...(subHeading ? { subHeading } : {}),
      explanations,
    });
  }
  return out;
}

const Subspecialities = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Subspeciality[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [customBlocks, setCustomBlocks] = useState<CustomBlockDraft[]>([]);
  const initialCustomByIdRef = useRef<Map<string, { subHeading: string; explanations: string[] }>>(new Map());
  const [editing, setEditing] = useState<Subspeciality | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subspeciality | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [listNonce, setListNonce] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSubspecialities({
        page: currentPage,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setItems(res?.data?.data ?? []);
      setTotalPages(res?.data?.meta?.totalPages ?? 1);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message ?? "Failed to load subspecialities.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList, listNonce]);

  const openCreate = () => {
    setNameDraft("");
    setDescriptionDraft("");
    setCustomBlocks([]);
    initialCustomByIdRef.current = new Map();
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const name = nameDraft.trim();
    const description = descriptionDraft.trim();
    if (!name) {
      toast.error(t("Name is required"));
      return;
    }
    if (!description) {
      toast.error(t("Description is required"));
      return;
    }
    setSaving(true);
    try {
      const customSubspecialities = buildCreateCustomPayload(customBlocks);
      await createSubspeciality({
        name,
        description,
        ...(customSubspecialities ? { customSubspecialities } : {}),
      });
      toast.success(t("Subspeciality created successfully"));
      setCreateOpen(false);
      setCurrentPage(1);
      setSearch("");
      setSearchInput("");
      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t("Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row: Subspeciality) => {
    setEditing(row);
    setNameDraft(row.name);
    setDescriptionDraft(row.description ?? "");
    const blocks = blocksFromRow(row);
    setCustomBlocks(blocks.length > 0 ? blocks : []);
    const map = new Map<string, { subHeading: string; explanations: string[] }>();
    row.customSubspecialities?.forEach((c) => {
      if (c && typeof c === "object" && c._id) {
        const explanations = Array.isArray(c.explanations)
          ? c.explanations.map((x) => String(x).trim()).filter(Boolean)
          : [];
        map.set(c._id, {
          subHeading: (c.subHeading ?? "").trim(),
          explanations,
        });
      }
    });
    initialCustomByIdRef.current = map;
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editing) return;
    const name = nameDraft.trim();
    const description = descriptionDraft.trim();
    if (!name) {
      toast.error(t("Name is required"));
      return;
    }
    if (!description) {
      toast.error(t("Description is required"));
      return;
    }
    setSaving(true);
    try {
      const customSubspecialities = buildUpdateCustomPayload(customBlocks, initialCustomByIdRef.current);
      await updateSubspecialityApi(editing._id, {
        name,
        description,
        customSubspecialities,
      });
      toast.success(t("Subspeciality updated successfully"));
      setEditOpen(false);
      setEditing(null);
      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t("Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: Subspeciality) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteSubspecialityApi(toDelete._id);
      toast.success(t("Subspeciality deleted successfully"));
      setDeleteOpen(false);
      setToDelete(null);
      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? t("Failed to delete"));
    } finally {
      setDeleting(false);
    }
  };

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const truncate = (text: string, max: number) => {
    const s = text?.trim() ?? "";
    if (s.length <= max) return s;
    return `${s.slice(0, max)}…`;
  };

  const customBlockCount = (row: Subspeciality) => {
    const c = row.customSubspecialities;
    if (!Array.isArray(c)) return 0;
    return c.length;
  };

  const renderCustomBlocksEditor = () => (
    <div className="space-y-3 border-t border-border pt-3 mt-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{t("Custom sections")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setCustomBlocks((prev) => [...prev, emptyBlock()])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t("Add section")}
        </Button>
      </div>
      {customBlocks.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("Optional — add headings and bullet lines for this subspeciality.")}</p>
      ) : (
        <div className="space-y-4 max-h-[min(52vh,420px)] overflow-y-auto pr-1">
          {customBlocks.map((block) => (
            <div key={block.key} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t("Sub-heading")}</label>
                  <Input
                    value={block.subHeading}
                    onChange={(e) =>
                      setCustomBlocks((prev) =>
                        prev.map((b) => (b.key === block.key ? { ...b, subHeading: e.target.value } : b)),
                      )
                    }
                    placeholder={t("Section title")}
                    className="h-9 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setCustomBlocks((prev) => prev.filter((b) => b.key !== block.key))}
                  aria-label={t("Remove section")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t("Explanations")}</label>
                <div className="space-y-2">
                  {block.explanationLines.map((line, idx) => (
                    <div key={`${block.key}-ex-${idx}`} className="flex gap-2 items-center">
                      <Input
                        value={line}
                        onChange={(e) =>
                          setCustomBlocks((prev) =>
                            prev.map((b) => {
                              if (b.key !== block.key) return b;
                              const next = [...b.explanationLines];
                              next[idx] = e.target.value;
                              return { ...b, explanationLines: next };
                            }),
                          )
                        }
                        placeholder={t("One line per point")}
                        className="h-9 text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() =>
                          setCustomBlocks((prev) =>
                            prev.map((b) => {
                              if (b.key !== block.key) return b;
                              const next = b.explanationLines.filter((_, i) => i !== idx);
                              return {
                                ...b,
                                explanationLines: next.length > 0 ? next : [""],
                              };
                            }),
                          )
                        }
                        aria-label={t("Remove line")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs w-full border-dashed"
                  onClick={() =>
                    setCustomBlocks((prev) =>
                      prev.map((b) =>
                        b.key === block.key
                          ? { ...b, explanationLines: [...b.explanationLines, ""] }
                          : b,
                      ),
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("Add line")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout title="Subspecialities">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t("Subspecialities")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Manage hospital subspecialities used when creating departments.")}
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {t("Add subspeciality")}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-md">
          <Input
            placeholder={t("Search subspecialities...")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <Button variant="secondary" onClick={applySearch}>
            {t("Search")}
          </Button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead className="hidden md:table-cell max-w-[240px]">{t("Description")}</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">{t("Custom sections")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("Last Updated")}</TableHead>
                  <TableHead className="w-[120px] text-end">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      {t("No data available")}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[240px]">
                        <span className="line-clamp-2">{truncate(row.description ?? "", 120)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm tabular-nums">
                        {customBlockCount(row)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(row)}
                          aria-label={t("Edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(row)}
                          aria-label={t("Delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              {t("Back")}
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("Next")}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Add subspeciality")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Name")}</label>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={t("Subspeciality name")}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Description")}</label>
              <Textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder={t("Subspeciality description")}
                rows={4}
              />
            </div>
            {renderCustomBlocksEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={submitCreate} disabled={saving}>
              {saving ? t("Loading...") : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Edit subspeciality")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Name")}</label>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={t("Subspeciality name")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Description")}</label>
              <Textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                placeholder={t("Subspeciality description")}
                rows={4}
              />
            </div>
            {renderCustomBlocksEditor()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={submitEdit} disabled={saving}>
              {saving ? t("Loading...") : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertBox
        isOpen={deleteOpen}
        title={t("Delete subspeciality")}
        message={
          toDelete ? `${t("Delete subspeciality confirm")} "${toDelete.name}"?` : ""
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setToDelete(null);
          }
        }}
        onConfirm={runDelete}
      />
    </AdminLayout>
  );
};

export default Subspecialities;
