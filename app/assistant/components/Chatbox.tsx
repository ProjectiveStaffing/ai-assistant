'use client'
import React, { useState } from 'react';
import { Message } from '../_types/Message';
import { useReminders } from '../_hook/useReminders';
import { PlusIcon } from '../_icons/Plus';
import { ReminderItem } from './ReminderItem';

import {
    WRITING,
    GREETING,
    AZURE_ERROR_02,
    AZURE_ERROR_03,
} from '../../_constants/chatbot.cons';


type GPTResponse = {
    response?: TaskResponse;
    error?: string;
};

type TaskResponse = {
    taskName: string[];
    peopleInvolved: string[];
    taskCategory: string[];
    dateToPerform: string;
    modelResponse: string;
}

const ChatBox: React.FC = () => {
    const { state, addTaskWithRelationships } = useReminders();
    const [newReminderText, setNewReminderText] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);

    const selectedList = state.lists.find(list => list.id === state.selectedListId);

    const filteredReminders = state.reminders.filter(reminder => {
        if (state.selectedListId === 'all') {
            return true;
        }
        if (selectedList?.parentId === 'family' && reminder.relationships) {
            return reminder.relationships.includes(selectedList.name.toLowerCase());
        }
        if (state.selectedListId === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return reminder.dueDate === today;
        }
        if (state.selectedListId === 'scheduled') {
            const today = new Date().toISOString().split('T')[0];
            return reminder.dueDate && reminder.dueDate > today;
        }
        if (state.selectedListId === 'flagged') {
            return reminder.isFlagged;
        }
        return reminder.listId === state.selectedListId;
    });

    const completedReminders = filteredReminders.filter(r => r.isCompleted);
    const incompleteReminders = filteredReminders.filter(r => !r.isCompleted);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: GREETING, sender: 'bot' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (messageToSend: string = inputMessage) => {
        if (!messageToSend.trim()) return;

        const userMessage: Message = { id: Date.now(), text: messageToSend, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        const request = 'http://localhost:3002/openai/chat';
        try {
            const res = await fetch(request, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: messageToSend,
                }),
            });

            const data: GPTResponse = await res.json();
            addTaskWithRelationships(data.response?.taskName[0] || '', data.response?.peopleInvolved || [], data.response?.dateToPerform);
            const botMessage: Message = { id: Date.now() + 1, text: data.response?.modelResponse || '', sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (ex) {
            console.error(AZURE_ERROR_02, ex);
            const errorMessage: Message = { id: Date.now() + 1, text: AZURE_ERROR_03, sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 bg-gray-900 p-8 overflow-y-auto">

                {completedReminders.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center text-gray-400 mb-2">
                            <span className="text-sm">{completedReminders.length} Completed</span>
                            <button
                                className="text-blue-500 text-sm hover:underline"
                                onClick={() => setShowCompleted(!showCompleted)}
                            >
                                {showCompleted ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showCompleted && (
                            <div className="bg-gray-800 rounded-lg p-2">
                                {completedReminders.map(reminder => (
                                    <ReminderItem key={reminder.id} reminder={reminder} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                        <PlusIcon className="h-5 w-5 text-gray-500 mr-3" />
                        <input
                            type="text"
                            placeholder="New Reminder"
                            className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500"
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="text-blue-500 text-sm py-1 px-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200">
                            +
                        </button>
                    </div>
                    {incompleteReminders.map(reminder => (
                        <ReminderItem key={reminder.id} reminder={reminder} />
                    ))}
                </div>
            </div>

            {/* Sección del chatbot abajo */}
            <div className="bg-gray-900 p-8 flex flex-col justify-end border-t border-gray-700 max-chatbox">
                <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800 rounded-lg">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
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

                <div className="flex items-center">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-700 text-white rounded-full py-3 px-6 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-500"
                        disabled={isLoading || !inputMessage.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
