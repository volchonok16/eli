/** Нормализует URL медиа: относительный /api/files/... или старый absolute localhost:3000 */
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
