import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Ambulance,
  PhoneCall,
  Bot,
  History,
  Home,
  User,
  Clock,
  ClipboardList,
  PlusSquare,
  HeartPulse,
  Plus,
  Send,
} from "lucide-react";

const QUICK_ACTIONS = [
  { icon: Clock, label: "Last Trip Details", variant: "default" },
  { icon: ClipboardList, label: "Medical History Summary", variant: "default" },
  { icon: PlusSquare, label: "Nearby Hospitals", variant: "default" },
  { icon: HeartPulse, label: "Emergency First Aid", variant: "danger" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "I can help you review your medical history, find emergency care, or check details of your last ambulance trip. What would you like to do?",
      time: "10:42 AM",
    },
  ]);
  const [input, setInput] = useState("");

  function currentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: input, time: currentTime() },
      { from: "ai", text: "Placeholder response — real AI assistant logic connects here in Phase 2+.", time: currentTime() },
    ]);
    setInput("");
  }

  function handleQuickAction(label) {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: label, time: currentTime() },
      { from: "ai", text: `Placeholder response for "${label}" — real logic connects here in Phase 2+.`, time: currentTime() },
    ]);
  }

  return (
    <div className="min-h-screen bg-nirvaan-bg pb-40 flex flex-col max-w-md mx-auto md:max-w-lg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-nirvaan-bg">
        <h1 className="text-2xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-6 h-6" /> Nirvaan
        </h1>
        <button className="bg-nirvaan-primary text-white text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <PhoneCall className="w-4 h-4" /> Call Help
        </button>
      </header>

      {/* AI intro */}
      <div className="flex flex-col items-center mt-4 px-6 mb-4">
        <div className="w-16 h-16 rounded-full bg-nirvaan-secondary flex items-center justify-center shadow-sm mb-3">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-nirvaan-dark">AI Assistant</h2>
        <p className="text-sm text-nirvaan-outline text-center mt-1">
          Hello! I am your Nirvaan AI Assistant. How can I help you today?
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 space-y-3">
        {messages.map((m, i) =>
          m.from === "ai" ? (
            <div key={i} className="flex items-start gap-2">
              <span className="w-8 h-8 rounded-full bg-nirvaan-surface flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-nirvaan-secondary" />
              </span>
              <div className="bg-white border border-nirvaan-outline-variant rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-nirvaan-dark leading-relaxed">{m.text}</p>
                <p className="text-xs text-nirvaan-outline mt-1.5">{m.time}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-nirvaan-secondary text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className="text-xs text-white/70 mt-1.5">{m.time}</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-5 space-y-2">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            onClick={() => handleQuickAction(qa.label)}
            className={`w-full text-left px-4 py-3 rounded-full border font-semibold text-sm flex items-center gap-2 ${
              qa.variant === "danger"
                ? "border-nirvaan-primary text-nirvaan-primary bg-white"
                : "border-nirvaan-secondary text-nirvaan-secondary bg-white"
            }`}
          >
            <qa.icon className="w-4 h-4" /> {qa.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="fixed bottom-16 left-0 right-0 max-w-md mx-auto md:max-w-lg bg-nirvaan-bg px-4 py-3 border-t border-nirvaan-surface-high"
      >
        <div className="flex items-center gap-2 bg-white border border-nirvaan-outline-variant rounded-full px-3 py-2">
          <button type="button" className="text-nirvaan-outline px-1">
            <Plus className="w-5 h-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around py-2.5 max-w-md mx-auto md:max-w-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><Home className="w-5 h-5" /></span>
          Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold">
          <span className="w-9 h-9 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><Bot className="w-4 h-4" /></span>
          AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><History className="w-5 h-5" /></span>
          History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium">
          <span className="w-9 h-9 flex items-center justify-center"><User className="w-5 h-5" /></span>
          Profile
        </Link>
      </nav>
    </div>
  );
}