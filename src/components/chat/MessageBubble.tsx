import { clsx } from "clsx";
import { format } from "date-fns";
import type { Message } from "../../types";
export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (message.role === "system") {
    return <div className="flex justify-center py-2 animate-fade-in"><span className="text-xs text-mc-text-muted bg-mc-surface-2 px-3 py-1 rounded-full">{message.content}</span></div>;
  }
  return (
    <div className={clsx("flex gap-3 py-2 px-4 animate-slide-up", isUser?"flex-row-reverse":"flex-row")}>
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0", isUser?"bg-mc-accent/20 text-mc-accent":"bg-mc-success/20 text-mc-success")}>
        {isUser ? "L" : "ST"}
      </div>
      <div className="max-w-[75%] min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx("text-xs font-medium", isUser?"text-mc-accent":"text-mc-success")}>{isUser?"Ludovic":"SureThing"}</span>
          <span className="text-[10px] text-mc-text-muted">{format(new Date(message.timestamp), "HH:mm")}</span>
          {message.status === "sending" && <span className="text-[10px] text-mc-warning">sending...</span>}
        </div>
        <div className={clsx("rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-mc-accent/10 border border-mc-accent/20 text-mc-text" : "bg-mc-surface-2 border border-mc-border text-mc-text")}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
