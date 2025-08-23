import { usePathname } from "expo-router";

/**
 * Returns a stable route "name" derived from the current pathname.
 * Optimized for the tabs in `(tabs)`: index | explore | profile | admin.
 * Falls back to the last segment for non-tab routes.
 */
export function useCurrentRouteName(): string | undefined {
  const pathname = usePathname();
  if (!pathname) return undefined;

  // Normalize by stripping query/hash and trailing slashes
  const cleaned = pathname.split("?")[0].split("#")[0].replace(/\/$/, "");

  if (cleaned === "" || cleaned === "/") return "index";
  if (cleaned.startsWith("/explore")) return "explore";
  if (cleaned.startsWith("/profile")) return "profile";
  if (cleaned.startsWith("/admin")) return "admin";

  // Fallback: return last segment as a route-ish name
  const parts = cleaned.replace(/^\/+/, "").split("/");
  return parts[parts.length - 1] || "index";
}
