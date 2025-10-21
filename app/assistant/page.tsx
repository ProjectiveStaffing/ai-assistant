'use client'
import React from 'react';
import { RemindersProvider } from './_context/RemindersContext';
import { Sidebar } from './components/Sidebar';
import ChatBox from './components/Chatbox';

export default function App() {
  return (
    <RemindersProvider>
      <div className="min-h-screen bg-gray-900 font-inter">
        <div className="flex flex-col md:flex-row w-full h-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="w-full md:w-64 lg:w-72 xl:w-80 bg-gray-700">
            <Sidebar />
          </div>

          <div className="flex-1">
            <ChatBox />
          </div>

        </div>
      </div>
    </RemindersProvider>
  );
}
