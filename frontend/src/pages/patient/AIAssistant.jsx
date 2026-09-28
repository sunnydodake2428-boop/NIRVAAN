// frontend/src/pages/patient/AIAssistant.jsx

import { useState, useRef, useEffect } from "react";
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
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function currentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: input, time: currentTime() },
      { from: "ai", text: "AI Assistant is analyzing your request...", time: currentTime() },
    ]);
    setInput("");
  }

  function handleQuickAction(label) {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: label, time: currentTime() },
      { from: "ai", text: `Fetching info for "${label}"...`, time: currentTime() },
    ]);
  }

  return (
    <div className="h-screen bg-nirvaan-bg flex flex-col max-w-md mx-auto md:max-w-lg relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm shrink-0 z-10">
        <h1 className="text-xl font-extrabold text-nirvaan-primary tracking-tight flex items-center gap-1.5">
          <Ambulance className="w-5 h-5" /> Nirvaan
        </h1>
        <a
          href="tel:102"
          className="bg-nirvaan-primary text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 min-h-[40px]"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call Help
        </a>
      </header>

      {/* Chat scroll container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex flex-col items-center my-2">
          <div className="w-14 h-14 rounded-full bg-nirvaan-secondary flex items-center justify-center shadow-sm mb-2">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-extrabold text-nirvaan-dark">AI Assistant</h2>
          <p className="text-xs text-nirvaan-outline text-center mt-0.5">
            How can I help you today?
          </p>
        </div>

        {messages.map((m, i) =>
          m.from === "ai" ? (
            <div key={i} className="flex items-start gap-2">
              <span className="w-7 h-7 rounded-full bg-nirvaan-surface flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-nirvaan-secondary" />
              </span>
              <div className="bg-white border border-nirvaan-outline-variant rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%] shadow-sm">
                <p className="text-xs sm:text-sm text-nirvaan-dark leading-relaxed">{m.text}</p>
                <p className="text-[10px] text-nirvaan-outline mt-1">{m.time}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-nirvaan-secondary text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%] shadow-sm">
                <p className="text-xs sm:text-sm leading-relaxed">{m.text}</p>
                <p className="text-[10px] text-white/70 mt-1">{m.time}</p>
              </div>
            </div>
          )
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 bg-nirvaan-bg">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            onClick={() => handleQuickAction(qa.label)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 shrink-0 bg-white ${
              qa.variant === "danger"
                ? "border-nirvaan-primary text-nirvaan-primary"
                : "border-nirvaan-secondary text-nirvaan-secondary"
            }`}
          >
            <qa.icon className="w-3.5 h-3.5" /> {qa.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="bg-white px-3 py-2.5 border-t border-nirvaan-surface-high shrink-0 mb-14"
      >
        <div className="flex items-center gap-2 bg-nirvaan-bg border border-nirvaan-outline-variant rounded-full px-3 py-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Assistant..."
            className="flex-1 outline-none text-xs sm:text-sm bg-transparent px-1"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center shrink-0 min-h-[32px] min-w-[32px]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-nirvaan-surface-high flex justify-around items-center py-2 z-30 max-w-md mx-auto md:max-w-lg shadow-lg">
        <Link to="/patient" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><Home className="w-4 h-4" /></span>
          Home
        </Link>
        <Link to="/patient/ai" className="flex flex-col items-center gap-0.5 text-nirvaan-secondary text-xs font-semibold min-w-[56px]">
          <span className="w-8 h-8 rounded-full bg-nirvaan-secondary text-white flex items-center justify-center"><Bot className="w-4 h-4" /></span>
          AI Assistant
        </Link>
        <Link to="/patient/history" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><History className="w-4 h-4" /></span>
          History
        </Link>
        <Link to="/patient/profile" className="flex flex-col items-center gap-0.5 text-nirvaan-outline text-xs font-medium min-w-[56px]">
          <span className="w-8 h-8 flex items-center justify-center"><User className="w-4 h-4" /></span>
          Profile
        </Link>
      </nav>
    </div>
  );
}