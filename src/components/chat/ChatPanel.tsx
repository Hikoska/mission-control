import { useEffect, useRef } from "react";
import { useAppStore } from "../../stores/appStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
export function ChatPanel() {
  const { activeThreadId, messages, threads } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [threadMessages.length]);
  if (!activeThread) return (
    <div className="flex-1 flex items-center justify-center text-mc-text-muted">
      <div className="text-center"><div className="text-4xl mb-3">\ud83d\ude80</div><p className="text-lg font-medium">Mission Control</p><p className="text-sm mt-1">Select a thread to get started</p></div>
    </div>);
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-mc-border bg-mc-surface no-select">
        <div className="flex items-center gap-3">
          <span className="text-lg">{activeThread.icon}</span>
          <div><h2 className="text-sm font-semibold">{activeThread.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeThread.status==="active"?"bg-mc-success":activeThread.status==="waiting"?"bg-mc-warning":"bg-mc-text-muted"}`}/>
              <span className="text-[11px] text-mc-text-muted capitalize">{activeThread.status}</span>
            </div>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">{threadMessages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}</div>
      <MessageInput />
    </div>);
}
