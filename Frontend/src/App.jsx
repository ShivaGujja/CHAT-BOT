import React, { useState, useEffect, useRef } from "react";
import CircularText from "./CircularText"; 


const BotIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export default function ChatWidget() {
  const API_ENDPOINT = "http://127.0.0.1:8000/chat";

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  
  const BTN_SIZE = 64; 
  const [pos, setPos] = useState(null); 
  const draggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const pointerIdRef = useRef(null);

  
  const chatEndRef = useRef(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  
  useEffect(() => {
    const saved = localStorage.getItem("chatIconPos");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setPos({
          x: clamp(p.x, 8, window.innerWidth - BTN_SIZE - 8),
          y: clamp(p.y, 8, window.innerHeight - BTN_SIZE - 8),
        });
        return;
      } catch {}
    }
    setPos({ x: window.innerWidth - BTN_SIZE - 16, y: window.innerHeight - BTN_SIZE - 16 });
    
  }, []);

  
  function clamp(value, low, high) {
    return Math.min(Math.max(value, low), high);
  }

  
  useEffect(() => {
    const onResize = () => {
      setPos((p) => {
        if (!p) return p;
        return {
          x: clamp(p.x, 8, window.innerWidth - BTN_SIZE - 8),
          y: clamp(p.y, 8, window.innerHeight - BTN_SIZE - 8),
        };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  
  const onPointerDown = (e) => {
    
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;

    draggingRef.current = true;
    movedRef.current = false;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = pos ? { ...pos } : { x: 0, y: 0 };
  };

  
  useEffect(() => {
    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;

      const nextX = startPosRef.current.x + dx;
      const nextY = startPosRef.current.y + dy;
      setPos({
        x: clamp(nextX, 8, window.innerWidth - BTN_SIZE - 8),
        y: clamp(nextY, 8, window.innerHeight - BTN_SIZE - 8),
      });
    };

    const onPointerUp = (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      
      try {
        if (pointerIdRef.current != null && e.target?.releasePointerCapture) {
          e.target.releasePointerCapture(pointerIdRef.current);
        }
      } catch {}
      
      if (pos) localStorage.setItem("chatIconPos", JSON.stringify(pos));
      
      if (!movedRef.current) {
        setIsOpen(true);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [pos]); 

  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: "bot", text: "👋 Hi! I’m the Interas Labs assistant. How can I help you?" }]);
    }
  }, [isOpen]); 

  useEffect(() => { scrollToBottom(); }, [messages]);

  
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const newUserMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botText = data.answer?.content || data.answer || "No answer returned";
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Sorry, something went wrong. Try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <>
      {/* draggable button */}
      {!isOpen && pos && (
        <button
          aria-label="Open chat"
          onPointerDown={onPointerDown}
          onDragStart={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: BTN_SIZE,
            height: BTN_SIZE,
            borderRadius: "9999px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
        >
          <BotIcon className="w-6 h-6" />
        </button>
      )}

      {/* optional centered circular text */}
      <div className="pointer-events-none select-none flex items-center justify-center h-screen">
        <CircularText text="INTERAS*LABS*" onHover="speedUp" spinDuration={20} className="custom-class" />"
      </div>

      {/* chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-100 shadow-xl rounded-2xl flex flex-col z-50">
          <header className="bg-indigo-500 text-white p-4 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full"><BotIcon className="w-6 h-6" /></div>
              <div>
                <h3 className="text-lg font-semibold">Interas Labs Assistant</h3>
                <p className="text-xs text-green-200">● Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="px-3 py-1 rounded bg-white bg-opacity-10">Close</button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender === "bot" && <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-2"><BotIcon className="w-4 h-4" /></div>}
                <div className={`p-3 rounded-2xl max-w-xs ${m.sender === "user" ? "bg-indigo-500 text-white" : "bg-white text-gray-800"}`}>{m.text}</div>
                {m.sender === "user" && <div className="w-8 h-8 rounded-full bg-gray-300 ml-2 flex items-center justify-center"><UserIcon className="w-4 h-4" /></div>}
              </div>
            ))}
            {isLoading && <div className="text-sm text-gray-500">…thinking</div>}
            <div ref={chatEndRef} />
          </main>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t rounded-b-2xl flex gap-2">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask about Interas Labs..." className="flex-1 p-2 border rounded-full" />
            <button type="submit" className="p-2 rounded-full bg-indigo-500 text-white"> <SendIcon className="w-4 h-4" /> </button>
          </form>
        </div>
      )}
    </>
  );
}
