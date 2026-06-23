import React from 'react';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 ${
        isOpen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-[#00a878] hover:bg-[#008b63]'
      } text-white`}
      style={{ width: '60px', height: '60px' }}
      aria-label="Toggle AI Assistant Chat"
    >
      <span
        className="material-symbols-outlined absolute transition-all duration-300"
        style={{
          fontSize: '28px',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
          fontVariationSettings: "'FILL' 1"
        }}
      >
        psychology
      </span>
      <span
        className="material-symbols-outlined absolute transition-all duration-300"
        style={{
          fontSize: '28px',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
        }}
      >
        close
      </span>
    </button>
  );
};
