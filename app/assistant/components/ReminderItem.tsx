'use client'
import React from "react";
import { ReminderItemProps } from "../_types/ReminderItemProps";
import { useReminders } from "../_hook/useReminders";
import { FlagIcon } from "../_icons/FlagIcon";
import { InfoIcon } from "../_icons/InfoIcon";

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
  const { toggleReminderComplete } = useReminders();

  const handleCheckboxChange = () => {
    toggleReminderComplete(reminder.id);
  };

  return (
    <div className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-700 cursor-pointer">
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-blue-500 rounded-full border-gray-600 bg-gray-700 focus:ring-blue-500 mr-3"
        checked={reminder.isCompleted}
        onChange={handleCheckboxChange}
      />
      <span className={`flex-1 text-white text-lg ${reminder.isCompleted ? 'line-through text-gray-500' : ''}`}>
        {reminder.text}
      </span>
      {reminder.isFlagged && (
        <FlagIcon className="h-5 w-5 text-orange-500 ml-2" />
      )}
      <button className="ml-2 text-gray-400 hover:text-white">
        <InfoIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

