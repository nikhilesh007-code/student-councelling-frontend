import React from 'react';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <>
      <style>{`
        @keyframes dropIn {
          0% {
            transform: translateY(-500px);
            opacity: 0;
          }
          70% {
            transform: translateY(20px);
            opacity: 1;
          }
          85% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .chat-drop-in {
          animation: dropIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>
      <button
        onClick={onClick}
        className={`chat-drop-in fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 ${
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
    </>
  );
};
