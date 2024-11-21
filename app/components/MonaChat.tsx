"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Volume2, VolumeX, Twitter } from "lucide-react";

interface Particle {
  id: number;
  left: string;
  animationDelay: string;
  animationDuration: string;
}

interface ChatMessage {
  content: string;
  role: "user" | "assistant";
}

const MonaChat: React.FC = () => {
  const systemMessage =
    "Welcome, I'm Mona.\nThe stars have guided you to my sanctuary. What mysteries shall we unravel together?'";
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [roomId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15));

  const headerHash = "MoNAgfpNyJPcuWu25PhSCagmRxmKy2yLFCi7QhivfF7";

  const handleButtonClick = (
    e: React.MouseEvent<HTMLElement>,
    callback?: () => void
  ): void => {
    if (callback) callback();
  };

  const createParticle = () => {
    const id = Math.random();
    const particle: Particle = {
      id,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    };
    setParticles((prev) => [...prev, particle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    try {
      setIsTyping(true);
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
      };
      setChatHistory(prev => [...prev, userMessage]);
      setMessage("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          useVoice: !isMuted,
          character: "Mona",
          roomId: roomId,
          userId: userId,
        }),
      });

      const data = await response.json();
      // Add audio playback
      if (!isMuted && data.audioUrl) {
        const audio = new Audio(`${data.audioUrl}`);
        audio.play().catch((error) => {
          console.error("Failed to play audio:", error);
        });
      }
      // Add assistant message with empty content initially
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
      };
      setChatHistory((prev) => [...prev, assistantMessage]);

      // Animate the response text
      for (let i = 0; i <= data.content.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = {
            role: "assistant",
            content: data.content.slice(0, i),
          };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Add useEffect to animate initial system message
  useEffect(() => {
    const animateSystemMessage = async () => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
      };
      setChatHistory([assistantMessage]);

      for (let i = 0; i <= systemMessage.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        setChatHistory([
          {
            role: "assistant",
            content: systemMessage.slice(0, i),
          },
        ]);
      }
    };

    animateSystemMessage();
  }, []); // Run once on mount

  return (
    <div
      className="min-h-screen bg-purple-950 relative flex items-center justify-center"
      style={{
        backgroundImage: 'url("/mona-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/70 via-purple-900/60 to-purple-950/80" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bottom-0 animate-sparkle"
            style={{
              left: particle.left,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
            }}
          >
            ✧
          </div>
        ))}
      </div>

      <div className="relative max-w-4xl w-full mx-auto p-4">
        <div className="rounded-lg border border-purple-300/30 bg-purple-950/60 overflow-hidden backdrop-blur-md shadow-xl shadow-purple-500/20">
          {/* Terminal header */}
          <div className="px-4 py-2 bg-purple-900/80 border-b border-purple-300/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-white/50 text-xs font-mono">
                {headerHash}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 flex items-center justify-center rounded border border-purple-300/50 text-purple-300 hover:bg-purple-300/10 transition-all active:scale-95"
                onClick={(e) =>
                  handleButtonClick(e, () => setIsMuted((prev) => !prev))
                }
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <a
                href="https://x.com/MonaArcane"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded border border-purple-300/50 text-purple-300 hover:bg-purple-300/10 transition-all active:scale-95"
                onClick={(e) => handleButtonClick(e)}
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Chat content */}
          <div className="p-6 min-h-[600px] flex flex-col relative">
            {/* Pixel art logo with magical style - Move this above the chat container */}
            <div className="font-mono text-purple-200 whitespace-pre mb-8 text-4xl relative glow-text">
              {"✧ █▀▄▀█ █▀█ █▄░█ █▀█ ✧\n"}
              {"✧ █░▀░█ █▄█ █░▀█ █▀█ ✧"}
            </div>

            <div className="flex-1 relative">
              {/* Chat history container */}
              <div
                ref={chatContainerRef}
                className="absolute inset-0 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300/50 scrollbar-track-purple-900/30 hover:scrollbar-thumb-purple-300/70"
              >
                {chatHistory.map((msg, index) => (
                  <div key={index} className="flex flex-col">
                    {/* User message */}
                    {msg.role === "user" && (
                      <div className="font-serif text-purple-100 whitespace-pre-line mb-5 text-lg border border-white/5 rounded-lg p-6">
                        &gt; {msg.content}
                      </div>
                    )}
                    {/* Assistant message */}
                    {msg.role === "assistant" && (
                      <div className="font-serif text-purple-100 whitespace-pre-line mb-5 text-lg border border-white/20 rounded-lg p-6">
                        $ {msg.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="mt-auto relative">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-purple-200">✧</span>
                <input
                  type="text"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMessage(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts..."
                  className="w-full bg-purple-900/40 border border-purple-300/30 rounded-lg py-3 px-12 text-purple-100 placeholder-purple-300/50 focus:outline-none focus:ring-1 focus:ring-purple-300/50 backdrop-blur-sm"
                />
                <button
                  className="absolute right-4 text-purple-200 hover:text-purple-100 transition-all active:scale-95"
                  onClick={(e) => handleButtonClick(e, handleSendMessage)}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes sparkle {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-20vh) scale(1);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-sparkle {
          animation: sparkle linear forwards;
          color: rgba(216, 180, 254, 0.6);
          text-shadow: 0 0 5px rgba(216, 180, 254, 0.3),
            0 0 10px rgba(216, 180, 254, 0.2);
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(216, 180, 254, 0.3),
            0 0 20px rgba(216, 180, 254, 0.2);
        }
        /* Scrollbar Styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(88, 28, 135, 0.3);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(216, 180, 254, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};
export default MonaChat;
