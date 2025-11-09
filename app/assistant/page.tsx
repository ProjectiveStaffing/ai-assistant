'use client'
import React, { useState } from 'react';
import { RemindersProvider } from './_context/RemindersContext';
import { Sidebar } from './components/Sidebar';
import ChatBox from './components/Chatbox';
import RemindersSection from './components/RemindersSection';

export default function App() {
  const [activeView, setActiveView] = useState<'chat' | 'reminders'>('chat');

  return (
    <RemindersProvider>
      <div className="min-h-screen bg-gray-900 font-inter">
        <div className="flex flex-col md:flex-row w-full h-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-64 lg:w-72 xl:w-80 bg-gray-700">
            <Sidebar onListClick={() => setActiveView('reminders')} />
          </div>

          {/* Área central */}
          <div className="flex-1 relative">
            {activeView === 'chat' && <ChatBox showReminders={false} onCloseReminders={function (): void {
              throw new Error('Function not implemented.');
            } } />}
            {activeView === 'reminders' && (
              <RemindersSection onClose={() => setActiveView('chat')} />
            )}
          </div>
        </div>
      </div>
    </RemindersProvider>
  );
}
