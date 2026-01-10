export function getApiBaseUrl(): string {
  return (import.meta as unknown).env?.VITE_API_URL || "";
}
