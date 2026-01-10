export function getApiBaseUrl(): string {
  const meta = import.meta as { env?: { VITE_API_URL?: string } };
  return meta.env?.VITE_API_URL || "";
}
