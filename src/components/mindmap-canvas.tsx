"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";

import MindMapNode from "@/components/mindmap-node";
import useMindMapStore from "@/store/use-mindmap-store";

const selector = (state: ReturnType<typeof useMindMapStore.getState>) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setSelectedNode: state.setSelectedNode,
});

const MindMapCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode } =
    useMindMapStore(selector, shallow);

  const nodeTypes = useMemo(() => ({ mindmap: MindMapNode }), []);

  const handleSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: selectedNodes }) => {
      setSelectedNode(selectedNodes[0]?.id);
    },
    [setSelectedNode]
  );

  return (
    <div className="h-full w-full rounded-3xl border border-slate-200 bg-slate-50/80 shadow-inner dark:border-slate-800 dark:bg-slate-900/60">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={25} size={2} className="stroke-slate-300/80 dark:stroke-slate-700/80" />
        <MiniMap
          className="!bg-white/80 dark:!bg-slate-900/80"
          maskColor="rgba(15, 23, 42, 0.2)"
          nodeColor={(node) => (node.selected ? "#0ea5e9" : "#64748b")}
        />
        <Controls showInteractive={false} />
        <Panel position="top-left" className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow dark:bg-slate-800/80 dark:text-slate-200">
          拖拽节点并用连线构建你的思维导图
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindMapCanvas;
