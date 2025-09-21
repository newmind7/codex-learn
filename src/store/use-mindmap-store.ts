"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
} from "@xyflow/react";

import type { MindMapNodeData } from "@/components/mindmap-node";

export type MindMapNode = Node<MindMapNodeData>;
export type MindMapEdge = Edge;

export const ROOT_NODE_ID = "root";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const collectDescendants = (
  nodeId: string,
  edges: MindMapEdge[],
  acc = new Set<string>()
): Set<string> => {
  edges
    .filter((edge) => edge.source === nodeId)
    .forEach((childEdge) => {
      acc.add(childEdge.target);
      collectDescendants(childEdge.target, edges, acc);
    });

  return acc;
};

type MindMapBoard = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId?: string;
};

type MindMapStore = {
  boards: Record<string, MindMapBoard>;
  timeline: string[];
  activeDate: string;
  setActiveDate: (date: string) => void;
  addTimelineDate: (date?: string) => string;
  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (label: string, parentId?: string, position?: XYPosition) => void;
  addNodeAtPosition: (position: XYPosition) => void;
  addChildNode: (parentId: string, label?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeGroup: (nodeId: string, group: string) => void;
  toggleNodeCompleted: (nodeId: string, completed: boolean) => void;
  moveNodeToDate: (nodeId: string, date: string) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId?: string) => void;
  reset: () => void;
};

const todayString = new Date().toISOString().slice(0, 10);

const buildRootNode = (): MindMapNode => ({
  id: ROOT_NODE_ID,
  data: { label: "核心主题", completed: false, group: "" },
  position: { x: 0, y: 0 },
  type: "mindmap",
});

const buildSampleNodes = (): MindMapNode[] => [
  buildRootNode(),
  {
    id: "idea-1",
    data: { label: "关键分支 1", completed: false, group: "" },
    position: { x: -280, y: -140 },
    type: "mindmap",
  },
  {
    id: "idea-2",
    data: { label: "关键分支 2", completed: false, group: "" },
    position: { x: 280, y: -140 },
    type: "mindmap",
  },
  {
    id: "idea-3",
    data: { label: "关键分支 3", completed: false, group: "" },
    position: { x: 0, y: 200 },
    type: "mindmap",
  },
];

const buildSampleEdges = (): MindMapEdge[] => [
  { id: "root-idea-1", source: ROOT_NODE_ID, target: "idea-1", type: "smoothstep", animated: true },
  { id: "root-idea-2", source: ROOT_NODE_ID, target: "idea-2", type: "smoothstep", animated: true },
  { id: "root-idea-3", source: ROOT_NODE_ID, target: "idea-3", type: "smoothstep", animated: true },
];

const createBoard = (withSamples = false): MindMapBoard => ({
  nodes: (withSamples ? buildSampleNodes() : [buildRootNode()]).map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
    selected: node.id === ROOT_NODE_ID,
  })),
  edges: (withSamples ? buildSampleEdges() : []).map((edge) => ({ ...edge })),
  selectedNodeId: ROOT_NODE_ID,
});

const initialBoards: Record<string, MindMapBoard> = {
  [todayString]: createBoard(true),
};

const initialTimeline = [todayString];

const normalizeTimeline = (timeline: string[]): string[] =>
  Array.from(new Set(timeline)).sort();

const getNextDate = (dates: string[]): string => {
  if (!dates.length) {
    return todayString;
  }
  const latest = dates.slice().sort().at(-1)!;
  const next = new Date(latest);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
};

const ensureBoard = (boards: Record<string, MindMapBoard>, date: string, withSamples = false): MindMapBoard => {
  if (boards[date]) {
    return boards[date];
  }
  return createBoard(withSamples);
};

