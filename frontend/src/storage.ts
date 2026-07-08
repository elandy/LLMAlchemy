import { initialElements, initialWorkspace, STORAGE_KEY } from "./constants";
import type { Element, WorkspaceItem } from "./types";

export type PersistedState = {
  elements: Element[];
  workspace: WorkspaceItem[];
};

export function loadState(): PersistedState {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      elements: initialElements,
      workspace: initialWorkspace,
    };
  }

  try {
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {
      elements: initialElements,
      workspace: initialWorkspace,
    };
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
