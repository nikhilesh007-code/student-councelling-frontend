import React from 'react';
import { motion } from 'framer-motion';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

interface ChatMessageProps {
  message: Message;
}

// Reveals AI text word-by-word, left to right, quickly (feels "typed" but fast)
const AnimatedReplyText: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(' ');
  const stagger = Math.min(0.03, 0.35 / Math.max(words.length, 1));

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, x: -6 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.22, ease: 'easeOut' },
            },
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={
        isUser
          ? { opacity: 0, y: 20, scale: 0.9 }
          : { opacity: 0, y: 15, scale: 0.96 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        isUser
          ? { duration: 0.35, ease: 'easeOut' }
          : { type: 'spring', stiffness: 300, damping: 20 }
      }
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
        ${isUser ? 'bg-[#00a878] text-white' : 'bg-slate-100 text-[#00a878] border border-slate-200'}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isUser ? 'person' : 'psychology'}
        </span>
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative overflow-hidden px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm
          ${
            isUser
              ? 'bg-[#00a878] text-white rounded-tr-none'
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
          }`}
        >
          {/* Shine sweep — plays once when the AI reply appears */}
          {!isUser && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(100deg, transparent 30%, rgba(0,168,120,0.15) 50%, transparent 70%)',
              }}
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}
          {isUser ? message.text : <AnimatedReplyText text={message.text} />}
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">{message.timestamp}</span>
      </div>
    </motion.div>
  );
});