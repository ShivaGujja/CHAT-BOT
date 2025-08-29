import React, { useState, useEffect, useRef } from "react";
import CircularText from './CircularText';
// --- Helper Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

const BotIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);


export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const API_ENDPOINT = "http://127.0.0.1:8000/chat";

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: "bot", text: "👋 Hi! I’m the Interas Labs assistant. How can I help you?" },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const newBotMessage = { sender: "bot", text: data.answer.content || data.answer };
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Sorry, something went wrong. Try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full shadow-lg transition"
        >
          <BotIcon className="w-6 h-6" />
        </button>
      )}
      <div className=" flex items-center justify-center h-screen ">
      
  
      <CircularText
        text="INTERAS*LABS*"
        onHover="speedUp"
        spinDuration={20}
        className="custom-class"
/>
      </div>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-96 h-[600px] bg-gray-100 shadow-xl rounded-2xl flex flex-col font-sans border border-gray-300 animate-fade-in">
          {/* Header */}
          <header className="bg-indigo-500 text-white rounded-t-2xl p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <BotIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Interas Labs Assistant</h1>
                <p className="text-xs text-green-200">● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </header>

          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <BotIcon className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 max-w-xs rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-indigo-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <BotIcon className="w-4 h-4" />
                </div>
                <div className="p-3 max-w-xs rounded-2xl bg-white text-gray-800 rounded-bl-none">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </main>

          {/* Input */}
          <footer className="bg-white border-t rounded-b-2xl p-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-2 bg-indigo-500 text-white rounded-full disabled:bg-indigo-300"
                disabled={isLoading || !userInput.trim()}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
}
