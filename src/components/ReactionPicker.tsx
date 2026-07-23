import React, { useState, useEffect, useRef } from 'react';
import { SmilePlus } from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  position?: 'left' | 'right';
}

export function ReactionPicker({ onSelect, position = 'right' }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
      >
        <SmilePlus className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className={`absolute bottom-full mb-2 ${position === 'right' ? 'right-0' : 'left-0'} z-50 bg-[#1A1D2D] border border-white/10 rounded-2xl shadow-xl p-2 flex gap-1`}
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setIsOpen(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-xl transition-transform hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReactionDisplayProps {
  reactions?: Record<string, string[]>;
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function ReactionDisplay({ reactions, currentUserId, onToggle }: ReactionDisplayProps) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, users]) => {
        if (!users || users.length === 0) return null;
        const hasReacted = users.includes(currentUserId);
        
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs transition-colors border ${
              hasReacted 
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' 
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}
