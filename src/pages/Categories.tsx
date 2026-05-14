import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  createCatagory,
  deleteCatagory as deleteCatagoryApi,
  getCatagories,
  updateCatagory as updateCatagoryApi,
  type Catagory,
} from "@/api/catagory";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Categories = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<Catagory[]>([]);
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
  const [arabicNameDraft, setArabicNameDraft] = useState("");

  const [editing, setEditing] = useState<Catagory | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Catagory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [listNonce, setListNonce] = useState(0);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getCatagories({
        page: currentPage,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setItems(res?.data?.data ?? []);
      setTotalPages(res?.data?.meta?.totalPages ?? 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      const msg =
        err?.response?.data?.message ??
        "Failed to load categories.";

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
    setArabicNameDraft("");
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const name = nameDraft.trim();
    const arabicName = arabicNameDraft.trim();

    if (!name) {
      toast.error(t("Name is required"));
      return;
    }

    if (!arabicName) {
      toast.error(t("Arabic name is required"));
      return;
    }

    setSaving(true);

    try {
      await createCatagory({
        name,
        arabicName,
      });

      toast.success(t("Category created successfully"));

      setCreateOpen(false);

      setCurrentPage(1);
      setSearch("");
      setSearchInput("");

      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err?.response?.data?.message ??
        t("Failed to save")
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row: Catagory) => {
    setEditing(row);

    setNameDraft(row.name);
    setArabicNameDraft(row.arabicName || "");

    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editing) return;

    const name = nameDraft.trim();
    const arabicName = arabicNameDraft.trim();

    if (!name) {
      toast.error(t("Name is required"));
      return;
    }

    if (!arabicName) {
      toast.error(t("Arabic name is required"));
      return;
    }

    setSaving(true);

    try {
      await updateCatagoryApi(editing._id, {
        name,
        arabicName,
      });

      toast.success(t("Category updated successfully"));

      setEditOpen(false);
      setEditing(null);

      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err?.response?.data?.message ??
        t("Failed to save")
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row: Catagory) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const runDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteCatagoryApi(toDelete._id);

      toast.success(
        t("Category deleted successfully")
      );

      setDeleteOpen(false);
      setToDelete(null);

      setListNonce((n) => n + 1);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        err?.response?.data?.message ??
        t("Failed to delete")
      );
    } finally {
      setDeleting(false);
    }
  };

  const applySearch = () => {
    setSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <AdminLayout title="Categories">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t("Categories")}
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Manage hospital categories used when creating departments."
              )}
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t("Add category")}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-md">
          <Input
            placeholder={t("Search categories...")}
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && applySearch()
            }
          />

          <Button
            variant="secondary"
            onClick={applySearch}
          >
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
                  <TableHead>
                    {t("English Name")}
                  </TableHead>

                  <TableHead>
                    {t("Arabic Name")}
                  </TableHead>

                  <TableHead className="hidden md:table-cell">
                    {t("Last Updated")}
                  </TableHead>

                  <TableHead className="w-[120px] text-end">
                    {t("Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-10"
                    >
                      {t("No data available")}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-medium">
                        {row.name}
                      </TableCell>

                      <TableCell
                        className="font-medium"
                        dir="rtl"
                      >
                        {row.arabicName}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {row.updatedAt
                          ? new Date(
                            row.updatedAt
                          ).toLocaleString()
                          : "—"}
                      </TableCell>

                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            openEdit(row)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            confirmDelete(row)
                          }
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
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(1, p - 1)
                )
              }
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
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
            >
              {t("Next")}
            </Button>
          </div>
        )}
      </div>

      {/* CREATE */}

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Add category")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("English Name")}
              </label>

              <Input
                value={nameDraft}
                onChange={(e) =>
                  setNameDraft(e.target.value)
                }
                placeholder={t("Category name")}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("Arabic Name")}
              </label>

              <Input
                value={arabicNameDraft}
                onChange={(e) =>
                  setArabicNameDraft(e.target.value)
                }
                placeholder={t(
                  "Arabic category name"
                )}
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setCreateOpen(false)
              }
            >
              {t("Cancel")}
            </Button>

            <Button
              onClick={submitCreate}
              disabled={saving}
            >
              {saving
                ? t("Loading...")
                : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("Edit category")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("English Name")}
              </label>

              <Input
                value={nameDraft}
                onChange={(e) =>
                  setNameDraft(e.target.value)
                }
                placeholder={t("Category name")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("Arabic Name")}
              </label>

              <Input
                value={arabicNameDraft}
                onChange={(e) =>
                  setArabicNameDraft(e.target.value)
                }
                placeholder={t(
                  "Arabic category name"
                )}
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              {t("Cancel")}
            </Button>

            <Button
              onClick={submitEdit}
              disabled={saving}
            >
              {saving
                ? t("Loading...")
                : t("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertBox
        isOpen={deleteOpen}
        title={t("Delete category")}
        message={
          toDelete
            ? `${t(
              "Delete category confirm"
            )} "${toDelete.name}"?`
            : ""
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

export default Categories;