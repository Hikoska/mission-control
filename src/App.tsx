import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatPanel } from "./components/chat/ChatPanel";
import { AgentPanel } from "./components/agent-panel/AgentPanel";
import { TopBar } from "./components/layout/TopBar";
import { CommandPalette } from "./components/layout/CommandPalette";

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-mc-bg overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatPanel />
        <AgentPanel />
      </div>
      <CommandPalette />
    </div>
  );
}
export default App;
