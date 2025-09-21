"use client";

import { useMemo } from "react";
import { CalendarPlus, Clock } from "lucide-react";

import useMindMapStore from "@/store/use-mindmap-store";

const selector = (state: ReturnType<typeof useMindMapStore.getState>) => ({
  timeline: state.timeline,
  activeDate: state.activeDate,
  setActiveDate: state.setActiveDate,
  addTimelineDate: state.addTimelineDate,
});

const MindMapTimeline = () => {
  const { timeline, activeDate, setActiveDate, addTimelineDate } = useMindMapStore(selector);

  const formattedTimeline = useMemo(
    () =>
      timeline.map((date) => ({
        label: date,
        value: date,
        isToday: date === new Date().toISOString().slice(0, 10),
      })),
    [timeline]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white/10 p-4 shadow-inner shadow-slate-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <Clock className="h-4 w-4" /> 时间轴
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {formattedTimeline.map(({ value, label, isToday }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveDate(value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
              value === activeDate
                ? "border-sky-500 bg-sky-500/20 text-sky-200 shadow-lg shadow-sky-500/20"
                : "border-slate-500/30 bg-slate-900/40 text-slate-300 hover:border-sky-400 hover:text-sky-200"
            }`}
          >
            <span>{label}</span>
            {isToday ? <span className="rounded-full bg-emerald-500/80 px-2 py-0.5 text-[11px] font-semibold uppercase text-white">Today</span> : null}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addTimelineDate()}
        className="inline-flex items-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-slate-950/20 transition hover:border-sky-400 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        <CalendarPlus className="h-4 w-4" />
        新增日期
      </button>
    </div>
  );
};

export default MindMapTimeline;


