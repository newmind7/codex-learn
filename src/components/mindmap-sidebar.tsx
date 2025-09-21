"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Brain, CalendarRange, Check, Plus, RotateCcw, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import useMindMapStore, { ROOT_NODE_ID } from "@/store/use-mindmap-store";

const selector = (state: ReturnType<typeof useMindMapStore.getState>) => {
  const board = state.boards[state.activeDate] ?? { nodes: [], edges: [], selectedNodeId: undefined };
  const selectedNode = board.nodes.find((node) => node.id === board.selectedNodeId);
  return {
    nodes: board.nodes,
    selectedNode,
    timeline: state.timeline,
    activeDate: state.activeDate,
    addNode: state.addNode,
    updateNodeLabel: state.updateNodeLabel,
    updateNodeGroup: state.updateNodeGroup,
    toggleNodeCompleted: state.toggleNodeCompleted,
    removeNode: state.removeNode,
    reset: state.reset,
    moveNodeToDate: state.moveNodeToDate,
    setActiveDate: state.setActiveDate,
    addTimelineDate: state.addTimelineDate,
  };
};

const MindMapSidebar = () => {
  const {
    nodes,
    selectedNode,
    timeline,
    activeDate,
    addNode,
    updateNodeLabel,
    updateNodeGroup,
    toggleNodeCompleted,
    removeNode,
    reset,
    moveNodeToDate,
    setActiveDate,
    addTimelineDate,
  } = useMindMapStore(selector);

  const [labelDraft, setLabelDraft] = useState(selectedNode?.data.label ?? "");
  const [groupDraft, setGroupDraft] = useState(selectedNode?.data.group ?? "");
  const [newNodeLabel, setNewNodeLabel] = useState("");

  useEffect(() => {
    setLabelDraft(selectedNode?.data.label ?? "");
    setGroupDraft(selectedNode?.data.group ?? "");
  }, [selectedNode?.data.group, selectedNode?.data.label]);

  const handleRename = useCallback(() => {
    if (!selectedNode) return;
    const trimmedLabel = labelDraft.trim();
    if (!trimmedLabel || trimmedLabel === selectedNode.data.label) return;
    updateNodeLabel(selectedNode.id, trimmedLabel);
  }, [labelDraft, selectedNode, updateNodeLabel]);

  const handleGroupSave = useCallback(() => {
    if (!selectedNode) return;
    const trimmedGroup = groupDraft.trim();
    if (trimmedGroup === (selectedNode.data.group ?? "")) return;
    updateNodeGroup(selectedNode.id, trimmedGroup);
  }, [groupDraft, selectedNode, updateNodeGroup]);

  const handleAddNode = useCallback(() => {
    const label = newNodeLabel.trim() || "新节点";
    addNode(label);
    setNewNodeLabel("");
  }, [addNode, newNodeLabel]);

  const handleRemove = useCallback(() => {
    if (!selectedNode) return;
    removeNode(selectedNode.id);
  }, [removeNode, selectedNode]);

  const handleToggleCompleted = useCallback(() => {
    if (!selectedNode) return;
    toggleNodeCompleted(selectedNode.id, !selectedNode.data.completed);
  }, [selectedNode, toggleNodeCompleted]);

  const handleActiveTimelineChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setActiveDate(event.target.value);
    },
    [setActiveDate]
  );

  const handleTimelineChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (!selectedNode) return;
      const nextDate = event.target.value;
      if (nextDate === activeDate) return;
      moveNodeToDate(selectedNode.id, nextDate);
      setActiveDate(nextDate);
    },
    [activeDate, moveNodeToDate, selectedNode, setActiveDate]
  );

  const availableTimeline = useMemo(() => timeline, [timeline]);

  const disableRemove = !selectedNode || selectedNode.id === ROOT_NODE_ID;
  const disableToggle = !selectedNode || selectedNode.id === ROOT_NODE_ID;

  const completedCount = useMemo(
    () => nodes.filter((node) => node.data.completed).length,
    [nodes]
  );

  return (
    <aside className="flex h-full w-full max-w-sm flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-950/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
      <header className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-inner dark:bg-sky-900/50 dark:text-sky-200">
          <Brain className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">当前节点</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedNode?.data.label ?? "未选择"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            已完成 {completedCount} / {nodes.length}
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <label className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          时间轴
          <button
            type="button"
            onClick={() => addTimelineDate()}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-sky-400 hover:text-sky-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
          >
            <CalendarRange className="h-3 w-3" />
            新增日期
          </button>
        </label>
        <select
          value={activeDate}
          onChange={handleActiveTimelineChange}
          className="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60"
        >
          {availableTimeline.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
        {selectedNode ? (
          <select
            value={activeDate}
            onChange={handleTimelineChange}
            className="w-full rounded-2xl border border-slate-200/70 bg-slate-100 px-4 py-2 text-xs text-slate-600 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {availableTimeline.map((date) => (
              <option key={date} value={date}>
                {date === activeDate ? `当前：${date}` : `移动到 ${date}`}
              </option>
            ))}
          </select>
        ) : null}
      </section>

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
        <p className="text-xs text-slate-500 dark:text-slate-400">按 Enter 或离开输入框保存修改。</p>
      </section>

      <section className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          分组标签
        </label>
        <input
          value={groupDraft}
          onChange={(event) => setGroupDraft(event.target.value)}
          onBlur={handleGroupSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleGroupSave();
            }
          }}
          placeholder="输入分组名称"
          className="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60"
        />
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
        <p className="text-xs text-slate-500 dark:text-slate-400">选择节点后按 Tab 也可以快速创建子节点。</p>
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={handleToggleCompleted}
          disabled={disableToggle}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2",
            disableToggle
              ? "cursor-not-allowed border-slate-200/80 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
              : selectedNode?.data.completed
                ? "border-emerald-300 bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10 hover:border-emerald-400 hover:bg-emerald-200/80 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : "border-slate-200/80 bg-white text-slate-600 shadow-lg shadow-slate-950/5 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          )}
        >
          <Check className="h-4 w-4" />
          {selectedNode?.data.completed ? "标记为未完成" : "标记为已完成"}
        </button>
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
          重置当前白板
        </button>
      </section>
    </aside>
  );
};

export default MindMapSidebar;


