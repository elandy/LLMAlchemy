import type {Element} from "./types.ts";
import { Position, type Edge, type Node } from "reactflow";
import { getReadableTextColor } from "./utils.tsx";

const GRAPH_COLUMN_GAP = 220;
const GRAPH_ROW_GAP = 130;
const GRAPH_MIN_NODE_GAP = 180;

function getElementDepth(
  element: Element,
  elementsByName: Map<string, Element>,
  cache: Map<string, number>,
  visiting: Set<string>,
): number {
  if (cache.has(element.element)) {
    return cache.get(element.element)!;
  }

  if (visiting.has(element.element)) {
    return 0;
  }

  visiting.add(element.element);

  const depth = !element.parents?.length
    ? 0
    : Math.max(
      ...element.parents.map((parentName) => {
        const parent = elementsByName.get(parentName);
        return parent ? getElementDepth(parent, elementsByName, cache, visiting) + 1 : 0;
      }),
    );

  visiting.delete(element.element);
  cache.set(element.element, depth);

  return depth;
}

function placeLevel(desiredPositions: number[]) {
  if (!desiredPositions.length) {
    return [];
  }

  const placed = [...desiredPositions];

  for (let index = 1; index < placed.length; index += 1) {
    placed[index] = Math.max(placed[index], placed[index - 1] + GRAPH_MIN_NODE_GAP);
  }

  for (let index = placed.length - 2; index >= 0; index -= 1) {
    placed[index] = Math.min(placed[index], placed[index + 1] - GRAPH_MIN_NODE_GAP);
  }

  const desiredCenter =
    desiredPositions.reduce((sum, value) => sum + value, 0) / desiredPositions.length;
  const actualCenter =
    placed.reduce((sum, value) => sum + value, 0) / placed.length;
  const shift = desiredCenter - actualCenter;

  return placed.map((value) => value + shift);
}

export function layoutGraph(elements: Element[]) {
  const elementsByName = new Map(elements.map((element) => [element.element, element]));
  const idsByName = new Map(elements.map((element) => [element.element, element.id]));
  const depthCache = new Map<string, number>();
  const levels = new Map<number, Element[]>();
  const positionsByName = new Map<string, { x: number; y: number }>();
  const nodes: Node[] = [];

  elements.forEach((element) => {
    const depth = getElementDepth(element, elementsByName, depthCache, new Set<string>());
    const level = levels.get(depth);

    if (level) {
      level.push(element);
      return;
    }

    levels.set(depth, [element]);
  });

  [...levels.entries()]
    .sort(([leftDepth], [rightDepth]) => leftDepth - rightDepth)
    .forEach(([depth, levelElements]) => {
      const sortedLevel = [...levelElements].sort((left, right) => {
        const leftParents = (left.parents ?? [])
          .map((parentName) => positionsByName.get(parentName)?.x)
          .filter((value): value is number => value !== undefined);
        const rightParents = (right.parents ?? [])
          .map((parentName) => positionsByName.get(parentName)?.x)
          .filter((value): value is number => value !== undefined);
        const leftCenter = leftParents.length
          ? leftParents.reduce((sum, value) => sum + value, 0) / leftParents.length
          : 0;
        const rightCenter = rightParents.length
          ? rightParents.reduce((sum, value) => sum + value, 0) / rightParents.length
          : 0;

        if (leftCenter !== rightCenter) {
          return leftCenter - rightCenter;
        }

        return left.element.localeCompare(right.element);
      });

      const desiredPositions = sortedLevel.map((element, index) => {
        const parentXs = (element.parents ?? [])
          .map((parentName) => positionsByName.get(parentName)?.x)
          .filter((value): value is number => value !== undefined);

        if (parentXs.length) {
          return parentXs.reduce((sum, value) => sum + value, 0) / parentXs.length;
        }

        return (index - (sortedLevel.length - 1) / 2) * GRAPH_COLUMN_GAP;
      });

      const placedPositions = placeLevel(desiredPositions);

      sortedLevel.forEach((element, index) => {
        const position = {
          x: placedPositions[index],
          y: depth * GRAPH_ROW_GAP,
        };

        positionsByName.set(element.element, position);
        nodes.push({
          id: element.id,
          data: { label: element.element },
          position,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: {
            background: element.color,
            color: getReadableTextColor(element.color),
            borderRadius: 8,
            padding: 6,
            border: "1px solid rgba(0, 0, 0, 0.2)",
            width: 120,
            textAlign: "center",
            fontWeight: 600,
          },
        });
      });
    });

  const edges: Edge[] = elements.flatMap((element) =>
    (element.parents ?? []).flatMap((parentName, index) => {
      const sourceId = idsByName.get(parentName);

      if (!sourceId) {
        return [];
      }

      return [{
        id: `${sourceId}-${element.id}-${index}`,
        source: sourceId,
        target: element.id,
        type: "straight",
      }];
    }),
  );

  return { nodes, edges };
}
