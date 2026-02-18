import { useEffect, useRef, type RefObject } from "react";

let webviewInstance: any = null;
let resizeObserver: ResizeObserver | null = null;

export async function connectSureThing(container: HTMLDivElement) {
  if (webviewInstance) return true; // Already connected

  try {
    const { Webview } = await import("@tauri-apps/api/webview");
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");

    const appWindow = getCurrentWindow();
    const rect = container.getBoundingClientRect();

    const webview = new Webview(appWindow, "surething-chat", {
      url: "https://surething.io",
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });

    webview.once("tauri://error", (e: any) => {
      console.error("SureThing webview error:", e);
    });

    webviewInstance = webview;

    // Track resize of the container and reposition the webview
    resizeObserver = new ResizeObserver(async () => {
      const r = container.getBoundingClientRect();
      if (webviewInstance) {
        try {
          await webviewInstance.setPosition(new LogicalPosition(Math.round(r.x), Math.round(r.y)));
          await webviewInstance.setSize(new LogicalSize(Math.round(r.width), Math.round(r.height)));
        } catch {}
      }
    });
    resizeObserver.observe(container);

    return true;
  } catch (err) {
    console.error("Failed to create SureThing webview:", err);
    // Fallback: open in system browser
    window.open("https://surething.io", "_blank");
    return false;
  }
}

export async function disconnectSureThing() {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (webviewInstance) {
    try { await webviewInstance.close(); } catch {}
    webviewInstance = null;
  }
}

export function useSureThingEmbed(
  containerRef: RefObject<HTMLDivElement | null>,
  isConnected: boolean
) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isConnected && containerRef.current && !initializedRef.current) {
      initializedRef.current = true;
      connectSureThing(containerRef.current);
    }
    if (!isConnected && initializedRef.current) {
      initializedRef.current = false;
      disconnectSureThing();
    }
  }, [isConnected, containerRef]);

  // Handle window resize — sidebar/agent panel toggles trigger container resize
  // which ResizeObserver handles, but window-level resize also matters
  useEffect(() => {
    if (!isConnected) return;
    const handleResize = async () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && webviewInstance) {
        const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");
        try {
          await webviewInstance.setPosition(new LogicalPosition(Math.round(rect.x), Math.round(rect.y)));
          await webviewInstance.setSize(new LogicalSize(Math.round(rect.width), Math.round(rect.height)));
        } catch {}
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isConnected, containerRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnectSureThing(); };
  }, []);
}
