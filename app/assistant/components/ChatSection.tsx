'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../_types/Message';
import { WRITING } from '../../_constants/chatbot.cons';

interface ChatSectionProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ messages, isLoading, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envía mensaje, Shift+Enter crea nueva línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        onSendMessage(inputMessage);
        setInputMessage('');
      }
    }
  };

  return (
    <div className="bg-gray-900 p-8 flex flex-col justify-end border-t border-gray-700 h-full">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg h-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg break-words whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="p-3 rounded-lg bg-gray-700 text-gray-200">
              {WRITING}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-700 text-white rounded-3xl py-3 px-6 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none overflow-y-auto text-sm md:text-base"
          disabled={isLoading}
          rows={1}
          style={{
            minHeight: '48px',
            maxHeight: '200px'
          }}
          title="Enter para enviar, Shift+Enter para nueva línea"
        />
        <button
          onClick={() => {
            if (inputMessage.trim()) {
              onSendMessage(inputMessage);
              setInputMessage('');
            }
          }}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-500 flex-shrink-0"
          disabled={isLoading || !inputMessage.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
