'use client'
import React, { useState } from "react";
import { useReminders } from "../_hook/useReminders";
import { PlusIcon } from "../_icons/Plus";
import { ReminderItem } from "./ReminderItem";

// Componente del contenido principal
export const MainContent: React.FC = () => {
  const { state, addReminder } = useReminders();
  const [newReminderText, setNewReminderText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Obtener la lista seleccionada
  const selectedList = state.lists.find(list => list.id === state.selectedListId);
  const listName = selectedList ? selectedList.name : 'All';

  // Filtrar recordatorios según la lista seleccionada
  const filteredReminders = state.reminders.filter(reminder => {
    if (state.selectedListId === 'all') return true;
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

  const handleAddReminder = () => {
    if (newReminderText.trim() && state.selectedListId) {
      // Si la lista seleccionada es una categoría especial, añadirla a una lista por defecto o la primera lista personalizada
      const targetListId = ['all', 'today', 'scheduled', 'flagged'].includes(state.selectedListId)
        ? state.lists.find(l => !['all', 'today', 'scheduled', 'flagged'].includes(l.id))?.id || 'home' // Fallback a 'home' o la primera lista real
        : state.selectedListId;
      addReminder(newReminderText, targetListId);
      setNewReminderText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddReminder();
    }
  };

  return (
    <main className="flex-1 bg-gray-900 p-8 h-screen overflow-y-auto rounded-r-xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-white text-4xl font-bold">{listName}</h1>
        <button className="text-blue-500 text-lg font-semibold flex items-center">
          <PlusIcon className="h-6 w-6 mr-1" />
          New Reminder
        </button>
      </div>

      {/* Sección de completados */}
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

      {/* Sección de recordatorios incompletos */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        {/* Input para añadir nuevo recordatorio */}
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
            Add DateX
          </button>
        </div>
        {incompleteReminders.map(reminder => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </main>
  );
};