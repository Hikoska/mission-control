import { useAppStore } from "../../stores/appStore";
import { clsx } from "clsx";
export function TopBar() {
  const { viewMode, setViewMode, agentPanelVisible, toggleAgentPanel, isConnected } = useAppStore();
  return (
    <div className="h-11 bg-mc-surface border-b border-mc-border flex items-center justify-between px-4 no-select">
      <div className="flex items-center gap-1">
        {(["chat","split","agent"] as const).map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={clsx("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
              viewMode===mode ? "bg-mc-accent/15 text-mc-accent" : "text-mc-text-muted hover:text-mc-text hover:bg-mc-surface-2")}>
            {mode==="chat"?"\ud83d\udcac Chat":mode==="split"?"\ud83d\udccb Split":"\ud83e\udd16 Agent"}
          </button>))}
      </div>
      <div className="flex items-center gap-2 text-xs text-mc-text-muted">
        <div className={clsx("w-1.5 h-1.5 rounded-full", isConnected ? "bg-mc-success animate-pulse-dot" : "bg-mc-warning")}/>
        <span>{isConnected ? "Live \u2014 SureThing Agent" : "Demo Mode \u2014 Click Connect"}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={toggleAgentPanel} className={clsx("px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
          agentPanelVisible ? "bg-mc-surface-3 text-mc-text" : "text-mc-text-muted hover:text-mc-text hover:bg-mc-surface-2")} title="Toggle agent panel">
          \ud83e\udd16 Agent Panel
        </button>
      </div>
    </div>);
}
