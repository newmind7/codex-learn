"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type MindMapNodeData = {
  label: string;
};

function MindMapNode({ data, selected }: NodeProps<MindMapNodeData>) {
  return (
    <div
      className={cn(
        "pointer-events-auto min-w-44 max-w-72 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-900 shadow-lg shadow-slate-950/5 backdrop-blur transition",
        "dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100",
        selected && "border-sky-500 ring-2 ring-sky-400"
      )}
    >
      <p className="text-sm font-medium leading-snug">{data.label}</p>
    </div>
  );
}

export default memo(MindMapNode);
