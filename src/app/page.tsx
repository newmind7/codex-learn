"use client";

import Link from "next/link";
import "@xyflow/react/dist/style.css";
import { ArrowUpRight } from "lucide-react";

import MindMapCanvas from "@/components/mindmap-canvas";
import MindMapSidebar from "@/components/mindmap-sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-300 shadow-lg shadow-sky-500/20">
              Web · Next.js 15 · React Flow
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              构建你的下一张思维导图
            </h1>
            <p className="text-base leading-7 text-slate-300">
              通过拖拽节点、快速添加子项和即时视觉反馈，MindWave 让创意组织变得生动高效。你可以从核心主题出发，自由拓展想法网络。
            </p>
          </div>
          <Link
            href="https://nextjs.org/docs"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-sky-500 hover:bg-sky-500/10"
          >
            查看技术文档
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
          <MindMapSidebar />
          <div className="relative min-h-[560px] overflow-hidden rounded-3xl bg-slate-950/50 p-1 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-700/70">
            <MindMapCanvas />
          </div>
        </main>

        <footer className="flex flex-col items-start gap-3 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>基于 Next.js 15、React 19、Tailwind CSS 4 与 React Flow 构建。</p>
          <p>准备就绪后运行 `npm run dev` 开始调试。</p>
        </footer>
      </div>
    </div>
  );
}
