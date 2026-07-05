import "reactflow/dist/style.css";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";

import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Element, DraggableTileProps, WorkspaceItem } from "./types";
import { isOverlapping, getReadableTextColor } from "./utils";
import { layoutGraph } from "./graph";

const STORAGE_KEY = "elemental-forge-state";

type PersistedState = {
  elements: Element[];
  workspace: WorkspaceItem[];
};


const initialElements: Element[] = [
  { id: "fire", element: "Fire", color: "orange" },
  { id: "water", element: "Water", color: "blue" },
  { id: "earth", element: "Earth", color: "saddlebrown" },
  { id: "wind", element: "Wind", color: "lightgray" },
];

const initialWorkspace: WorkspaceItem[] = [
  { id: "1", element: "Fire", x: 120, y: 80, color: "orange" },
  { id: "2", element: "Water", x: 350, y: 90, color: "blue" },
  { id: "3", element: "Earth", x: 180, y: 250, color: "saddlebrown" },
  { id: "4", element: "Wind", x: 450, y: 280, color: "lightgray" },
];

function SidebarItem({element, onSpawn}: {element: Element; onSpawn: (e: Element) => void;}) {
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
      {element.element}
    </div>
  );
}

function loadState(): PersistedState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      elements: initialElements,
      workspace: initialWorkspace,
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      elements: initialElements,
      workspace: initialWorkspace,
    };
  }
}

