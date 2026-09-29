import { setBaseUrl } from "@workspace/api-client-react";

export function initApiConfig(): void {
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl && typeof customUrl === "string" && customUrl.trim() !== "") {
    setBaseUrl(customUrl.trim());
  } else {
    setBaseUrl(null); // Defaults to same-origin /api via Vite proxy or relative calls
  }
}
