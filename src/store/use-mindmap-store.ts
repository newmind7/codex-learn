"use client";

import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";

import type { MindMapNodeData } from "@/components/mindmap-node";

type MindMapNode = Node<MindMapNodeData>;
type MindMapEdge = Edge;

const rootId = "root";

export const ROOT_NODE_ID = rootId;

const initialNodes: MindMapNode[] = [
  {
    id: rootId,
    data: { label: "核心主题" },
    position: { x: 0, y: 0 },
    type: "mindmap",
  },
  {
    id: "idea-1",
    data: { label: "关键分支 1" },
    position: { x: -280, y: -140 },
    type: "mindmap",
  },
  {
    id: "idea-2",
    data: { label: "关键分支 2" },
    position: { x: 280, y: -140 },
    type: "mindmap",
  },
  {
    id: "idea-3",
    data: { label: "关键分支 3" },
    position: { x: 0, y: 200 },
    type: "mindmap",
  },
];

const initialEdges: MindMapEdge[] = [
  { id: "root-idea-1", source: rootId, target: "idea-1", type: "smoothstep", animated: true },
  { id: "root-idea-2", source: rootId, target: "idea-2", type: "smoothstep", animated: true },
  { id: "root-idea-3", source: rootId, target: "idea-3", type: "smoothstep", animated: true },
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const collectDescendants = (nodeId: string, edges: MindMapEdge[], acc = new Set<string>()): Set<string> => {
  edges
    .filter((edge) => edge.source === nodeId)
    .forEach((childEdge) => {
      acc.add(childEdge.target);
      collectDescendants(childEdge.target, edges, acc);
    });

  return acc;
};

type MindMapStore = {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId?: string;
  onNodesChange: (changes: NodeChange<MindMapNodeData>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (label: string, parentId?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNode: (nodeId?: string) => void;
  reset: () => void;
};

const useMindMapStore = create<MindMapStore>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: rootId,
  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),
  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge({ ...connection, animated: true, type: "smoothstep" }, state.edges),
    })),
  addNode: (label, parentId) =>
    set((state) => {
      const parent = state.nodes.find((node) => node.id === (parentId ?? state.selectedNodeId));
      const siblings = parent
        ? state.edges.filter((edge) => edge.source === parent.id).length
        : 0;

      const angle = siblings * (Math.PI / 3);
      const radius = parent ? 220 : 320;
      const position = parent
        ? {
            x: parent.position.x + Math.cos(angle) * radius,
            y: parent.position.y + Math.sin(angle) * radius,
          }
        : {
            x: siblings * 160,
            y: siblings * 80,
          };

      const newNode: MindMapNode = {
        id: createId(),
        data: { label },
        position,
        type: "mindmap",
      };

      const edges = parent
        ? [
            ...state.edges,
            {
              id: `${parent.id}-${newNode.id}`,
              source: parent.id,
              target: newNode.id,
              type: "smoothstep",
              animated: true,
            },
          ]
        : state.edges;

      return {
        nodes: [...state.nodes, newNode],
        edges,
        selectedNodeId: newNode.id,
      };
    }),
  updateNodeLabel: (nodeId, label) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      ),
    })),
  removeNode: (nodeId) =>
    set((state) => {
      const descendants = collectDescendants(nodeId, state.edges);
      const nodesToRemove = new Set([nodeId, ...descendants]);

      const nodes = state.nodes.filter((node) => !nodesToRemove.has(node.id));
      const edges = state.edges.filter(
        (edge) => !nodesToRemove.has(edge.source) && !nodesToRemove.has(edge.target)
      );

      const selectedNodeId = nodes.length ? nodes[0].id : undefined;

      return {
        nodes,
        edges,
        selectedNodeId,
      };
    }),
  setSelectedNode: (nodeId) =>
    set(() => ({
      selectedNodeId: nodeId,
    })),
  reset: () =>
    set(() => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: rootId,
    })),
}));

export default useMindMapStore;


