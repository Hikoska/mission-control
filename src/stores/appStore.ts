import { create } from "zustand";
import type { Thread, Message, AgentActivity, PendingAction, ViewMode } from "../types";

interface AppState {
  threads: Thread[]; activeThreadId: string | null;
  setActiveThread: (id: string) => void;
  addThread: (thread: Thread) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
  messages: Record<string, Message[]>;
  addMessage: (threadId: string, message: Message) => void;
  activities: AgentActivity[]; pendingActions: PendingAction[];
  addActivity: (a: AgentActivity) => void;
  addPendingAction: (a: PendingAction) => void;
  removePendingAction: (id: string) => void;
  viewMode: ViewMode; setViewMode: (m: ViewMode) => void;
  sidebarCollapsed: boolean; toggleSidebar: () => void;
  agentPanelVisible: boolean; toggleAgentPanel: () => void;
  commandPaletteOpen: boolean; toggleCommandPalette: () => void;
  // v0.2: SureThing connection
  isConnected: boolean; setConnected: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  threads: [
    { id:"adapro", name:"Adapro \u2014 IT Infrastructure", status:"active",
      lastMessage:"Analyzing vendor quotes...", lastMessageAt:new Date().toISOString(), unreadCount:0, icon:"\ud83c\udfed" },
    { id:"mission-control", name:"Mission Control App", status:"active",
      lastMessage:"v0.2 — Live connection enabled", lastMessageAt:new Date().toISOString(), unreadCount:0, icon:"\ud83d\ude80" },
    { id:"linkgrow-strategy", name:"Linkgrow Strategy", status:"idle",
      lastMessage:"Roadmap: Adapro \u2192 Inicia \u2192 SaaS \u2192 Content",
      lastMessageAt:new Date(Date.now()-3600000).toISOString(), unreadCount:0, icon:"\ud83d\udcca" },
    { id:"x-content", name:"X Content Strategy", status:"idle",
      lastMessage:"Finance 4.0 article series planned",
      lastMessageAt:new Date(Date.now()-7200000).toISOString(), unreadCount:0, icon:"\u270d\ufe0f" },
  ],
  activeThreadId: "adapro",
  setActiveThread: (id) => set({ activeThreadId: id }),
  addThread: (thread) => set((s) => ({ threads: [...s.threads, thread] })),
  updateThread: (id, updates) => set((s) => ({ threads: s.threads.map((t) => t.id===id ? {...t,...updates} : t) })),
  messages: {
    adapro: [
      { id:"m1", threadId:"adapro", role:"assistant",
        content:"I've analyzed the WeTransfer files. Found 5 files: IT Roadmap 1 & 2, IT Solvz quotes, and Cyberati quotation.",
        timestamp:new Date(Date.now()-1800000).toISOString() },
      { id:"m2", threadId:"adapro", role:"user",
        content:"I'm reviewing the two 17-page reports now.",
        timestamp:new Date(Date.now()-900000).toISOString() },
    ],
    "mission-control": [
      { id:"mc1", threadId:"mission-control", role:"user",
        content:"Work on the mission control desktop app in the background.",
        timestamp:new Date(Date.now()-300000).toISOString() },
      { id:"mc2", threadId:"mission-control", role:"assistant",
        content:"v0.2 ready. Click Connect to link with SureThing for live communication.",
        timestamp:new Date().toISOString() },
    ],
  },
  addMessage: (threadId, message) => set((s) => ({ messages: {...s.messages, [threadId]: [...(s.messages[threadId]||[]), message]} })),
  activities: [
    { id:"a1", action:"file_analysis", description:"Extracted vendor quotes from WeTransfer ZIP",
      timestamp:new Date(Date.now()-2400000).toISOString(), status:"completed", threadId:"adapro" },
    { id:"a2", action:"live_connection", description:"SureThing API bridge enabled (v0.2)",
      timestamp:new Date().toISOString(), status:"completed", threadId:"mission-control" },
    { id:"a3", action:"monitoring", description:"Watching for Adapro report review feedback",
      timestamp:new Date().toISOString(), status:"pending", threadId:"adapro" },
  ],
  pendingActions: [
    { id:"pa1", type:"approval", title:"Connect to SureThing",
      description:"Link Mission Control to live SureThing agent for real-time communication",
      timestamp:new Date().toISOString(), priority:"high" },
  ],
  addActivity: (a) => set((s) => ({ activities: [a,...s.activities] })),
  addPendingAction: (a) => set((s) => ({ pendingActions: [...s.pendingActions, a] })),
  removePendingAction: (id) => set((s) => ({ pendingActions: s.pendingActions.filter((a) => a.id!==id) })),
  viewMode: "chat", setViewMode: (mode) => set({ viewMode: mode }),
  sidebarCollapsed: false, toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  agentPanelVisible: true, toggleAgentPanel: () => set((s) => ({ agentPanelVisible: !s.agentPanelVisible })),
  commandPaletteOpen: false, toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  // v0.2: SureThing connection
  isConnected: false, setConnected: (val) => set({ isConnected: val }),
}));
