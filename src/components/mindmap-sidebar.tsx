"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, Plus, RotateCcw, Trash2 } from "lucide-react";
import { shallow } from "zustand/shallow";

import { cn } from "@/lib/utils";
import useMindMapStore, { ROOT_NODE_ID } from "@/store/use-mindmap-store";

const selector = (state: ReturnType<typeof useMindMapStore.getState>) => ({
  nodes: state.nodes,
  selectedNodeId: state.selectedNodeId,
  addNode: state.addNode,
  updateNodeLabel: state.updateNodeLabel,
  removeNode: state.removeNode,
  reset: state.reset,
});

const MindMapSidebar = () => {
  const { nodes, selectedNodeId, addNode, updateNodeLabel, removeNode, reset } =
    useMindMapStore(selector, shallow);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const [labelDraft, setLabelDraft] = useState(selectedNode?.data.label ?? "");
  const [newNodeLabel, setNewNodeLabel] = useState("");

  useEffect(() => {
    setLabelDraft(selectedNode?.data.label ?? "");
  }, [selectedNode?.data.label]);

  const handleRename = useCallback(() => {
    if (!selectedNode) return;
    const trimmedLabel = labelDraft.trim();
    if (!trimmedLabel || trimmedLabel === selectedNode.data.label) return;
    updateNodeLabel(selectedNode.id, trimmedLabel);
  }, [labelDraft, selectedNode, updateNodeLabel]);

  const handleAddNode = useCallback(() => {
    const label = newNodeLabel.trim() || "新节点";
    addNode(label);
    setNewNodeLabel("");
  }, [addNode, newNodeLabel]);

  const handleRemove = useCallback(() => {
    if (!selectedNode || selectedNode.id === ROOT_NODE_ID) return;
    removeNode(selectedNode.id);
  }, [removeNode, selectedNode]);

  const disableRemove = !selectedNode || selectedNode.id === ROOT_NODE_ID;

  return (
    <aside className="flex h-full w-full max-w-sm flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-950/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-inner dark:bg-sky-900/50 dark:text-sky-200">
          <Brain className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            当前节点
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedNode?.data.label ?? "未选择"}
          </h2>
        </div>
      </header>

      <section className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          节点名称
        </label>
        <input
          value={labelDraft}
          onChange={(event) => setLabelDraft(event.target.value)}
          onBlur={handleRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleRename();
            }
          }}
          placeholder="输入节点名称"
          className="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          按 Enter 或离开输入框保存修改。
        </p>
      </section>

      <section className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          添加子节点
        </label>
        <div className="flex gap-3">
          <input
            value={newNodeLabel}
            onChange={(event) => setNewNodeLabel(event.target.value)}
            placeholder="新节点名称"
            className="flex-1 rounded-2xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60"
          />
          <button
            type="button"
            onClick={handleAddNode}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:bg-sky-600 dark:hover:bg-sky-500"
            )}
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>
      </section>

      <section className="mt-auto space-y-3">
        <button
          type="button"
          onClick={handleRemove}
          disabled={disableRemove}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2",
            disableRemove
              ? "cursor-not-allowed border-slate-200/80 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
              : "border-rose-300/70 bg-rose-100 text-rose-600 shadow-lg shadow-rose-500/10 hover:border-rose-500 hover:bg-rose-200/80 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          )}
        >
          <Trash2 className="h-4 w-4" />
          删除当前节点
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-lg shadow-slate-950/5 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          重置思维导图
        </button>
      </section>
    </aside>
  );
};

export default MindMapSidebar;
