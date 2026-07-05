export type Element = {
  id: string;
  element: string;
  color: string;
  explanation?: string;
  parents?: string[];
};

export type WorkspaceItem = {
  id: string;
  element: string;
  x: number;
  y: number;
  color: string;
  explanation?: string;
  parents?: string[];
  isLoading?: boolean;
};

export type DraggableTileProps = {
  item: WorkspaceItem;
  onOpen: (id: string | null) => void;
};

export type Reaction = {
  id: string;
  aId: string;
  bId: string;
  status: "loading" | "done" | "error";
  resultId?: string;
};