'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../_types/Message';
import { WRITING } from '../../_constants/chatbot.cons';
import MicrophoneIcon from '../_icons/MicrophoneIcon';
import { useSpeechRecognition } from '../_hook/useSpeechRecognition';

interface ChatSectionProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ messages, isLoading, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showVoiceError, setShowVoiceError] = useState(false);

  // Hook de reconocimiento de voz
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error: voiceError
  } = useSpeechRecognition({
    onResult: (transcript) => {
      setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      setShowVoiceError(true);
      setTimeout(() => setShowVoiceError(false), 3000);
    },
    continuous: true,
    language: 'es-ES'
  });

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

  const handleMicrophoneClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-gray-900 p-8 flex flex-col justify-end border-t border-gray-700 h-full relative">
      {/* Indicador de grabación */}
      {isListening && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-10 animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
          <span className="font-medium">Escuchando...</span>
        </div>
      )}

      {/* Mensaje de error */}
      {showVoiceError && voiceError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-10 max-w-md text-center">
          <p className="font-medium">{voiceError}</p>
        </div>
      )}

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

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe o dicta un mensaje..."
            className="w-full bg-gray-700 text-white rounded-3xl py-3 px-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none overflow-y-auto text-sm md:text-base"
            disabled={isLoading || isListening}
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '200px'
            }}
            title="Enter para enviar, Shift+Enter para nueva línea"
          />

          {/* Botón de micrófono dentro del textarea */}
          {isSupported && (
            <button
              onClick={handleMicrophoneClick}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              disabled={isLoading}
              title={isListening ? 'Detener grabación' : 'Iniciar dictado por voz'}
            >
              <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-white' : 'text-gray-300'}`} />
            </button>
          )}
        </div>

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
