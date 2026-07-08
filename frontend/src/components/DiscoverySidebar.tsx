import { useMemo, useState } from "react";
import type { Element } from "../types";
import { SidebarItem } from "./SidebarItem";

type DiscoverySidebarProps = {
  elements: Element[];
  onSpawn: (element: Element) => void;
  onReset: () => void;
  onToggleGraph: () => void;
};

export function DiscoverySidebar({
  elements,
  onSpawn,
  onReset,
  onToggleGraph,
}: DiscoverySidebarProps) {
  const [query, setQuery] = useState("");

  const filteredElements = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return elements;
    }

    return elements.filter((element) =>
      element.element.toLowerCase().includes(q),
    );
  }, [elements, query]);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Discovered</h2>

      <div className="sidebar-search-row">
        <input
          className="sidebar-search"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          className="graph-button"
          onClick={onToggleGraph}
          title="Open discovery graph"
        >
          🕸️
        </button>
      </div>

      <div className="library-grid">
        {filteredElements.map((element) => (
          <SidebarItem
            key={element.id}
            element={element}
            onSpawn={onSpawn}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="reset-button" onClick={onReset}>
          Reset World
        </button>
      </div>
    </div>
  );
}