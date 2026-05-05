import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getDepartmentById } from "@/api/department";
import Loader from "@/components/SkeletonLoader";

type Department = {
  _id: string;
  departmentId: string;
  name: string;
  description: string;
  image?: string;
  catagory?: string | { _id?: string; name?: string };
  subspecialities?: (string | { _id?: string; name?: string })[];
  customExplainantions?: { _id?: string; subHeading?: string; explaination?: string[] }[];
  isActive?: boolean;
  order?: number;
};

const ViewDepartment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const response = await getDepartmentById(id);
        if (cancelled) return;
        setDepartment(response?.data?.data || null);
      } catch (err: any) {
        if (!cancelled) {
          setDepartment(null);
          setError(err?.response?.data?.message || "Failed to load department details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const catName =
    typeof department?.catagory === "object" ? department.catagory?.name || "-" : department?.catagory || "-";
  const subs = (department?.subspecialities || [])
    .map((s) => (typeof s === "string" ? s : s?.name || ""))
    .filter(Boolean);

  return (
    <AdminLayout title="View Department">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/departments")}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Departments
        </button>
        {department?._id ? (
          <button
            type="button"
            onClick={() => navigate("/departments")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
          >
            <Pencil size={16} />
            Edit from List
          </button>
        ) : null}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">{error}</div>
      ) : !department ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Department not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-56 bg-muted flex items-center justify-center">
              {department.image ? (
                <img src={department.image} alt={department.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">No image</span>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Department ID</p>
              <p className="font-mono text-sm">{department.departmentId || "-"}</p>
              <p className="text-xs text-muted-foreground pt-2">Status</p>
              <p className="text-sm">{department.isActive === false ? "Inactive" : "Active"}</p>
              <p className="text-xs text-muted-foreground pt-2">Order</p>
              <p className="text-sm">{department.order ?? 0}</p>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <h2 className="text-2xl font-semibold">{department.name}</h2>
              <p className="text-xs text-muted-foreground mt-3 mb-1">Category</p>
              <p className="text-sm">{catName}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">{department.description || "-"}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Subspecialities</p>
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subspecialities linked.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subs.map((name) => (
                    <span key={name} className="px-2.5 py-1 rounded bg-muted text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Custom Explanation Sections</p>
              {!department.customExplainantions?.length ? (
                <p className="text-sm text-muted-foreground">No custom sections.</p>
              ) : (
                <div className="space-y-4">
                  {department.customExplainantions.map((block, index) => (
                    <div key={block._id || index} className="rounded-lg border border-border p-3">
                      {block.subHeading ? <p className="font-medium text-sm mb-2">{block.subHeading}</p> : null}
                      {block.explaination?.length ? (
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {block.explaination.map((line, li) => (
                            <li key={li}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No explanation lines.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ViewDepartment;
