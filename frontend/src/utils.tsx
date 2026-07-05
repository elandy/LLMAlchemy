import type {WorkspaceItem} from "./types.ts";

export function isOverlapping(a: WorkspaceItem, b: WorkspaceItem) {
  const size = 90;

  return !(
    a.x + size < b.x ||
    a.x > b.x + size ||
    a.y + size < b.y ||
    a.y > b.y + size
  );
}

export function getReadableTextColor(bg: string): string {
  // supports hex only for reliability
  if (!bg.startsWith("#")) return "#111827"; // dark gray fallback

  const hex = bg.slice(1);

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // luminance (perceived brightness)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.6 ? "#111827" : "#ffffff";
}