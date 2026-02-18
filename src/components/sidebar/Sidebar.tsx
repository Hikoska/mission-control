import { useAppStore } from "../../stores/appStore";
import { ThreadList } from "./ThreadList";
import { clsx } from "clsx";
export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, toggleCommandPalette } = useAppStore();
  return (
    <div className={clsx("h-full bg-mc-surface border-r border-mc-border flex flex-col transition-all duration-200", sidebarCollapsed ? "w-14" : "w-72")}>
      <div className="flex items-center justify-between p-3 border-b border-mc-border no-select">
        {!sidebarCollapsed && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-mc-success animate-pulse-dot" /><span className="text-sm font-bold tracking-wide text-mc-text">MISSION CONTROL</span></div>}
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-mc-surface-2 text-mc-text-dim transition-colors" title={sidebarCollapsed?"Expand":"Collapse"}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d={sidebarCollapsed?"M6 3l5 5-5 5V3z":"M10 3L5 8l5 5V3z"}/></svg>
        </button>
      </div>
      {!sidebarCollapsed && <div className="px-3 pt-3"><button onClick={toggleCommandPalette} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-mc-surface-2 border border-mc-border text-mc-text-muted text-sm hover:border-mc-border-active transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search...</span><kbd className="ml-auto text-[10px] bg-mc-bg px-1.5 py-0.5 rounded border border-mc-border">Ctrl+K</kbd>
      </button></div>}
      <div className="flex-1 overflow-y-auto"><ThreadList /></div>
      <div className={clsx("border-t border-mc-border p-3", sidebarCollapsed?"flex justify-center":"")}>
        {sidebarCollapsed ? <div className="w-2 h-2 rounded-full bg-mc-success animate-pulse-dot" title="Agent online" />
          : <div className="flex items-center gap-2 text-xs text-mc-text-muted"><div className="w-2 h-2 rounded-full bg-mc-success animate-pulse-dot" /><span>SureThing Agent — Online</span></div>}
      </div>
    </div>
  );
}
