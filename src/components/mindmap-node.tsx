"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";
import type { MindMapNode as MindMapGraphNode } from "@/store/use-mindmap-store";

export type MindMapNodeData = {
  label: string;
  group?: string;
  completed?: boolean;
};

function MindMapNodeComponent({ data, selected }: NodeProps<MindMapGraphNode>) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex h-36 w-36 flex-col items-center justify-center rounded-full border transition",
        data.completed
          ? "border-emerald-400 bg-emerald-500/85 text-white shadow-lg shadow-emerald-500/30 dark:border-emerald-400/80 dark:bg-emerald-500/70"
          : "border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-slate-950/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
        selected && "ring-4 ring-sky-300"
      )}
    >
      {data.group ? (
        <span className="absolute top-3 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200">
          {data.group}
        </span>
      ) : null}
      <p className="px-6 text-center text-sm font-semibold leading-snug">{data.label}</p>
      {data.completed ? (
        <span className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-100/90">已完成</span>
      ) : null}
    </div>
  );
}

export default memo(MindMapNodeComponent);
