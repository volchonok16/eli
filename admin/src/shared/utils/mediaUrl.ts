export function resolveProductImage(
  image?: { url?: string; key?: string } | null
): string {
  if (!image) return "";
  if (image.key) {
    return `/api/files/${image.key}`;
  }
  return resolveMediaUrl(image.url);
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  if (url.startsWith("/api/files/")) {
    return url;
  }

  if (url.startsWith("/")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/files/")) {
      return parsed.pathname;
    }
  } catch {
    return url;
  }

  return url;
}