const useMindMapStore = create<MindMapStore>()(
  persist(
    (set, get) => ({
      boards: initialBoards,
      timeline: initialTimeline,
      activeDate: todayString,
      setActiveDate: (date) => {
        set((state) => {
          const existing = state.boards[date];
          const board = existing ? existing : createBoard();
          return {
            boards: {
              ...state.boards,
              [date]: board,
            },
            timeline: normalizeTimeline([...state.timeline, date]),
            activeDate: date,
          };
        });
      },
      addTimelineDate: (date) => {
        const state = get();
        const targetDate = date ?? getNextDate(state.timeline);
        if (!state.timeline.includes(targetDate)) {
          set((current) => ({
            boards: {
              ...current.boards,
              [targetDate]: createBoard(),
            },
            timeline: normalizeTimeline([...current.timeline, targetDate]),
          }));
        }
        set(() => ({ activeDate: targetDate }));
        return targetDate;
      },
      onNodesChange: (changes) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            nodes: applyNodeChanges(changes, board.nodes),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      onEdgesChange: (changes) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            edges: applyEdgeChanges(changes, board.edges),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      onConnect: (connection) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            edges: addEdge({ ...connection, animated: true, type: "smoothstep" }, board.edges),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      addNode: (label, parentId, position) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const parent = board.nodes.find((node) => node.id === (parentId ?? board.selectedNodeId));
          const siblings = parent
            ? board.edges.filter((edge) => edge.source === parent.id).length
            : 0;

          const angle = siblings * (Math.PI / 4);
          const radius = parent ? 220 : 320;
          const computedPosition = position
            ? position
            : parent
              ? {
                  x: parent.position.x + Math.cos(angle) * radius,
                  y: parent.position.y + Math.sin(angle) * radius,
                }
              : {
                  x: siblings * 160,
                  y: siblings * 120,
                };

          const baseNodes = board.nodes.map((node) => ({
            ...node,
            selected: false,
          }));

          const newNode: MindMapNode = {
            id: createId(),
            data: { label, completed: false, group: parent?.data.group ?? "" },
            position: computedPosition,
            type: "mindmap",
            selected: true,
          };

          const edges = parent
            ? [
                ...board.edges,
                {
                  id: `${parent.id}-${newNode.id}`,
                  source: parent.id,
                  target: newNode.id,
                  type: "smoothstep",
                  animated: true,
                },
              ]
            : [...board.edges];

          const updatedBoard: MindMapBoard = {
            ...board,
            nodes: [...baseNodes, newNode],
            edges,
            selectedNodeId: newNode.id,
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      addNodeAtPosition: (position) => {
        get().addNode("新节点", undefined, position);
      },
      addChildNode: (parentId, label = "子节点") => {
        get().addNode(label, parentId);
      },
      updateNodeLabel: (nodeId, label) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            nodes: board.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, label } }
                : node
            ),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      updateNodeGroup: (nodeId, group) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            nodes: board.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, group } }
                : node
            ),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      toggleNodeCompleted: (nodeId, completed) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          const updatedBoard: MindMapBoard = {
            ...board,
            nodes: board.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, completed } }
                : node
            ),
          };

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: updatedBoard,
            },
          };
        });
      },
      moveNodeToDate: (nodeId, date) => {
        set((state) => {
          if (date === state.activeDate || nodeId === ROOT_NODE_ID) {
            return {};
          }

          const sourceBoard = ensureBoard(state.boards, state.activeDate);
          const targetBoard = ensureBoard(state.boards, date);

          const descendants = collectDescendants(nodeId, sourceBoard.edges);
          const nodesToMove = new Set([nodeId, ...descendants]);

          const movedNodes = sourceBoard.nodes
            .filter((node) => nodesToMove.has(node.id))
            .map((node) => ({
              ...node,
              data: { ...node.data },
              position: { ...node.position },
              selected: false,
            }));

          if (!movedNodes.length) {
            return {};
          }

          const movedEdges = sourceBoard.edges
            .filter((edge) => nodesToMove.has(edge.source) && nodesToMove.has(edge.target))
            .map((edge) => ({ ...edge }));

          const subsetTargets = new Set(movedEdges.map((edge) => edge.target));
          const topLevelNodes = movedNodes.filter((node) => !subsetTargets.has(node.id));

          const reattachedEdges = topLevelNodes.map((node) => ({
            id: `${ROOT_NODE_ID}-${node.id}`,
            source: ROOT_NODE_ID,
            target: node.id,
            type: "smoothstep",
            animated: true,
          }));

          const sourceNodes = sourceBoard.nodes.filter((node) => !nodesToMove.has(node.id));
          const sourceEdges = sourceBoard.edges.filter(
            (edge) => !nodesToMove.has(edge.source) && !nodesToMove.has(edge.target)
          );

          const sourceSelectedNodeId = sourceNodes[0]?.id ?? ROOT_NODE_ID;
          const normalizedSourceNodes = sourceNodes.map((node) => ({
            ...node,
            selected: node.id === sourceSelectedNodeId,
          }));

          const targetHasSelection = Boolean(targetBoard.selectedNodeId);
          const targetSelectedNodeId = targetBoard.selectedNodeId ?? movedNodes[0]?.id;
          const normalizedTargetNodes = targetBoard.nodes.map((node) => ({
            ...node,
            selected: node.id === targetSelectedNodeId,
          }));

          const normalizedMovedNodes = movedNodes.map((node) => ({
            ...node,
            selected: !targetHasSelection && node.id === targetSelectedNodeId,
          }));

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: {
                ...sourceBoard,
                nodes: normalizedSourceNodes,
                edges: sourceEdges,
                selectedNodeId: sourceSelectedNodeId,
              },
              [date]: {
                ...targetBoard,
                nodes: [...normalizedTargetNodes, ...normalizedMovedNodes],
                edges: [...targetBoard.edges, ...movedEdges, ...reattachedEdges],
                selectedNodeId: targetSelectedNodeId,
              },
            },
            timeline: normalizeTimeline([...state.timeline, date]),
          };
        });
      },
      removeNode: (nodeId) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          if (nodeId === ROOT_NODE_ID) {
            return {};
          }

          const descendants = collectDescendants(nodeId, board.edges);
          const nodesToRemove = new Set([nodeId, ...descendants]);

          const nodes = board.nodes.filter((node) => !nodesToRemove.has(node.id));
          const edges = board.edges.filter(
            (edge) => !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target)
          );

          const nextSelectedId = nodes[0]?.id ?? ROOT_NODE_ID;
          const normalizedNodes = nodes.map((node) => ({
            ...node,
            selected: node.id === nextSelectedId,
          }));

          return {
            boards: {
              ...state.boards,
              [state.activeDate]: {
                ...board,
                nodes: normalizedNodes,
                edges,
                selectedNodeId: nextSelectedId,
              },
            },
          };
        });
      },
      setSelectedNode: (nodeId) => {
        set((state) => {
          const board = ensureBoard(state.boards, state.activeDate);
          return {
            boards: {
              ...state.boards,
              [state.activeDate]: {
                ...board,
                selectedNodeId: nodeId,
              },
            },
          };
        });
      },
      reset: () => {
        set((state) => ({
          boards: {
            ...state.boards,
            [state.activeDate]: createBoard(),
          },
        }));
      },
    }),
    {
      name: "mindmap-timeline-store",
      partialize: (state) => ({
        boards: state.boards,
        timeline: state.timeline,
        activeDate: state.activeDate,
      }),
    }
  )
);

export default useMindMapStore;







