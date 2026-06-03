import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import BreadCrumb from "@/components/layout/BreadCrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronRight,
  Copy,
  ExternalLink,
  Folder,
  FolderPlus,
  Home,
  ImagePlus,
  Loader2,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import {
  createFolder,
  deleteFolder,
  deleteFolderFile,
  getFolderById,
  listFolders,
  renameFolder,
  updateFolderFile,
  uploadFolderFiles,
  type FileManagerFile,
  type FileManagerFolder,
  type UploadFileMeta,
} from "@/api/fileManager";

type BreadcrumbItem = { id: string | null; name: string };

type PendingUpload = {
  file: File;
  preview: string;
  fileName: string;
  slno: string;
};

const formatBytes = (bytes: number) => {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const suggestSlno = (files: FileManagerFile[], offset: number) => {
  const max = files.reduce((m, f) => Math.max(m, f.slno || 0), 0);
  return max + 1 + offset;
};

const FileManager = () => {
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<FileManagerFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FileManagerFolder | null>(
    null
  );
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: null, name: "My Drive" },
  ]);
  const [parentId, setParentId] = useState<string | null>(null);

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [showRenameFolder, setShowRenameFolder] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  const [editingFile, setEditingFile] = useState<FileManagerFile | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editSlno, setEditSlno] = useState("");
  const [editReplacement, setEditReplacement] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadFolders = useCallback(async (parent: string | null) => {
    const res = await listFolders(parent);
    setFolders(res.data ?? []);
  }, []);

  const loadCurrentFolder = useCallback(async (id: string) => {
    const res = await getFolderById(id);
    setCurrentFolder(res.data ?? null);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await loadFolders(parentId);
      if (currentFolder?._id) {
        await loadCurrentFolder(currentFolder._id);
      }
    } catch {
      toast.error("Failed to load file manager");
    } finally {
      setLoading(false);
    }
  }, [currentFolder?._id, loadCurrentFolder, loadFolders, parentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openFolder = async (folder: FileManagerFolder) => {
    setParentId(folder._id);
    setBreadcrumb((prev) => [...prev, { id: folder._id, name: folder.name }]);
    setLoading(true);
    try {
      await loadFolders(folder._id);
      await loadCurrentFolder(folder._id);
    } catch {
      toast.error("Failed to open folder");
    } finally {
      setLoading(false);
    }
  };

  const navigateBreadcrumb = async (index: number) => {
    const item = breadcrumb[index];
    const nextTrail = breadcrumb.slice(0, index + 1);
    setBreadcrumb(nextTrail);
    setParentId(item.id);
    setCurrentFolder(null);
    setLoading(true);
    try {
      await loadFolders(item.id);
      if (item.id) {
        await loadCurrentFolder(item.id);
      }
    } catch {
      toast.error("Failed to navigate");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    setCreatingFolder(true);
    try {
      await createFolder({ name: newFolderName.trim(), parent: parentId });
      toast.success("Folder created");
      setShowCreateFolder(false);
      setNewFolderName("");
      await refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create folder";
      toast.error(message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!currentFolder || !renameName.trim()) return;
    setRenamingFolder(true);
    try {
      await renameFolder(currentFolder._id, renameName.trim());
      toast.success("Folder renamed");
      setShowRenameFolder(false);
      setBreadcrumb((prev) =>
        prev.map((b) =>
          b.id === currentFolder._id ? { ...b, name: renameName.trim() } : b
        )
      );
      await refresh();
    } catch {
      toast.error("Failed to rename folder");
    } finally {
      setRenamingFolder(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!currentFolder) return;
    if (!window.confirm(`Delete folder "${currentFolder.name}" and all files?`)) {
      return;
    }
    setDeletingFolder(true);
    try {
      await deleteFolder(currentFolder._id);
      toast.success("Folder deleted");
      const parentIndex = breadcrumb.length - 2;
      if (parentIndex >= 0) {
        await navigateBreadcrumb(parentIndex);
      } else {
        setBreadcrumb([{ id: null, name: "My Drive" }]);
        setParentId(null);
        setCurrentFolder(null);
        await refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete folder";
      toast.error(message);
    } finally {
      setDeletingFolder(false);
    }
  };

  const onFilesPicked = (fileList: FileList | null) => {
    if (!fileList?.length || !currentFolder) return;
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!images.length) {
      toast.error("Please select image files only");
      return;
    }

    const existing = currentFolder.files ?? [];
    const pending: PendingUpload[] = images.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      fileName: file.name.replace(/\.[^.]+$/, ""),
      slno: String(suggestSlno(existing, index)),
    }));

    setPendingUploads(pending);
    setShowUpload(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeUploadDialog = () => {
    pendingUploads.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingUploads([]);
    setShowUpload(false);
  };

  const handleConfirmUpload = async () => {
    if (!currentFolder || !pendingUploads.length) return;
    setUploading(true);
    try {
      const files = pendingUploads.map((p) => p.file);
      const meta: UploadFileMeta[] = pendingUploads.map((p) => ({
        fileName: p.fileName.trim() || undefined,
        slno: p.slno.trim() ? Number(p.slno) : undefined,
      }));
      const res = await uploadFolderFiles(currentFolder._id, files, meta);
      setCurrentFolder(res.data);
      toast.success(`${files.length} image(s) uploaded`);
      closeUploadDialog();
      await loadFolders(parentId);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (file: FileManagerFile) => {
    const url = file.s3Url || file.previewUrl || "";
    if (!url) {
      toast.error("No URL available");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFileId(file._id);
      toast.success("S3 URL copied");
      setTimeout(() => setCopiedFileId(null), 2000);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const openEditFile = (file: FileManagerFile) => {
    setEditingFile(file);
    setEditFileName(file.originalName.replace(/\.[^.]+$/, ""));
    setEditSlno(String(file.slno));
    setEditReplacement(null);
    setEditPreview("");
  };

  const closeEditFile = () => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditingFile(null);
    setEditFileName("");
    setEditSlno("");
    setEditReplacement(null);
    setEditPreview("");
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const onEditReplacementPicked = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (editPreview) URL.revokeObjectURL(editPreview);
    setEditReplacement(file);
    setEditPreview(URL.createObjectURL(file));
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleSaveEdit = async () => {
    if (!currentFolder || !editingFile) return;
    if (!editFileName.trim()) {
      toast.error("File name is required");
      return;
    }
    const slnoNum = Number(editSlno);
    if (!editSlno.trim() || Number.isNaN(slnoNum) || slnoNum < 1) {
      toast.error("Valid Sl.No is required");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateFolderFile(
        currentFolder._id,
        editingFile._id,
        {
          originalName: editFileName.trim(),
          slno: slnoNum,
        },
        editReplacement ?? undefined
      );
      setCurrentFolder(res.data);
      toast.success("File updated");
      closeEditFile();
      await loadFolders(parentId);
    } catch {
      toast.error("Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteFile = async (file: FileManagerFile) => {
    if (!currentFolder) return;
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    setDeletingFileId(file._id);
    try {
      const res = await deleteFolderFile(currentFolder._id, file._id);
      setCurrentFolder(res.data);
      toast.success("File deleted");
      await loadFolders(parentId);
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingFileId(null);
    }
  };

  const files = currentFolder?.files ?? [];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <BreadCrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "File Manager" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              File Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Folders and images with Sl.No and S3 URLs
            </p>
          </div>
          {!currentFolder && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFilesPicked(e.target.files)}
          />
        </div>

        <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-600 mb-6">
          {breadcrumb.map((item, index) => (
            <span
              key={`${item.id ?? "root"}-${index}`}
              className="flex items-center gap-1"
            >
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              )}
              <button
                type="button"
                onClick={() => navigateBreadcrumb(index)}
                className="inline-flex items-center gap-1 hover:text-burgundy transition-colors"
              >
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {item.name}
              </button>
            </span>
          ))}
        </nav>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-burgundy" />
          </div>
        ) : (
          <>
            {!currentFolder && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Folders
              </h2>
              {folders.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                  No folders here. Create one to get started.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {folders.map((folder) => (
                    <button
                      key={folder._id}
                      type="button"
                      onClick={() => openFolder(folder)}
                      className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:border-burgundy/40 hover:shadow-sm ${
                        currentFolder?._id === folder._id
                          ? "border-burgundy bg-burgundy/5"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Folder className="h-8 w-8 text-amber-500" />
                      <span className="font-medium text-slate-800 truncate w-full">
                        {folder.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {folder.fileCount ?? 0} file(s)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
            )}

            {currentFolder && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Folder className="h-5 w-5 text-amber-500" />
                      {currentFolder.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {files.length} image(s) ·{" "}
                      {currentFolder.totalSizeFormatted ??
                        formatBytes(currentFolder.totalSize ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload images
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setRenameName(currentFolder.name);
                        setShowRenameFolder(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 hover:text-red-700"
                      disabled={deletingFolder}
                      onClick={handleDeleteFolder}
                    >
                      {deletingFolder ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete folder
                    </Button>
                  </div>
                </div>

                {files.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">
                    <ImagePlus className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No images in this folder yet.</p>
                    <Button
                      className="mt-4 gap-2 bg-burgundy hover:bg-burgundy/90"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload images
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <article
                        key={file._id}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col"
                      >
                        <div className="relative h-28 sm:h-32 bg-slate-100 flex items-center justify-center p-3">
                          {(file.previewUrl || file.s3Url) ? (
                            <img
                              src={file.previewUrl || file.s3Url}
                              alt={file.originalName}
                              className="max-w-full max-h-full w-auto h-auto object-contain"
                            />
                          ) : (
                            <div className="flex items-center justify-center text-slate-400">
                              <ImagePlus className="h-8 w-8" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-burgundy text-white text-xs font-mono font-semibold px-2 py-0.5 rounded-md">
                            #{file.slno}
                          </span>
                        </div>

                        <div className="p-3 flex flex-col gap-2 flex-1">
                          <p
                            className="text-sm font-medium text-slate-800 truncate"
                            title={file.originalName}
                          >
                            {file.originalName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.sizeFormatted ?? formatBytes(file.size)}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs flex-1 min-w-[80px]"
                              onClick={() => handleCopyUrl(file)}
                            >
                              {copiedFileId === file._id ? (
                                "Copied"
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copy URL
                                </>
                              )}
                            </Button>
                            {(file.previewUrl || file.s3Url) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                asChild
                              >
                                <a
                                  href={file.previewUrl || file.s3Url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open image"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => openEditFile(file)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingFileId === file._id}
                              onClick={() => handleDeleteFile(file)}
                            >
                              {deletingFileId === file._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy/90"
              disabled={creatingFolder}
              onClick={handleCreateFolder}
            >
              {creatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenameFolder} onOpenChange={setShowRenameFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameFolder(false)}>
              Cancel
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy/90"
              disabled={renamingFolder}
              onClick={handleRenameFolder}
            >
              {renamingFolder ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showUpload}
        onOpenChange={(open) => {
          if (!open) closeUploadDialog();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload images</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Optional file name and Sl.No per image. If Sl.No already exists, the
            next number is used automatically.
          </p>
          <div className="space-y-4 mt-2">
            {pendingUploads.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
              >
                <img
                  src={item.preview}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover shrink-0 border border-slate-200"
                />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                  <div className="space-y-1">
                    <Label className="text-xs">File name (optional)</Label>
                    <Input
                      value={item.fileName}
                      onChange={(e) => {
                        const next = [...pendingUploads];
                        next[index] = { ...next[index], fileName: e.target.value };
                        setPendingUploads(next);
                      }}
                      placeholder="Display name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sl.No</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.slno}
                      onChange={(e) => {
                        const next = [...pendingUploads];
                        next[index] = { ...next[index], slno: e.target.value };
                        setPendingUploads(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeUploadDialog}>
              Cancel
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy/90"
              disabled={uploading}
              onClick={handleConfirmUpload}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                `Upload ${pendingUploads.length} image(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingFile}
        onOpenChange={(open) => {
          if (!open) closeEditFile();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update file</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>File name</Label>
              <Input
                value={editFileName}
                onChange={(e) => setEditFileName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sl.No</Label>
              <Input
                type="number"
                min={1}
                value={editSlno}
                onChange={(e) => setEditSlno(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                If this number is taken, the next free Sl.No is assigned.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Replace image (optional)</Label>
              {(editPreview || editingFile?.previewUrl) && (
                <img
                  src={editPreview || editingFile?.previewUrl}
                  alt=""
                  className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editFileInputRef.current?.click()}
              >
                Choose new image
              </Button>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onEditReplacementPicked(e.target.files)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditFile}>
              Cancel
            </Button>
            <Button
              className="bg-burgundy hover:bg-burgundy/90"
              disabled={savingEdit}
              onClick={handleSaveEdit}
            >
              {savingEdit ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FileManager;
