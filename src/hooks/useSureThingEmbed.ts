import { useEffect, useRef, type RefObject } from "react";

let webviewInstance: any = null;
let resizeObserver: ResizeObserver | null = null;

export async function connectSureThing(container: HTMLDivElement) {
  if (webviewInstance) return true;

  try {
    const { Webview } = await import("@tauri-apps/api/webview");
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const { LogicalPosition, LogicalSize } = await import("@tauri-apps/api/dpi");

    const appWindow = getCurrentWindow();
    const rect = container.getBoundingClientRect();

    console.log("[SureThing] Creating webview at", {
      x: Math.round(rect.x), y: Math.round(rect.y),
      width: Math.round(rect.width), height: Math.round(rect.height)
    });

    const webview = new Webview(appWindow, "surething-embed", {
      url: "https://surething.io",
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      focus: true,
    });

    // Wait for the webview to be created before proceeding
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn("[SureThing] Webview creation timed out, attempting show anyway");
        resolve();
      }, 5000);

      webview.once("tauri://created", () => {
        console.log("[SureThing] Webview created successfully");
        clearTimeout(timeout);
        resolve();
      });

      webview.once("tauri://error", (e: any) => {
        console.error("[SureThing] Webview creation error:", e);
        clearTimeout(timeout);
        reject(new Error(String(e)));
      });
    });

    // Explicitly show the webview
    await webview.show();
    await webview.setFocus();
    console.log("[SureThing] Webview shown and focused");

    webviewInstance = webview;

    // Track container resize to reposition webview overlay
    resizeObserver = new ResizeObserver(async () => {
      const r = container.getBoundingClientRect();
      if (webviewInstance) {
        try {
          await webviewInstance.setPosition(new LogicalPosition(Math.round(r.x), Math.round(r.y)));
          await webviewInstance.setSize(new LogicalSize(Math.round(r.width), Math.round(r.height)));
        } catch (e) {
          console.warn("[SureThing] Resize error:", e);
        }
      }
    });
    resizeObserver.observe(container);

    return true;
  } catch (err) {
    console.error("[SureThing] Failed to create webview:", err);
    // Fallback: open in default browser
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