export default function App() {
  const [elements, setElements] = useState<Element[]>(() => loadState().elements);
  const [workspace, setWorkspace] = useState<WorkspaceItem[]>(() => loadState().workspace);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [graphNodes, setGraphNodes] = useState<Node[]>(() => layoutGraph(initialElements).nodes);
  const [graphEdges, setGraphEdges] = useState<Edge[]>(() => layoutGraph(initialElements).edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(null);
  const graphElementIdsRef = useRef(new Set(initialElements.map((element) => element.id)));
  const [showResetModal, setShowResetModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {  // Persistence
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ elements, workspace })
    );
  }, [elements, workspace]);

  function confirmResetWorld() {
    localStorage.removeItem(STORAGE_KEY);

    setElements(initialElements);
    setWorkspace(initialWorkspace);

    setSelectedGraphNodeId(null);
    setOpenTooltip(null);

    setShowResetModal(false);
  }

  useEffect(() => {
    const hasNewElement =
      elements.length !== graphElementIdsRef.current.size ||
      elements.some((element) => !graphElementIdsRef.current.has(element.id));

    if (!hasNewElement) {
      return;
    }

    const nextGraph = layoutGraph(elements);
    graphElementIdsRef.current = new Set(elements.map((element) => element.id));
    setGraphNodes(nextGraph.nodes);
    setGraphEdges(nextGraph.edges);
  }, [elements]);

  useEffect(() => {
    if (!reactFlowInstance) {
      return;
    }

    reactFlowInstance.fitView({
      padding: 0.2,
      duration: 250,
    });
  }, [graphNodes, graphEdges, reactFlowInstance]);

  const graphElementsById = useMemo(
    () => new Map(elements.map((element) => [element.id, element])),
    [elements],
  );

  const highlightedParentIds = useMemo(() => {
    if (!selectedGraphNodeId) {
      return new Set<string>();
    }

    const selectedElement = graphElementsById.get(selectedGraphNodeId);

    if (!selectedElement?.parents?.length) {
      return new Set<string>();
    }

    const idsByName = new Map(elements.map((element) => [element.element, element.id]));

    return new Set(
      selectedElement.parents
        .map((parentName) => idsByName.get(parentName))
        .filter((id): id is string => id !== undefined),
    );
  }, [elements, graphElementsById, selectedGraphNodeId]);

  const displayGraphNodes = useMemo(
    () =>
      graphNodes.map((node) => {
        const isSelected = node.id === selectedGraphNodeId;
        const isParent = highlightedParentIds.has(node.id);
        const isDimmed = selectedGraphNodeId !== null && !isSelected && !isParent;

        return {
          ...node,
          style: {
            ...node.style,
            boxShadow: isSelected
              ? "0 0 0 3px rgba(37, 99, 235, 0.35)"
              : isParent
                ? "0 0 0 3px rgba(249, 115, 22, 0.3)"
                : "none",
            border: isSelected
              ? "2px solid rgb(37, 99, 235)"
              : isParent
                ? "2px solid rgb(249, 115, 22)"
                : "1px solid rgba(0, 0, 0, 0.2)",
            opacity: isDimmed ? 0.35 : 1,
          },
        };
      }),
    [graphNodes, highlightedParentIds, selectedGraphNodeId],
  );

  const displayGraphEdges = useMemo(
    () =>
      graphEdges.map((edge) => {
        const isHighlighted =
          selectedGraphNodeId !== null &&
          edge.target === selectedGraphNodeId &&
          highlightedParentIds.has(edge.source);
        const isDimmed = selectedGraphNodeId !== null && !isHighlighted;

        return {
          ...edge,
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? "rgb(249, 115, 22)" : "#94a3b8",
            strokeWidth: isHighlighted ? 3 : 1.5,
            opacity: isDimmed ? 0.2 : 0.85,
          },
        };
      }),
    [graphEdges, highlightedParentIds, selectedGraphNodeId],
  );

  async function combine(
    pendingId: string,
    leftElement: string,
    rightElement: string,
  ) {
    try {
      const res = await fetch("/api/combine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          left: leftElement,
          right: rightElement,
        }),
      });

      const data = await res.json();

      setWorkspace((prev) =>
        prev.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                element: data.result,
                color: data.color,
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
          return prev;
        }

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            element: data.result,
            color: data.color,
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
    setWorkspace((prev: WorkspaceItem[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        element: element.element,
        color: element.color,
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

  function DraggableTile({item, onOpen}: DraggableTileProps) {
    const isLoading = item.isLoading;

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: item.id,
      disabled: isLoading,
    });

    const explanation =
      item.explanation ??
      elements.find((element) => element.element === item.element)?.explanation;
    const textColor = getReadableTextColor(item.color);
    const isTooltipOpen = openTooltip === item.id && Boolean(explanation);

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="tile"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(openTooltip === item.id ? null : item.id);
        }}
        style={{
          position: "absolute",
          left: item.x,
          top: item.y,
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          backgroundColor: item.color,
          color: textColor,
          fontWeight: 600,
          opacity: isLoading ? 0.5 : 1,
          zIndex: isTooltipOpen ? 20 : 1,
        }}
      >
        {isLoading ? "Loading..." : item.element}

        {isTooltipOpen && (
          <div className="tooltip">
            {explanation}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <div
          className="workspace"
          onClick={() => setOpenTooltip(null)}
        >
          {workspace.map((item) => (
            <DraggableTile
              key={item.id}
              item={item}
              onOpen={setOpenTooltip}
            />
          ))}
        </div>

        <div className="sidebar">
          <h2 className="sidebar-title">Discovered</h2>

          <div className="library-grid">
            {elements.map((element) => (
              <SidebarItem
                key={element.id}
                element={element}
                onSpawn={spawnElement}
              />
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="reset-button" onClick={() => setShowResetModal(true)}>
              Reset World
            </button>
          </div>
        </div>

        {showResetModal && (
        <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reset world?</h3>

            <p>This will reset all your progress.</p>

            <div className="modal-actions">
              <button onClick={() => setShowResetModal(false)}>
                Cancel
              </button>

              <button className="danger" onClick={confirmResetWorld}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      </DndContext>

      <div className="reactflow-wrapper">
        <ReactFlow
          nodes={displayGraphNodes}
          edges={displayGraphEdges}
          fitView
          onInit={setReactFlowInstance}
          onNodeClick={(_, node) => {
            setSelectedGraphNodeId((current) => current === node.id ? null : node.id);
          }}
          onPaneClick={() => setSelectedGraphNodeId(null)}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
