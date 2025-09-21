"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
  type OnSelectionChangeFunc,
} from "@xyflow/react";

import MindMapNode, { type MindMapNodeData } from "@/components/mindmap-node";
import useMindMapStore from "@/store/use-mindmap-store";

type MindMapFlowNode = Node<MindMapNodeData>;
type MindMapFlowEdge = Edge;

const selector = (state: ReturnType<typeof useMindMapStore.getState>) => {
  const board = state.boards[state.activeDate];
  return {
    nodes: (board?.nodes ?? []) as MindMapFlowNode[],
    edges: (board?.edges ?? []) as MindMapFlowEdge[],
    selectedNodeId: board?.selectedNodeId,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setSelectedNode: state.setSelectedNode,
    addNodeAtPosition: state.addNodeAtPosition,
    addChildNode: state.addChildNode,
  };
};

const MindMapCanvasInner = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    addNodeAtPosition,
    addChildNode,
  } = useMindMapStore(selector);

  const nodeTypes = useMemo(() => ({ mindmap: MindMapNode }), []) as NodeTypes;
  const { screenToFlowPosition } = useReactFlow();

  const handleSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: selectedNodes }) => {
      setSelectedNode(selectedNodes[0]?.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(
    (event: ReactMouseEvent) => {
      if (event.detail < 2) {
        return;
      }
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNodeAtPosition(position);
    },
    [addNodeAtPosition, screenToFlowPosition]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const target = event.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const interactiveTags = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"]; // skip form controls
          if (interactiveTags.includes(tagName) || target.isContentEditable) {
            return;
          }
        }
        if (!selectedNodeId) return;
        event.preventDefault();
        addChildNode(selectedNodeId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addChildNode, selectedNodeId]);

  return (
    <div className="h-full w-full rounded-3xl border border-slate-200 bg-slate-50/80 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
      <ReactFlow<MindMapFlowNode, MindMapFlowEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={25} size={2} className="stroke-slate-300/80 dark:stroke-slate-700/80" />
        <MiniMap
          className="!bg-white/80 dark:!bg-slate-900/80"
          maskColor="rgba(15, 23, 42, 0.2)"
          nodeColor={(node) => (node.selected ? "#0ea5e9" : node.data.completed ? "#22c55e" : "#64748b")}
        />
        <Controls showInteractive={false} />
        <Panel position="top-left" className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow dark:bg-slate-800/80 dark:text-slate-200">
          拖拽节点并用连线构建你的思维导图（双击空白区域添加节点 / Tab 键快速创建子节点）
        </Panel>
      </ReactFlow>
    </div>
  );
};

const MindMapCanvas = () => (
  <ReactFlowProvider>
    <MindMapCanvasInner />
  </ReactFlowProvider>
);

export default MindMapCanvas;
