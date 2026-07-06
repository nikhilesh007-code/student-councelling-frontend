import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingChatButton } from './FloatingChatButton';
import { ChatMessage, type Message } from './ChatMessage';

const SUGGESTED_PROMPTS = [
  'What career suits me?',
  'Analyze my skills',
  'Recommend internships',
  'Create a learning roadmap',
  'Improve my resume',
];

// Small burst of particles that fly into the AI icon, once per chat-open
const AIActivationEffect: React.FC<{ burstKey: number }> = ({ burstKey }) => {
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <>
      {/* Rotating energy ring - soft continuous glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ border: '1.5px dashed rgba(255,255,255,0.55)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      {/* One-time particle burst into the icon */}
      <React.Fragment key={burstKey}>
        {angles.map((angle) => (
          <motion.span
            key={angle}
            className="absolute w-1 h-1 rounded-full bg-green-300 pointer-events-none"
            style={{ top: '50%', left: '50%' }}
            initial={{
              x: Math.cos((angle * Math.PI) / 180) * 22,
              y: Math.sin((angle * Math.PI) / 180) * 22,
              opacity: 0,
            }}
            animate={{ x: 0, y: 0, opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
          />
        ))}
      </React.Fragment>
    </>
  );
};

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [sendTrigger, setSendTrigger] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/auth/get-session`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch(err => console.error("Failed to load session for chat:", err));
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Trigger the AI activation particle burst each time the chat opens
  useEffect(() => {
    if (isOpen) {
      setBurstKey((k) => k + 1);
    }
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen && isMaximized) {
       setIsMaximized(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !userId || isTyping) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const now = new Date();
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: messageText,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 30000);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: messageText }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.success ? data.reply : "I'm sorry, I encountered an error processing your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: err.name === 'AbortError' ? "Request timed out. Please try again." : "Network error. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      clearTimeout(timeoutId);
      setIsTyping(false);
    }
  };

  const handleSendClick = () => {
    setSendTrigger((t) => t + 1);
    sendMessage(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setSendTrigger((t) => t + 1);
      sendMessage(inputText);
    }
  };

  const canSend = !!inputText.trim() && !isTyping;

  return (
    <>
      {/* Floating Chat Overlay Container */}
      <div 
        className={`fixed z-40 transition-all duration-300 ease-in-out transform origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          ${isMaximized 
            ? 'inset-4 md:inset-10 bottom-24' 
            : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[calc(100vh-120px)]'
          }
          bg-slate-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200
        `}
      >
        {/* Header */}
        <div className="bg-[#00a878] px-5 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <AIActivationEffect burstKey={burstKey} />
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-[15px]">CareerAI Assistant</h3>
              <p className="text-emerald-100 text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                Online & Ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setMessages([])} 
              className="w-8 h-8 flex items-center justify-center text-emerald-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              className="w-8 h-8 flex items-center justify-center text-emerald-100 hover:text-white hover:bg-white/20 rounded-lg transition-colors hidden sm:flex"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              <span className="material-symbols-outlined text-[18px]">{isMaximized ? 'fullscreen_exit' : 'fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-slate-50 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-[280px] mx-auto my-auto">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-[#00a878] mb-4 shadow-sm border border-emerald-200">
                <motion.span
  key={isOpen ? 'wave-open' : 'wave-closed'}
  className="material-symbols-outlined text-3xl"
  style={{ fontVariationSettings: "'FILL' 1", display: 'inline-block', transformOrigin: '70% 70%' }}
  animate={{ rotate: [0, 18, -14, 18, -14, 18, -14, 0] }}
  transition={{
    duration: 1.8,
    ease: 'easeInOut',
    times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1],
  }}
>
  waving_hand
</motion.span>
               </div>
               <h3 className="text-lg font-extrabold text-slate-800 mb-2">Hello there!</h3>
               <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">I'm your AI career guide. Ask me anything about skills, roadmaps, or internships.</p>
               
               <div className="flex flex-col gap-2 w-full">
                 {SUGGESTED_PROMPTS.map((prompt, idx) => (
                   <button 
                     key={idx}
                     onClick={() => sendMessage(prompt)}
                     className="bg-white border border-slate-200 py-2.5 px-4 rounded-xl text-left hover:bg-emerald-50 hover:border-emerald-200 hover:text-[#00a878] transition-all group shadow-sm text-[13px] font-bold text-slate-600"
                   >
                     {prompt}
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
               {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
               <AnimatePresence>
                 {isTyping && (
                    <motion.div
                      className="flex gap-3 flex-row w-full"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#00a878] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-500 ml-2 mb-1">CareerAI is thinking...</div>
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm h-[40px] w-fit">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 bg-[#00a878] rounded-full"
                              style={{ boxShadow: '0 0 6px rgba(0,168,120,0.6)' }}
                              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                 )}
               </AnimatePresence>
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
           <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-[#00a878] focus-within:ring-1 focus-within:ring-[#00a878] transition-all shadow-sm">
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={handleKeyPress}
               disabled={isTyping}
               placeholder="Type your message..."
               className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-24 min-h-[40px] py-2.5 px-3 text-[14px] text-slate-700 outline-none"
               rows={1}
             />
             <motion.button 
               onClick={handleSendClick}
               disabled={!canSend}
               animate={{
                 scale: canSend ? 1.08 : 1,
                 boxShadow: canSend ? '0 0 12px rgba(0,168,120,0.55)' : '0 0 0px rgba(0,168,120,0)',
               }}
               whileTap={canSend ? { scale: 0.88 } : undefined}
               transition={{ duration: 0.25, ease: 'easeOut' }}
               className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center mb-0.5 mr-0.5
                 ${canSend
                   ? 'bg-[#00a878] text-white hover:bg-[#008b63]' 
                   : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
             >
               <motion.span
                 key={sendTrigger}
                 className="material-symbols-outlined text-[20px]"
                 style={{ fontVariationSettings: "'FILL' 1", marginLeft: '2px' }}
                 initial={{ x: 0 }}
                 animate={{ x: [0, 6, 0] }}
                 transition={{ duration: 0.3, ease: 'easeOut' }}
               >
                 send
               </motion.span>
             </motion.button>
           </div>
           <p className="text-center text-[10px] font-bold text-slate-400 mt-2">
              AI Assistant can make mistakes.
           </p>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <FloatingChatButton isOpen={isOpen} onClick={toggleWidget} />
    </>
  );
};
