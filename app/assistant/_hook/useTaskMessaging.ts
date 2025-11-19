/**
 * Custom hook for task messaging logic
 * Following BEST_PRACTICES.md: Functions < 40 lines, Separation of concerns
 */

import { useState } from 'react';
import type { Message } from '../_types/Message';
import type { PendingTask } from '../_types/PendingTask';
import { GREETING } from '../../_constants/chatbot.cons';

interface UseTaskMessagingReturn {
  messages: Message[];
  pendingTask: PendingTask | null;
  isLoading: boolean;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  setPendingTask: (task: PendingTask | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useTaskMessaging(): UseTaskMessagingReturn {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: GREETING, sender: 'bot' },
  ]);
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addUserMessage = (text: string): void => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const addBotMessage = (text: string): void => {
    const botMessage: Message = {
      id: Date.now() + 1,
      text,
      sender: 'bot',
    };
    setMessages(prev => [...prev, botMessage]);
  };

  return {
    messages,
    pendingTask,
    isLoading,
    addUserMessage,
    addBotMessage,
    setPendingTask,
    setIsLoading,
  };
}
