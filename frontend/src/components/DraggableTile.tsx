import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import { playBuffer, pickBuffer, dropBuffer } from "../audio";

import type { Element, WorkspaceItem } from "../types";
import { getReadableTextColor } from "../utils";

type DraggableTileProps = {
  item: WorkspaceItem;
  elements: Element[];
  isTooltipOpen: boolean;
  onToggleTooltip: (id: string | null) => void;
};

export function DraggableTile({
  item,
  elements,
  isTooltipOpen,
  onToggleTooltip,
}: DraggableTileProps) {
  const isLoading = item.isLoading;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    disabled: isLoading,
  });
  useDndMonitor({
    onDragStart(event) {
      if (event.active.id === item.id) {
        playBuffer(pickBuffer);
      }
    },
    onDragEnd(event) {
      if (event.active.id === item.id) {
        playBuffer(dropBuffer);
      }
    },
  });

  const explanation =
    item.explanation ??
    elements.find((element) => element.element === item.element)?.explanation;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="tile"
      onClick={(event) => {
        event.stopPropagation();
        onToggleTooltip(isTooltipOpen ? null : item.id);
      }}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        backgroundColor: item.color,
        color: getReadableTextColor(item.color),
        fontWeight: 600,
        opacity: isLoading ? 0.5 : 1,
        zIndex: isTooltipOpen ? 20 : 1,
      }}
    >
      {isLoading ? (
        "⏳ Loading..."
      ) : (
        <>
          <span style={{ marginRight: 6 }}>{item.emoji}</span>
          {item.element}
        </>
      )}

      {isTooltipOpen && explanation && (
        <div className="tooltip">
          <strong>
            {item.emoji} {item.element}
          </strong>
          <br />
          {explanation}
        </div>
      )}
    </div>
  );
}
