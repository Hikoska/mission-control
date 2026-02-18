import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../stores/appStore";
export function MessageInput() {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { activeThreadId, addMessage, updateThread } = useAppStore();
  useEffect(() => { if (ref.current) { ref.current.style.height="auto"; ref.current.style.height=Math.min(ref.current.scrollHeight,160)+"px"; }}, [text]);
  const handleSend = () => {
    if (!text.trim() || !activeThreadId) return;
    addMessage(activeThreadId, { id:`msg-${Date.now()}`, threadId:activeThreadId, role:"user", content:text.trim(), timestamp:new Date().toISOString(), status:"sent" });
    updateThread(activeThreadId, { lastMessage:text.trim(), lastMessageAt:new Date().toISOString() });
    setText("");
    setTimeout(() => { addMessage(activeThreadId, { id:`msg-${Date.now()}-ai`, threadId:activeThreadId, role:"assistant", content:"This is a demo response. Live SureThing API bridge coming in v0.2.", timestamp:new Date().toISOString() }); }, 1500);
  };
  return (
    <div className="border-t border-mc-border bg-mc-surface p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          placeholder="Message SureThing... (Enter to send, Shift+Enter for new line)" rows={1}
          className="flex-1 resize-none rounded-xl bg-mc-surface-2 border border-mc-border px-4 py-3 text-sm text-mc-text placeholder:text-mc-text-muted focus:outline-none focus:border-mc-accent focus:ring-1 focus:ring-mc-accent/30 transition-colors" />
        <button onClick={handleSend} disabled={!text.trim()}
          className="p-2 rounded-lg bg-mc-accent text-white hover:bg-mc-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
