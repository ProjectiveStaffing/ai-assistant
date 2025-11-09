import React from 'react';
import { ReminderItem } from './ReminderItem';
import { useReminders } from '../_hook/useReminders';

interface RemindersSectionProps {
  onClose: () => void;
}

const RemindersSection: React.FC<RemindersSectionProps> = ({ onClose }) => {
  const { state } = useReminders();
  const reminders = state.reminders.filter(r => !r.isCompleted);

  return (
    <div className="flex flex-col h-full bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Reminders</h2>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition"
        >
          Cerrar
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto">
        {reminders.map(reminder => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </div>
  );
};

export default RemindersSection;
