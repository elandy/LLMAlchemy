import "reactflow/dist/style.css";

import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { combineElements } from "./api";
import { DiscoverySidebar } from "./components/DiscoverySidebar";
import { DraggableTile } from "./components/DraggableTile";
import { ElementGraph } from "./components/ElementGraph";
import { ResetModal } from "./components/ResetModal";
import { initialElements, initialWorkspace } from "./constants";
import type { Element, WorkspaceItem } from "./types";
import { isOverlapping } from "./utils";
import { clearState, loadState, saveState } from "./storage";
import {
  playBuffer,
  toggleMute,
  isMuted,
  foundBuffer,
  newBuffer,
  putBuffer,
} from "./audio";

export default function App() {
  const initialState = useMemo(() => loadState(), []);
  const [elements, setElements] = useState<Element[]>(initialState.elements);
  const [workspace, setWorkspace] = useState<WorkspaceItem[]>(initialState.workspace);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [muted, setMuted] = useState(isMuted());
  const [showGraph, setShowGraph] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    saveState({ elements, workspace });
  }, [elements, workspace]);

  function confirmResetWorld() {
    clearState();
    setElements(initialElements);
    setWorkspace(initialWorkspace);
    setOpenTooltip(null);
    setShowResetModal(false);
  }

  async function combine(
    pendingId: string,
    leftElement: string,
    rightElement: string,
  ) {
    try {
      const data = await combineElements(leftElement, rightElement);

      setWorkspace((prev) =>
        prev.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                element: data.result,
                color: data.color,
                emoji: data.emoji,
                explanation: data.explanation,
                isLoading: false,
                parents: [leftElement, rightElement],
              }
            : item,
        ),
      );

      setElements((prev: Element[]) => {
        const exists = prev.some((element) => element.element === data.result);

        if (exists) {
          playBuffer(foundBuffer);
          return prev;
        }

        playBuffer(newBuffer);
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            element: data.result,
            color: data.color,
            emoji: data.emoji,
            explanation: data.explanation,
            parents: [leftElement, rightElement],
          },
        ].sort((left, right) => left.element.localeCompare(right.element));
      });
    } catch {
      setWorkspace((prev) =>
        prev.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                element: "Error",
                color: "#b91c1c",
                explanation: "The combination request failed.",
                isLoading: false,
              }
            : item,
        ),
      );
    }
  }

  function spawnElement(element: Element, x?: number, y?: number) {
    playBuffer(putBuffer);
    setWorkspace((prev: WorkspaceItem[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        element: element.element,
        color: element.color,
        emoji: element.emoji,
        explanation: element.explanation,
        x: x ?? 200 + Math.random() * 100,
        y: y ?? 200 + Math.random() * 100,
      },
    ]);
  }

  async function handleDragEnd(event: any) {
    const { active, delta } = event;
    const activeId = active.id;
    type PendingCombination = {
      pendingId: string;
      leftElement: string;
      rightElement: string;
      removedIds: string[];
    };
    let nextCombination: PendingCombination | undefined;

    setWorkspace((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== activeId) {
          return item;
        }

        return {
          ...item,
          x: item.x + delta.x,
          y: item.y + delta.y,
        };
      });

      const dragged = updated.find((item) => item.id === activeId);

      if (!dragged || dragged.isLoading) {
        return updated;
      }

      const target = updated.find(
        (item) =>
          item.id !== activeId &&
          !item.isLoading &&
          isOverlapping(dragged, item),
      );

      if (!target) {
        return updated;
      }

      nextCombination = {
        pendingId: target.id,
        leftElement: dragged.element,
        rightElement: target.element,
        removedIds: [dragged.id, target.id],
      };

      return updated
        .filter((item) => item.id !== dragged.id)
        .map((item) =>
          item.id === target.id
            ? {
                ...item,
                element: "Loading...",
                emoji: "⏳",
                color: "#888888",
                explanation: "Combining elements...",
                parents: [dragged.element, target.element],
                isLoading: true,
              }
            : item,
        );
    });

    if (!nextCombination) {
      return;
    }

    const combination = nextCombination;

    setOpenTooltip((current) =>
      combination.removedIds.includes(current ?? "") ? null : current,
    );

    void combine(
      combination.pendingId,
      combination.leftElement,
      combination.rightElement,
    );
  }

  return (
    <div className="app">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div
          className="workspace"
          onClick={() => setOpenTooltip(null)}
        >
          <button className="mute-button" onClick={(e) => {
              e.stopPropagation();
              setMuted(toggleMute());
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          {workspace.map((item) => (
            <DraggableTile
              key={item.id}
              item={item}
              elements={elements}
              isTooltipOpen={openTooltip === item.id}
              onToggleTooltip={setOpenTooltip}
            />
          ))}
        </div>

        <DiscoverySidebar
          elements={elements}
          onSpawn={spawnElement}
          onReset={() => setShowResetModal(true)}
          onToggleGraph={() => setShowGraph((prev) => !prev)}
        />

        {showResetModal && (
          <ResetModal
            onCancel={() => setShowResetModal(false)}
            onConfirm={confirmResetWorld}
          />
        )}

      </DndContext>

      {showGraph && (
        <div className="graph-overlay">
          <ElementGraph
            elements={elements}
            onClose={() => setShowGraph(false)}
          />
        </div>
      )}
    </div>
  );
}
