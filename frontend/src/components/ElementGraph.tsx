import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";

import { initialElements } from "../constants";
import { layoutGraph } from "../graph";
import type { Element } from "../types";

type ElementGraphProps = {
  elements: Element[];
  onClose: () => void;
};

export function ElementGraph({ elements , onClose }: ElementGraphProps) {
  const [graphNodes, setGraphNodes] = useState<Node[]>(
    () => layoutGraph(initialElements).nodes,
  );
  const [graphEdges, setGraphEdges] = useState<Edge[]>(
    () => layoutGraph(initialElements).edges,
  );
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(
    null,
  );
  const graphElementIdsRef = useRef(
    new Set(initialElements.map((element) => element.id)),
  );

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
  }, [graphEdges, graphNodes, reactFlowInstance]);

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

    const idsByName = new Map(
      elements.map((element) => [element.element, element.id]),
    );

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

  return (
    <div className="reactflow-wrapper">
      <button className="graph-close" onClick={onClose}>
        ✕
      </button>
      <ReactFlow
        nodes={displayGraphNodes}
        edges={displayGraphEdges}
        fitView
        onInit={setReactFlowInstance}
        onNodeClick={(_, node) => {
          setSelectedGraphNodeId((current) =>
            current === node.id ? null : node.id,
          );
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
  );
}
