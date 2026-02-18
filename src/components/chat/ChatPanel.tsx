import { useRef, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/appStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

const ST_URL = "https://surething.io";

/* ── Connect Screen ────────────────────────────── */

function ConnectScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-mc-accent/10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" className="text-mc-accent">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-mc-text mb-2">Connect to SureThing</h2>
        <p className="text-sm text-mc-text-muted mb-6 leading-relaxed">
          Opens SureThing in your browser while Mission Control stays here as your
          command sidebar — threads, agent activity, and quick actions at a glance.
        </p>
        <button
          onClick={onConnect}
          className="w-full px-6 py-3 rounded-xl bg-mc-accent text-white font-semibold text-sm
                     hover:bg-mc-accent-hover transition-all duration-200
                     shadow-lg shadow-mc-accent/20 hover:shadow-mc-accent/30
                     hover:scale-[1.02] active:scale-[0.98]"
        >
          {"\u26a1"} Connect Now
        </button>
        <p className="text-[11px] text-mc-text-muted mt-4">
          Tip: Snap Mission Control to one side, browser to the other for a split-screen workflow.
        </p>
      </div>
    </div>
  );
}

/* ── Connected View ────────────────────────────── */

function ConnectedView({ onDisconnect }: { onDisconnect: () => void }) {
  const [openFailed, setOpenFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Immediately open surething.io in the system browser via Rust command
    (async () => {
      try {
        await invoke("open_in_browser", { url: ST_URL });
      } catch (err) {
        console.error("[SureThing] open_in_browser failed:", err);
        // Last resort: try window.open
        try { window.open(ST_URL, "_blank"); } catch {}
        setOpenFailed(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReopen = async () => {
    try {
      await invoke("open_in_browser", { url: ST_URL });
    } catch {
      try { window.open(ST_URL, "_blank"); } catch {}
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(ST_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-mc-success/10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" className="text-mc-success">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-mc-success animate-pulse" />
          <h2 className="text-xl font-bold text-mc-text">SureThing is Open</h2>
        </div>

        <p className="text-sm text-mc-text-muted mb-6 leading-relaxed">
          {openFailed
            ? "Couldn\u2019t open automatically. Copy the URL below and paste it in your browser."
            : "Your SureThing session is running in the browser. Use Mission Control here as your command sidebar."}
        </p>

        {/* Layout tip */}
        <div className="bg-mc-surface border border-mc-border rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-mc-text-muted leading-relaxed">
            <span className="text-mc-text font-medium">{"\ud83d\udca1"} Split-screen tip:</span>{" "}
            Press <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-[10px] font-mono border border-mc-border">Win</kbd>
            {" + "}
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-[10px] font-mono border border-mc-border">{"\u2190"}</kbd>
            {" "}to snap Mission Control left, then click the browser on the right half.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <button onClick={handleReopen}
            className="px-5 py-2.5 rounded-xl bg-mc-accent text-white text-sm font-semibold
                       hover:bg-mc-accent-hover transition-colors shadow-md shadow-mc-accent/20">
            Open Again
          </button>
          <button onClick={onDisconnect}
            className="px-5 py-2.5 rounded-xl bg-mc-surface border border-mc-border text-sm
                       text-mc-text hover:bg-mc-bg-hover transition-colors">
            Disconnect
          </button>
        </div>

        {/* Copy URL */}
        <button onClick={handleCopy}
          className="text-[11px] text-mc-text-muted hover:text-mc-accent transition-colors underline underline-offset-2">
          {copied ? "\u2713 copied!" : "copy URL"}
        </button>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────── */

export function ChatPanel() {
  const { activeThreadId, messages, threads, isConnected, setConnected } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  if (isConnected) {
    return <ConnectedView onDisconnect={() => setConnected(false)} />;
  }

  if (!activeThread) {
    return <ConnectScreen onConnect={() => setConnected(true)} />;
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
                activeThread.status === "waiting" ? "bg-mc-warning" : "bg-mc-text-muted"
              }`} />
              <span className="text-[11px] text-mc-text-muted capitalize">{activeThread.status}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setConnected(true)}
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
