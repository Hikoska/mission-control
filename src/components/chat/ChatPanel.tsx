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
          Link Mission Control to your SureThing agent for live, bidirectional communication.
          Your threads, agent activity, and quick actions stay in the native panels around it.
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
          Opens SureThing in a companion window alongside Mission Control.
        </p>
      </div>
    </div>
  );
}

/* ── Live View ─────────────────────────────────── */

type Status = "connecting" | "companion" | "browser" | "failed";

function LiveView({ onDisconnect }: { onDisconnect: () => void }) {
  const [status, setStatus] = useState<Status>("connecting");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Create companion window via Rust (bypasses broken JS WebView2 API)
        const result = await invoke<string>("open_surething_window");
        if (!cancelled) {
          console.log("[SureThing] Rust window result:", result);
          setStatus("companion");
        }
      } catch (err) {
        console.error("[SureThing] Rust window failed:", err);
        if (cancelled) return;

        // Fallback: open in system browser via Rust
        try {
          await invoke("open_in_browser", { url: ST_URL });
          if (!cancelled) setStatus("browser");
        } catch (browserErr) {
          console.error("[SureThing] Browser open failed:", browserErr);
          if (!cancelled) setStatus("failed");
        }
      }
    })();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFocus = async () => {
    try {
      await invoke("focus_surething_window");
    } catch {
      // Window was closed externally — try reopening
      try {
        await invoke<string>("open_surething_window");
        setStatus("companion");
      } catch {
        try {
          await invoke("open_in_browser", { url: ST_URL });
          setStatus("browser");
        } catch { /* exhausted all options */ }
      }
    }
  };

  const handleDisconnect = async () => {
    try { await invoke("close_surething_window"); } catch {}
    onDisconnect();
  };

  const handleOpenBrowser = async () => {
    try {
      await invoke("open_in_browser", { url: ST_URL });
    } catch {
      window.open(ST_URL, "_blank");
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(ST_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* Connecting spinner */
  if (status === "connecting") {
    return (
      <div className="flex-1 flex items-center justify-center bg-mc-bg">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-mc-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-mc-text-muted">Opening SureThing{"\u2026"}</p>
        </div>
      </div>
    );
  }

  const isCompanion = status === "companion";
  const isFailed = status === "failed";

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          isCompanion ? "bg-mc-success/10" : isFailed ? "bg-red-500/10" : "bg-mc-accent/10"
        }`}>
          {isCompanion ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.5" className="text-mc-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.5" className={isFailed ? "text-red-400" : "text-mc-accent"}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${
            isCompanion ? "bg-mc-success animate-pulse" :
            isFailed ? "bg-red-500" : "bg-mc-accent"
          }`} />
          <h2 className="text-xl font-bold text-mc-text">
            {isCompanion ? "SureThing is Open" :
             isFailed ? "Connection Failed" : "Opened in Browser"}
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-mc-text-muted mb-6 leading-relaxed">
          {isCompanion
            ? "Your session is running in a companion window. Mission Control\u2019s sidebar and agent panel stay here for context."
            : isFailed
            ? "Couldn\u2019t open SureThing automatically. Use the buttons below to open it manually."
            : "SureThing should have opened in your browser. If it didn\u2019t appear, click below."}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          {isCompanion ? (
            <button onClick={handleFocus}
              className="px-5 py-2.5 rounded-xl bg-mc-accent text-white text-sm font-semibold
                         hover:bg-mc-accent-hover transition-colors shadow-md shadow-mc-accent/20">
              {"\u26a1"} Focus Window
            </button>
          ) : (
            <button onClick={handleOpenBrowser}
              className="px-5 py-2.5 rounded-xl bg-mc-accent text-white text-sm font-semibold
                         hover:bg-mc-accent-hover transition-colors shadow-md shadow-mc-accent/20">
              Open in Browser
            </button>
          )}
          <button onClick={handleDisconnect}
            className="px-5 py-2.5 rounded-xl bg-mc-surface border border-mc-border text-sm
                       text-mc-text hover:bg-mc-bg-hover transition-colors">
            Disconnect
          </button>
        </div>

        {/* Secondary */}
        <div className="flex items-center justify-center gap-3 text-[11px]">
          {isCompanion && (
            <button onClick={handleOpenBrowser}
              className="text-mc-text-muted hover:text-mc-accent transition-colors underline underline-offset-2">
              open in browser instead
            </button>
          )}
          <button onClick={handleCopy}
            className="text-mc-text-muted hover:text-mc-accent transition-colors underline underline-offset-2">
            {copied ? "\u2713 copied!" : "copy URL"}
          </button>
        </div>
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
    return <LiveView onDisconnect={() => setConnected(false)} />;
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
