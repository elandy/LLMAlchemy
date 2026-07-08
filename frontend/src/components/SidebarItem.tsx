import type { Element } from "../types";
import { getReadableTextColor } from "../utils";

type SidebarItemProps = {
  element: Element;
  onSpawn: (element: Element) => void;
};

export function SidebarItem({ element, onSpawn }: SidebarItemProps) {
  return (
    <div
      className="library-item"
      onClick={() => onSpawn(element)}
      style={{
        backgroundColor: element.color,
        color: getReadableTextColor(element.color),
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <>
        <span style={{ marginRight: 6 }}>{element.emoji}</span>
        {element.element}
      </>
    </div>
  );
}
