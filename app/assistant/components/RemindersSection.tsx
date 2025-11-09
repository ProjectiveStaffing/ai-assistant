'use client'
import React from 'react';
import { ReminderItem } from './ReminderItem';
import { useReminders } from '../_hook/useReminders';

const RemindersSection: React.FC = () => {
    const { state, addTaskWithRelationships } = useReminders();
    const selectedList = state.lists.find(list => list.id === state.selectedListId);

    const filteredReminders = state.reminders.filter(reminder => {
        if (state.selectedListId === 'all') return true;
        if (selectedList?.parentId === 'family' && reminder.relationships) {
            return reminder.relationships.includes(selectedList.name.toLowerCase());
        }
        return reminder.listId === state.selectedListId;
    });

    const incompleteReminders = filteredReminders.filter(r => !r.isCompleted);

    return (
        <div className="flex-1 bg-gray-900 p-8 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg p-4">
                {incompleteReminders.map(reminder => (
                    <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
            </div>
        </div>
    );
};

export default RemindersSection;
