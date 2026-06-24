const PUBLIC_SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:8080"
).replace(/\/$/, "");

function appendCacheVersion(
  base: string,
  cacheVersion?: string | number,
): string {
  if (cacheVersion === undefined || cacheVersion === null || cacheVersion === "") {
    return base;
  }
  return `${base}?v=${encodeURIComponent(String(cacheVersion))}`;
}

/** Encode each path segment so spaces and special chars work in links and QR scans. */
export function encodeDocumentPublicPath(publicPath: string): string {
  const trimmed = publicPath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const rawPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const segments = rawPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)));
  return `/${segments.join("/")}`;
}

export function buildDocumentShareUrl(
  publicPath?: string,
  cacheVersion?: string | number,
): string {
  if (!publicPath) return "";
  if (publicPath.startsWith("http://") || publicPath.startsWith("https://")) {
    return publicPath;
  }
  const base = `${PUBLIC_SITE_URL}${encodeDocumentPublicPath(publicPath)}`;
  return appendCacheVersion(base, cacheVersion);
}

/**
 * Direct PDF stream URL for QR codes — opens the file immediately on scan
 * (bypasses SPA routing and empty nginx static files on legacy paths).
 */
export function buildDocumentQrUrl(
  publicPath?: string,
  cacheVersion?: string | number,
): string {
  if (!publicPath) return "";
  if (publicPath.startsWith("http://") || publicPath.startsWith("https://")) {
    return publicPath;
  }
  const encodedPath = encodeDocumentPublicPath(publicPath)
    .replace(/^\//, "")
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
  const base = `${PUBLIC_SITE_URL}/api/v1/runtime-pdf-viewer/file/${encodedPath}`;
  return appendCacheVersion(base, cacheVersion);
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
  let trimmed = publicPath.trim();
  if (!trimmed.startsWith("/")) return false;

  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    return false;
  }

  const basename = trimmed.split("/").pop() || "";
  return PUBLIC_PATH_EXTENSION_RE.test(basename);
}
