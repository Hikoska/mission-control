import { useRef } from "react";
import { useAppStore } from "../../stores/appStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useSureThingEmbed, connectSureThing, disconnectSureThing } from "../../hooks/useSureThingEmbed";

function ConnectScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-mc-accent/10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mc-accent">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-mc-text mb-2">Connect to SureThing</h2>
        <p className="text-sm text-mc-text-muted mb-6 leading-relaxed">
          Link Mission Control to your SureThing agent for live, bidirectional communication.
          Your threads, agent activity, and quick actions stay in the native panels around it.
        </p>
        <button onClick={onConnect}
          className="w-full px-6 py-3 rounded-xl bg-mc-accent text-white font-semibold text-sm
                     hover:bg-mc-accent-hover transition-all duration-200
                     shadow-lg shadow-mc-accent/20 hover:shadow-mc-accent/30 hover:scale-[1.02]
                     active:scale-[0.98]">
          \u26a1 Connect Now
        </button>
        <p className="text-[11px] text-mc-text-muted mt-4">
          Opens SureThing in an embedded view. You\u2019ll log in once, then it\u2019s always connected.
        </p>
      </div>
    </div>
  );
}

function EmbeddedView({
  containerRef,
  onDisconnect,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Floating disconnect button */}
      <div className="absolute top-2 right-2 z-10">
        <button onClick={onDisconnect}
          className="px-2.5 py-1 rounded-lg bg-mc-bg/80 backdrop-blur-sm border border-mc-border
                     text-[11px] text-mc-text-muted hover:text-mc-text hover:border-mc-border-active
                     transition-colors flex items-center gap-1.5"
          title="Disconnect embedded view">
          <span className="w-1.5 h-1.5 rounded-full bg-mc-success" />
          <span>Connected</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {/* This div is the target area - the Tauri webview overlays it */}
      <div ref={containerRef} className="flex-1 bg-mc-bg" />
    </div>
  );
}

export function ChatPanel() {
  const { activeThreadId, messages, threads, isConnected, setConnected } = useAppStore();
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hook that manages the embedded webview lifecycle
  useSureThingEmbed(embedContainerRef, isConnected);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const handleConnect = async () => {
    setConnected(true);
    // Small delay to let React render the container div first
    setTimeout(async () => {
      if (embedContainerRef.current) {
        const success = await connectSureThing(embedContainerRef.current);
        if (!success) setConnected(false);
      }
    }, 100);
  };

  const handleDisconnect = async () => {
    await disconnectSureThing();
    setConnected(false);
  };

  // Connected mode: show embedded SureThing
  if (isConnected) {
    return <EmbeddedView containerRef={embedContainerRef} onDisconnect={handleDisconnect} />;
  }

  // Disconnected mode: show connect screen or native demo chat
  if (!activeThread) {
    return <ConnectScreen onConnect={handleConnect} />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between px-5 py-3 border-b border-mc-border bg-mc-surface no-select">
        <div className="flex items-center gap-3">
          <span className="text-lg">{activeThread.icon}</span>
          <div>
            <h2 className="text-sm font-semibold">{activeThread.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeThread.status === "active" ? "bg-mc-success" :
                activeThread.status === "waiting" ? "bg-mc-warning" : "bg-mc-text-muted"}`} />
              <span className="text-[11px] text-mc-text-muted capitalize">{activeThread.status}</span>
            </div>
          </div>
        </div>
        <button onClick={handleConnect}
          className="px-3 py-1.5 rounded-lg bg-mc-accent/10 text-mc-accent text-xs font-medium
                     hover:bg-mc-accent/20 transition-colors flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Connect Live
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {threadMessages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
      </div>
      <MessageInput />
    </div>
  );
}
