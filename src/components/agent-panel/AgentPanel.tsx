import { useAppStore } from "../../stores/appStore";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
const statusIcons = { running:"\u26a1", completed:"\u2705", failed:"\u274c", pending:"\u23f3" };
const statusColors = { running:"text-mc-accent", completed:"text-mc-success", failed:"text-mc-danger", pending:"text-mc-warning" };
const priorityColors = { high:"border-l-mc-danger", normal:"border-l-mc-accent", low:"border-l-mc-text-muted" };
export function AgentPanel() {
  const { activities, pendingActions, agentPanelVisible, toggleAgentPanel } = useAppStore();
  if (!agentPanelVisible) return null;
  return (
    <div className="w-72 h-full bg-mc-surface border-l border-mc-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-mc-border no-select">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-mc-success animate-pulse-dot"/><span className="text-sm font-semibold">Agent Status</span></div>
        <button onClick={toggleAgentPanel} className="p-1 rounded hover:bg-mc-surface-2 text-mc-text-dim transition-colors" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {pendingActions.length > 0 && <div className="p-3 border-b border-mc-border">
        <div className="text-xs font-semibold text-mc-text-muted uppercase tracking-wider mb-2">Awaiting Your Action ({pendingActions.length})</div>
        {pendingActions.map((a) => <div key={a.id} className={clsx("border-l-2 rounded-r-lg bg-mc-surface-2 px-3 py-2 mb-2 last:mb-0", priorityColors[a.priority])}>
          <div className="text-xs font-medium">{a.title}</div>
          <div className="text-[11px] text-mc-text-muted mt-0.5">{a.description}</div>
          <div className="flex gap-2 mt-2">
            <button className="text-[10px] px-2 py-1 rounded bg-mc-accent/20 text-mc-accent hover:bg-mc-accent/30 transition-colors">Review</button>
            <button className="text-[10px] px-2 py-1 rounded bg-mc-surface-3 text-mc-text-dim hover:text-mc-text transition-colors">Dismiss</button>
          </div>
        </div>)}
      </div>}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-xs font-semibold text-mc-text-muted uppercase tracking-wider mb-2">Activity Feed</div>
        {activities.map((a) => <div key={a.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-mc-surface-2 transition-colors animate-fade-in">
          <span className="text-sm mt-0.5">{statusIcons[a.status]}</span>
          <div className="flex-1 min-w-0">
            <p className={clsx("text-xs font-medium", statusColors[a.status])}>{a.action.replace(/_/g," ")}</p>
            <p className="text-[11px] text-mc-text-dim mt-0.5 leading-snug">{a.description}</p>
            <p className="text-[10px] text-mc-text-muted mt-1">{formatDistanceToNow(new Date(a.timestamp), { addSuffix:true })}</p>
          </div>
        </div>)}
      </div>
      <div className="border-t border-mc-border p-3">
        <div className="text-xs font-semibold text-mc-text-muted uppercase tracking-wider mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[{l:"Check Email",i:"\ud83d\udce7"},{l:"Check Calendar",i:"\ud83d\udcc5"},{l:"Run Report",i:"\ud83d\udcca"},{l:"Web Search",i:"\ud83d\udd0d"}].map((a) =>
            <button key={a.l} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-mc-surface-2 border border-mc-border text-[11px] text-mc-text-dim hover:text-mc-text hover:border-mc-border-active transition-colors">
              <span>{a.i}</span><span>{a.l}</span>
            </button>)}
        </div>
      </div>
    </div>);
}
