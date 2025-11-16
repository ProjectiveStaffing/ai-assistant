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
      <div className="h-screen bg-gray-900 font-inter flex flex-col">
        <div className="flex flex-1 flex-col md:flex-row bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-64 lg:w-72 xl:w-80 bg-gray-700">
            <Sidebar onListClick={() => setActiveView('reminders')} />
          </div>

          {/* Área central */}
          <div className="flex-1 relative flex h-full">
            {activeView === 'chat' && (
              <div className="w-full h-full">
                <ChatBox showReminders={false} onCloseReminders={function (): void {
                  throw new Error('Function not implemented.');
                } } />
              </div>
            )}
            {activeView === 'reminders' && (
              <div className="w-full h-full">
                <RemindersSection onClose={() => setActiveView('chat')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </RemindersProvider>
  );
}
