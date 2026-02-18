import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../../stores/appStore";
const commands = [
  { id:"new-thread", label:"New Thread", icon:"\u2795", category:"Threads" },
  { id:"search-all", label:"Search All Messages", icon:"\ud83d\udd0d", category:"Search" },
  { id:"check-email", label:"Check Email", icon:"\ud83d\udce7", category:"Actions" },
  { id:"check-calendar", label:"Check Calendar", icon:"\ud83d\udcc5", category:"Actions" },
  { id:"run-report", label:"Generate Report", icon:"\ud83d\udcca", category:"Actions" },
  { id:"web-search", label:"Web Search", icon:"\ud83c\udf10", category:"Actions" },
  { id:"toggle-agent", label:"Toggle Agent Panel", icon:"\ud83e\udd16", category:"View" },
  { id:"toggle-sidebar", label:"Toggle Sidebar", icon:"\ud83d\udccb", category:"View" },
];
export function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, toggleAgentPanel, toggleSidebar } = useAppStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==="k") { e.preventDefault(); toggleCommandPalette(); }
      if (e.key==="Escape" && commandPaletteOpen) toggleCommandPalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, toggleCommandPalette]);
  useEffect(() => { if (commandPaletteOpen) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }}, [commandPaletteOpen]);
  if (!commandPaletteOpen) return null;
  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  const handleSelect = (id: string) => {
    if (id==="toggle-agent") toggleAgentPanel();
    if (id==="toggle-sidebar") toggleSidebar();
    toggleCommandPalette();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCommandPalette}/>
      <div className="relative w-full max-w-lg bg-mc-surface border border-mc-border rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-mc-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mc-text-muted shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-mc-text placeholder:text-mc-text-muted focus:outline-none"/>
          <kbd className="text-[10px] text-mc-text-muted bg-mc-bg px-1.5 py-0.5 rounded border border-mc-border">ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto py-2">
          {filtered.map((cmd) => <button key={cmd.id} onClick={() => handleSelect(cmd.id)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-mc-text hover:bg-mc-surface-2 transition-colors">
            <span>{cmd.icon}</span><span>{cmd.label}</span><span className="ml-auto text-[10px] text-mc-text-muted">{cmd.category}</span>
          </button>)}
          {filtered.length===0 && <div className="px-4 py-6 text-center text-sm text-mc-text-muted">No commands found</div>}
        </div>
      </div>
    </div>);
}
