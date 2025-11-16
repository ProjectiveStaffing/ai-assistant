'use client'
import React, { useState } from 'react';
import { Message } from '../_types/Message';
import { GPTResponse } from '../_types/GTPResponse';
import { useReminders } from '../_hook/useReminders';
import { AZURE_ERROR_02, AZURE_ERROR_03, GREETING, WRITING } from '../../_constants/chatbot.cons';

import RemindersSection from './RemindersSection';
import ChatSection from './ChatSection';

interface ChatBoxProps {
  showReminders: boolean;
  onCloseReminders: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ showReminders, onCloseReminders }) => {
  const { state, addTaskWithRelationships } = useReminders();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: GREETING, sender: 'bot' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    const userMessage: Message = { id: Date.now(), text: messageToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("useReminders:", state);
      const res = await fetch('http://localhost:8080/youtask/api/v0/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageToSend }),
      });

      const data: GPTResponse = await res.json();
      const { taskName, peopleInvolved, taskCategory, dateToPerform, itemType, assignedTo } = data.response;

      addTaskWithRelationships(taskName[0], peopleInvolved, taskCategory[0], dateToPerform, itemType[0], assignedTo);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.response?.modelResponse || '',
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (ex) {
      console.error(AZURE_ERROR_02, ex);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: AZURE_ERROR_03,
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {showReminders ? (
        <div className="relative flex-1">
          {/* Botón para volver al chat */}
          <button
            onClick={onCloseReminders}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
          >
            back
          </button>

          <RemindersSection onClose={function (): void {
                      throw new Error('Function not implemented.');
                  } } />
        </div>
      ) : (
        <ChatSection
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default ChatBox;
