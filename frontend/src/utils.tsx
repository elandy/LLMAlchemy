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

export function invertColor(color: string): string {
  // only works reliably for hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);

    const r = 255 - parseInt(hex.substring(0, 2), 16);
    const g = 255 - parseInt(hex.substring(2, 4), 16);
    const b = 255 - parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // fallback for named colors
  return "black";
}