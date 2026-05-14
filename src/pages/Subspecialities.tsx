import { useCallback, useEffect, useState } from "react";

import AdminLayout from "@/components/layout/AdminLayout";

import { toast } from "sonner";

import { Link } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";

import {
  deleteSubspeciality as deleteSubspecialityApi,
  getSubspecialities,
  type Subspeciality,
} from "@/api/subspeciality";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

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

const Subspecialities = () => {
  const { t } = useLanguage();

  const [items, setItems] = useState<
    Subspeciality[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [limit] = useState(10);

  const [totalPages, setTotalPages] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [toDelete, setToDelete] =
    useState<Subspeciality | null>(
      null
    );

  const [deleting, setDeleting] =
    useState(false);

  const [listNonce, setListNonce] =
    useState(0);

  const fetchList = useCallback(
    async () => {
      setLoading(true);

      try {
        const res =
          await getSubspecialities({
            page: currentPage,
            limit,

            ...(search.trim()
              ? {
                search:
                  search.trim(),
              }
              : {}),
          });

        setItems(
          res?.data?.data ?? []
        );

        setTotalPages(
          res?.data?.meta
            ?.totalPages ?? 1
        );
      } catch (error: any) {
        toast.error(
          error?.response?.data
            ?.message ||
          "Failed to load"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit, search]
  );

  useEffect(() => {
    fetchList();
  }, [fetchList, listNonce]);

  const confirmDelete = (
    row: Subspeciality
  ) => {
    setToDelete(row);

    setDeleteOpen(true);
  };

  const runDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteSubspecialityApi(
        toDelete._id
      );

      toast.success(
        t(
          "Subspeciality deleted successfully"
        )
      );

      setDeleteOpen(false);

      setToDelete(null);

      setListNonce((n) => n + 1);
    } catch (error: any) {
      toast.error(
        error?.response?.data
          ?.message ||
        t("Failed to delete")
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Subspecialities">

      <div className="space-y-6">

        <div className="flex justify-between">

          <Input
            placeholder={t(
              "Search..."
            )}
            value={searchInput}
            onChange={(e) =>
              setSearchInput(
                e.target.value
              )
            }
          />

          <Button
            onClick={() =>
              setSearch(searchInput)
            }
          >
            {t("Search")}
          </Button>

          <Button asChild>
            <Link to="/subspecialities/create">
              <Plus className="h-4 w-4 mr-2" />
              {t(
                "Add Subspeciality"
              )}
            </Link>
          </Button>

        </div>

        {loading ? (
          <Loader />
        ) : (
          <Table>

            <TableHeader>
              <TableRow>

                <TableHead>
                  {t("Name")}
                </TableHead>

                <TableHead>
                  {t(
                    "Arabic Name"
                  )}
                </TableHead>

                <TableHead>
                  {t("Actions")}
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((row) => (
                <TableRow key={row._id}>

                  <TableCell>
                    {row.name}
                  </TableCell>

                  <TableCell dir="rtl">
                    {
                      row.arabicName
                    }
                  </TableCell>

                  <TableCell>

                    <Button
                      asChild
                      variant="ghost"
                    >
                      <Link
                        to={`/subspecialities/edit/${row._id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() =>
                        confirmDelete(
                          row
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        )}

      </div>

      <AlertBox
        isOpen={deleteOpen}
        title={t(
          "Delete subspeciality"
        )}
        message={
          toDelete
            ? `${t(
              "Delete subspeciality confirm"
            )} "${toDelete.name
            }"?`
            : ""
        }
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        isDeleting={deleting}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={runDelete}
      />

    </AdminLayout>
  );
};

export default Subspecialities;