import { useAppStore } from "../../stores/appStore";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
const statusColors = { active:"bg-mc-success", idle:"bg-mc-text-muted", waiting:"bg-mc-warning" };
export function ThreadList() {
  const { threads, activeThreadId, setActiveThread, sidebarCollapsed } = useAppStore();
  if (sidebarCollapsed) {
    return (<div className="flex flex-col items-center gap-2 py-3">
      {threads.map((t) => (
        <button key={t.id} onClick={() => setActiveThread(t.id)}
          className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-mc-surface-3",
            activeThreadId===t.id ? "bg-mc-surface-3 ring-1 ring-mc-accent" : "bg-mc-surface-2")}
          title={t.name}>{t.icon||t.name[0]}</button>
      ))}
    </div>);
  }
  return (<div className="flex flex-col gap-1 p-2">
    <div className="px-3 py-2 text-xs font-semibold text-mc-text-muted uppercase tracking-wider">Threads</div>
    {threads.map((t) => (
      <button key={t.id} onClick={() => setActiveThread(t.id)}
        className={clsx("w-full text-left px-3 py-2.5 rounded-lg transition-all hover:bg-mc-surface-2",
          activeThreadId===t.id ? "bg-mc-surface-2 border-l-2 border-mc-accent" : "border-l-2 border-transparent")}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{t.icon||"\ud83d\udcac"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{t.name}</span>
              <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", statusColors[t.status])} />
            </div>
            {t.lastMessage && <p className="text-xs text-mc-text-muted truncate mt-0.5">{t.lastMessage}</p>}
          </div>
          {t.unreadCount > 0 && <span className="bg-mc-accent text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">{t.unreadCount}</span>}
        </div>
        {t.lastMessageAt && <div className="text-[10px] text-mc-text-muted mt-1 pl-7">{formatDistanceToNow(new Date(t.lastMessageAt), { addSuffix: true })}</div>}
      </button>
    ))}
  </div>);
}
