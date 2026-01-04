export function getApiBaseUrl(): string {
  return (import.meta as any).env?.VITE_API_URL || "";
}
