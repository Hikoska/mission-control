import { useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

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

type EmbedStatus = "loading" | "ready" | "blocked";

function EmbeddedView({ onDisconnect }: { onDisconnect: () => void }) {
  const [status, setStatus] = useState<EmbedStatus>("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    // iframe loaded — either surething.io rendered, or the browser blocked it
    // We can't reliably detect X-Frame-Options from JS, but if it loaded without error, we're good
    setStatus("ready");
  };

  const handleError = () => {
    setStatus("blocked");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Floating controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <a href="https://surething.io" target="_blank" rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg bg-mc-bg/80 backdrop-blur-sm border border-mc-border
                     text-[11px] text-mc-text-muted hover:text-mc-text hover:border-mc-border-active
                     transition-colors flex items-center gap-1.5"
          title="Open in browser">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>Browser</span>
        </a>
        <button onClick={onDisconnect}
          className="px-2.5 py-1 rounded-lg bg-mc-bg/80 backdrop-blur-sm border border-mc-border
                     text-[11px] text-mc-text-muted hover:text-mc-text hover:border-mc-border-active
                     transition-colors flex items-center gap-1.5"
          title="Disconnect">
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === "ready" ? "bg-mc-success" :
            status === "loading" ? "bg-mc-warning animate-pulse" :
            "bg-red-500"
          }`} />
          <span>{status === "ready" ? "Connected" : status === "loading" ? "Loading..." : "Blocked"}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Loading overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-mc-bg">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-2 border-mc-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-mc-text-muted">Loading SureThing...</p>
          </div>
        </div>
      )}

      {/* Blocked overlay */}
      {status === "blocked" && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-mc-bg">
          <div className="text-center max-w-sm px-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-mc-warning/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mc-warning">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-mc-text mb-2">Embedding blocked</h3>
            <p className="text-xs text-mc-text-muted mb-4">
              SureThing\u2019s server doesn\u2019t allow embedding. You can still use it in a separate browser window.
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={onDisconnect}
                className="px-4 py-2 rounded-lg bg-mc-surface border border-mc-border text-xs text-mc-text hover:bg-mc-bg-hover transition-colors">
                Go Back
              </button>
              <a href="https://surething.io" target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-mc-accent text-white text-xs font-medium hover:bg-mc-accent-hover transition-colors">
                Open in Browser
              </a>
            </div>
          </div>
        </div>
      )}

      {/* The iframe — simple and reliable */}
      <iframe
        ref={iframeRef}
        src="https://surething.io"
        onLoad={handleLoad}
        onError={handleError}
        className="flex-1 w-full border-0 bg-mc-bg"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

export function ChatPanel() {
  const { activeThreadId, messages, threads, isConnected, setConnected } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const handleConnect = () => setConnected(true);
  const handleDisconnect = () => setConnected(false);

  // Connected mode: show embedded SureThing
  if (isConnected) {
    return <EmbeddedView onDisconnect={handleDisconnect} />;
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
