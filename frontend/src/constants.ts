import type { Element, WorkspaceItem } from "./types";

export const STORAGE_KEY = "elemental-forge-state";

export const initialElements: Element[] = [
  { id: "fire", element: "Fire", emoji: "🔥", color: "orange" },
  { id: "water", element: "Water", emoji: "💧", color: "blue" },
  { id: "earth", element: "Earth", emoji: "🪨", color: "saddlebrown" },
  { id: "wind", element: "Wind", emoji: "💨", color: "lightgray" },
];

export const initialWorkspace: WorkspaceItem[] = [
  { id: "1", element: "Fire", emoji: "🔥", x: 120, y: 80, color: "orange" },
  { id: "2", element: "Water", emoji: "💧", x: 350, y: 90, color: "blue" },
  { id: "3", element: "Earth", emoji: "🪨", x: 180, y: 250, color: "saddlebrown" },
  { id: "4", element: "Wind", emoji: "💨", x: 450, y: 280, color: "lightgray" },
];
