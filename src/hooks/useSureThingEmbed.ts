import { useEffect, useRef, useState, type RefObject } from "react";

let webviewInstance: any = null;
let resizeObserver: ResizeObserver | null = null;

export type EmbedStatus = "idle" | "loading" | "connected" | "error";

export async function connectSureThing(
  container: HTMLDivElement,
  onStatus?: (status: EmbedStatus, error?: string) => void
): Promise<boolean> {
  if (webviewInstance) { onStatus?.("connected"); return true; }

  onStatus?.("loading");

  try {
    const { Webview } = await import("@tauri-apps/api/webview");
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");

    const appWindow = getCurrentWindow();
    const rect = container.getBoundingClientRect();

    // Use device pixel ratio to handle Windows DPI scaling
    const dpr = window.devicePixelRatio || 1;

    const webview = new Webview(appWindow, "surething-chat", {
      url: "https://surething.io",
      x: rect.x,
      y: rect.y,
      width: Math.max(rect.width, 400),
      height: Math.max(rect.height, 300),
      transparent: false,
    });

    // Wait for the webview to actually be created on the Rust side
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Webview creation timed out after 10s"));
      }, 10000);

      webview.once("tauri://created", () => {
        clearTimeout(timeout);
        resolve();
      });

      webview.once("tauri://error", (e: any) => {
        clearTimeout(timeout);
        reject(new Error(String(e?.payload || e)));
      });
    });

    // Explicitly set position, size, and show the webview
    await webview.setPosition(new LogicalPosition(Math.round(rect.x), Math.round(rect.y)));
    await webview.setSize(new LogicalSize(Math.round(rect.width), Math.round(rect.height)));
    await webview.setFocus();

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

    onStatus?.("connected");
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Failed to create SureThing webview:", msg);
    onStatus?.("error", msg);
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

  useEffect(() => {
    return () => { disconnectSureThing(); };
  }, []);
}
