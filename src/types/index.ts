export interface Thread {
  id: string; name: string; status: "active"|"idle"|"waiting";
  lastMessage?: string; lastMessageAt?: string; unreadCount: number; icon?: string;
}
export interface Message {
  id: string; threadId: string; role: "user"|"assistant"|"system";
  content: string; timestamp: string; status?: "sending"|"sent"|"error";
}
export interface AgentActivity {
  id: string; action: string; description: string;
  timestamp: string; status: "running"|"completed"|"failed"|"pending"; threadId?: string;
}
export interface PendingAction {
  id: string; type: "email_draft"|"calendar_draft"|"social_draft"|"approval";
  title: string; description: string; timestamp: string; priority: "high"|"normal"|"low";
}
export type ViewMode = "chat"|"split"|"agent";
