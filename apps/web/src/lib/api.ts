export function getApiBaseUrl(): string {
  const meta = import.meta as { env?: { VITE_API_URL?: string } };
  if (meta.env?.VITE_API_URL) {
    return meta.env.VITE_API_URL;
  }

  // In browser environments, default to the current origin.
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  // Fall back to empty string; callers should handle relative URLs safely.
  return '';
}
