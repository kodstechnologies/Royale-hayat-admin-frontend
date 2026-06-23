const PUBLIC_SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:8080"
).replace(/\/$/, "");

export function buildDocumentShareUrl(
  publicPath?: string,
  cacheVersion?: string | number,
): string {
  if (!publicPath) return "";
  if (publicPath.startsWith("http://") || publicPath.startsWith("https://")) {
    return publicPath;
  }
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  const base = `${PUBLIC_SITE_URL}${path}`;
  if (cacheVersion === undefined || cacheVersion === null || cacheVersion === "") {
    return base;
  }
  return `${base}?v=${encodeURIComponent(String(cacheVersion))}`;
}

export function getPublicSiteOrigin(): string {
  return PUBLIC_SITE_URL;
}

export function suggestDocumentPublicPath(filename: string): string {
  const basename = filename.split(/[/\\]/).pop()?.trim();
  if (!basename) return "/Runtime/uploads/file.pdf";
  return `/Runtime/uploads/${basename}`;
}

const PUBLIC_PATH_EXTENSION_RE = /\.(pdf|png|jpe?g|webp)$/i;

export function isValidDocumentPublicPath(publicPath: string): boolean {
  const trimmed = publicPath.trim();
  if (!trimmed.startsWith("/")) return false;
  const basename = trimmed.split("/").pop() || "";
  return PUBLIC_PATH_EXTENSION_RE.test(basename);
}
