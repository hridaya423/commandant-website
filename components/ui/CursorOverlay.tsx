'use client';

import { useEffect, useState, useRef } from 'react';

interface CursorPosition {
  username: string;
  position: number;
  color: string;
  timestamp: number;
}

interface CursorOverlayProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  cursors: CursorPosition[];
  code: string;
}

const getUserColor = (username: string): string => {
  const colors = [
    '#FF6B6B', 
    '#4ECDC4', 
    '#45B7D1', 
    '#FFA07A', 
    '#98D8C8',
    '#F7DC6F', 
    '#BB8FCE', 
    '#85C1E9', 
    '#F8C471', 
    '#82E0AA', 
    '#FF9F43', 
    '#00D2D3', 
    '#FF6348',
    '#2ED573', 
    '#5352ED',
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export default function CursorOverlay({ textareaRef, cursors, code }: CursorOverlayProps) {
  const [cursorPositions, setCursorPositions] = useState<{ [username: string]: { top: number; left: number } }>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const getTextMetrics = (text: string, position: number) => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    
    const textToCursor = text.substring(0, position);
    const lines = textToCursor.split('\n');
    const lineNumber = lines.length - 1;
    const columnNumber = lines[lines.length - 1].length;
    
    const charWidth = 7.2; 
    const lineHeight = 20;
    
    const top = lineNumber * lineHeight + 4; 
    const left = columnNumber * charWidth + 4;
    
    return { top, left };
  };

  useEffect(() => {
    const updateCursorPositions = () => {
      const newPositions: { [username: string]: { top: number; left: number } } = {};
      
      console.log('Updating cursor positions for:', cursors);
      
      cursors.forEach(cursor => {
        const { top, left } = getTextMetrics(code, cursor.position);
        newPositions[cursor.username] = { top, left };
        console.log(`Cursor for ${cursor.username} at position ${cursor.position} -> (${top}, ${left})`);
      });
      
      setCursorPositions(newPositions);
    };

    updateCursorPositions();
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', updateCursorPositions);
      return () => textarea.removeEventListener('scroll', updateCursorPositions);
    }
  }, [cursors, code, textareaRef]);

  if (!textareaRef.current) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none border-2 border-red-500"
      style={{
        top: textareaRef.current.offsetTop,
        left: textareaRef.current.offsetLeft,
        width: textareaRef.current.offsetWidth,
        height: textareaRef.current.offsetHeight,
      }}
    >
      {cursors.map(cursor => {
        const position = cursorPositions[cursor.username];
        if (!position) return null;

        return (
          <div
            key={cursor.username}
            className="absolute transition-all duration-200 ease-out"
            style={{
              top: position.top,
              left: position.left,
              transform: 'translateX(-1px)',
            }}
          >
            <div
              className="w-0.5 h-5 animate-pulse shadow-lg"
              style={{
                backgroundColor: getUserColor(cursor.username),
                boxShadow: `0 0 6px ${getUserColor(cursor.username)}, 0 0 12px ${getUserColor(cursor.username)}40`,
              }}
            />
            
            <div
              className="absolute -top-7 left-0 px-2 py-1 text-xs font-mono rounded-md whitespace-nowrap shadow-lg border"
              style={{
                backgroundColor: getUserColor(cursor.username),
                color: '#1A1A1A',
                transform: 'translateX(-50%)',
                borderColor: getUserColor(cursor.username),
                boxShadow: `0 2px 8px ${getUserColor(cursor.username)}40`,
              }}
            >
              {cursor.username}
            </div>
          </div>
        );
      })}
    </div>
  );
}