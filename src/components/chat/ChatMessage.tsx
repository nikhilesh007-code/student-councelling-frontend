import React from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm
          ${
            isUser
              ? 'bg-[#00a878] text-white rounded-tr-none'
              : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
          }`}
        >
          {message.text}
        </div>
        <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
});
