"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Volume2, VolumeX, Twitter, MessageSquare } from "lucide-react";

interface Particle {
  id: number;
  left: string;
  animationDelay: string;
  animationDuration: string;
}

interface ChatMessage {
  content: string;
  role: "user" | "assistant";
  loading?: boolean;
  timestamp?: number;
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
  const [currentBg, setCurrentBg] = useState(1);
  const totalBgs = 6; // 6 mona images + 1 mona-bg

  const headerHash = "MoNAoCoXKLb38Y2VpbukGacdNYhvRTyVn92DvRApXep";

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

  useEffect(() => {
    const randomInterval = Math.floor(Math.random() * (60000 - 20000 + 1) + 10000); // Random between 10-30 seconds
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev % totalBgs) + 1);
    }, randomInterval);

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
      
      const loadingMessage: ChatMessage = {
        role: "assistant",
        content: "...",
        loading: true
      };
      
      setChatHistory(prev => [...prev, userMessage, loadingMessage]);
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
      
      setChatHistory(prev => prev.filter(msg => !msg.loading));

      if (!isMuted && data.audioUrl) {
        const audio = new Audio(`${data.audioUrl}`);
        audio.play().catch((error) => {
          console.error("Failed to play audio:", error);
        });
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      for (let i = 0; i <= data.content.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        setChatHistory(prev => {
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
      setChatHistory(prev => prev.filter(msg => !msg.loading));
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
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Update overlay gradient to be more moonlit */}
      <div className="absolute inset-0" />

      {/* Update particles to look more like stardust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bottom-0 animate-sparkle text-lg"
            style={{
              left: particle.left,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
            }}
          >
            ⋆
          </div>
        ))}
      </div>

      <div className="relative max-w-[1024px] w-full mx-auto p-4">
        <div className="rounded-lg border border-indigo-300/20 bg-indigo-950/40 overflow-hidden backdrop-blur-lg shadow-xl shadow-indigo-500/20">
          {/* Update header styling */}
          <div className="px-4 py-2 bg-indigo-900/60 border-b border-indigo-300/20 flex items-center justify-between">
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
                className="w-8 h-8 flex items-center justify-center rounded border border-indigo-300/50 text-indigo-300 hover:bg-indigo-300/10 transition-all active:scale-95"
                onClick={(e) =>
                  handleButtonClick(e, () => setIsMuted((prev) => !prev))
                }
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <a
                href="https://t.me/MonaArcane"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded border border-indigo-300/50 text-indigo-300 hover:bg-indigo-300/10 transition-all active:scale-95"
              >
                <MessageSquare size={16} />
              </a>
              <a
                href="https://x.com/MonaArcane"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded border border-indigo-300/50 text-indigo-300 hover:bg-indigo-300/10 transition-all active:scale-95"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Update chat content background */}
          <div 
            className="flex flex-col relative"
            style={{
              backgroundImage: `url("/mona-${currentBg}.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              height: "800px",
              transition: "background-image 1s ease-in-out",
            }}
          >
            {/* Update overlay transparency */}
            <div className="absolute inset-0 bg-indigo-950/70" />
            
            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full p-6">
              {/* Centered logo */}
              <div className="font-mono text-indigo-200 whitespace-pre mb-8 text-3xl relative glow-text text-center">
                {"✧ █▀▄▀█ █▀█ █▄░█ █▀█ ✧\n"}
                {"✧ █░▀░█ █▄█ █░▀█ █▀█ ✧"}
              </div>

              {/* Centered chat container */}
              <div className="flex-1 relative">
                <div
                  ref={chatContainerRef}
                  className="absolute inset-0 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-indigo-300/50 scrollbar-track-indigo-900/30 hover:scrollbar-thumb-indigo-300/70"
                >
                  {/* Chat messages with larger text */}
                  {chatHistory.map((msg, index) => (
                    <div key={index} className="flex flex-col max-w-3xl mx-auto">
                      {msg.role === "user" && (
                        <div className="font-bad-unicorn text-indigo-100 whitespace-pre-line mb-3 text-3xl bg-indigo-900/20 rounded-lg p-4">
                          &gt; {msg.content}
                        </div>
                      )}
                      {msg.role === "assistant" && (
                        <div className={`font-bad-unicorn text-indigo-100 whitespace-pre-line mb-3 text-2xl bg-indigo-900/40 rounded-lg p-4 ${msg.loading ? 'animate-pulse' : ''}`}>
                          $ {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Input container with adjusted width */}
              <div className="mt-4 w-[500px] mx-auto">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-indigo-200">✧</span>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    className="font-bad-unicorn w-full bg-indigo-900/40 rounded-lg py-4 px-12 text-2xl text-indigo-100 placeholder-indigo-300/50 focus:outline-none focus:ring-1 focus:ring-indigo-300/50 backdrop-blur-sm"
                  />
                  <button
                    className="absolute right-4 text-indigo-200 hover:text-indigo-100 transition-all active:scale-95"
                    onClick={(e) => handleButtonClick(e, handleSendMessage)}
                  >
                    <Send size={20} />
                  </button>
                </div>
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
            transform: translateY(-20vh) scale(1) rotate(45deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-sparkle {
          animation: sparkle linear forwards;
          color: rgba(199, 210, 254, 0.8);
          text-shadow: 0 0 5px rgba(199, 210, 254, 0.5),
                     0 0 10px rgba(199, 210, 254, 0.3);
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(199, 210, 254, 0.4),
                     0 0 20px rgba(199, 210, 254, 0.3),
                     0 0 30px rgba(199, 210, 254, 0.2);
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
