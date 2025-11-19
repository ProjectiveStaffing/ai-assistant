'use client';

/**
 * Reminders Context
 * Following BEST_PRACTICES.md:
 * - Component size < 250 lines
 * - Organized imports
 * - Separated concerns (counters and operations extracted)
 * - No console.logs in production
 */

// External libraries
import React, { createContext, ReactNode, useEffect, useState, useMemo } from 'react';

// Types
import type { RemindersContextType } from '../_types/RemindersContextType';
import type { AppState } from '../_types/AppState';
import type { ReminderList } from '../_types/ReminderList';
import type { Reminder } from '../_types/Reminder';

// Icons
import { ListIcon } from '../_icons/ListIcon';

// Utilities
import { updateListCounts } from '../_utils/listCounters';
import { processTaskWithRelationships, type TaskData } from '../_utils/taskOperations';

export const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

const initialLists: ReminderList[] = [
  { id: 'all', name: 'All', icon: ListIcon, color: 'text-gray-400', count: 0 },
  { id: 'tasks', name: 'Tasks', icon: ListIcon, color: 'text-blue-400', count: 0, parentId: 'task' },
  { id: 'projects', name: 'Projects', icon: ListIcon, color: 'text-purple-400', count: 0, parentId: 'project' },
  { id: 'habits', name: 'Habits', icon: ListIcon, color: 'text-green-400', count: 0, parentId: 'habit' },
];

const initialState: AppState = {
  lists: initialLists,
  reminders: [],
  selectedListId: 'all',
};

export const RemindersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  // Update list counts when reminders change
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      lists: updateListCounts(prevState.lists, prevState.reminders),
    }));
  }, [state.reminders]);

  // Add reminder
  const addReminder = (
    text: string,
    listId: string,
    notes?: string,
    dueDate?: string
  ): void => {
    const newReminder: Reminder = {
      id: String(Date.now()),
      text,
      isCompleted: false,
      listId,
      notes,
      dueDate,
      isFlagged: false,
      assignedTo: '',
      itemType: '',
    };

    setState(prevState => ({
      ...prevState,
      reminders: [...prevState.reminders, newReminder],
    }));
  };

  // Toggle reminder completion
  const toggleReminderComplete = (reminderId: string): void => {
    setState(prevState => ({
      ...prevState,
      reminders: prevState.reminders.map(r =>
        r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
      ),
    }));
  };

  // Add list
  const addList = (
    name: string,
    icon: React.FC<React.SVGProps<SVGSVGElement>>,
    color: string
  ): void => {
    const newList: ReminderList = {
      id: String(Date.now()),
      name,
      icon,
      color,
      count: 0,
    };

    setState(prevState => ({
      ...prevState,
      lists: [...prevState.lists, newList],
    }));
  };

  // Select list
  const selectList = (listId: string): void => {
    setState(prevState => ({
      ...prevState,
      selectedListId: listId,
    }));
  };

  // Update reminder count (legacy method, kept for compatibility)
  const updateReminderCount = (listId: string, count: number): void => {
    setState(prevState => ({
      ...prevState,
      lists: prevState.lists.map(list =>
        list.id === listId ? { ...list, count } : list
      ),
    }));
  };

  // Update task
  const updateTask = (taskId: string, updates: Partial<Reminder>): void => {
    setState(prevState => ({
      ...prevState,
      reminders: prevState.reminders.map(reminder =>
        reminder.id === taskId ? { ...reminder, ...updates } : reminder
      ),
    }));
  };

  // Add task with relationships (refactored)
  const addTaskWithRelationships = (
    taskName: string,
    peopleInvolved: string[],
    taskCategory: string,
    dateToPerform: string,
    itemType: string,
    assignedTo: string
  ): { action: 'created' | 'updated' | 'kept_existing'; taskName: string; similarity?: number } => {
    const taskData: TaskData = {
      taskName,
      peopleInvolved,
      taskCategory,
      dateToPerform,
      itemType,
      assignedTo,
    };

    let result: { action: 'created' | 'updated' | 'kept_existing'; taskName: string; similarity?: number } = {
      action: 'created',
      taskName,
    };

    setState(prevState => {
      const operationResult = processTaskWithRelationships(
        taskData,
        prevState.reminders,
        prevState.lists
      );

      result = {
        action: operationResult.action,
        taskName: operationResult.taskName,
        similarity: operationResult.similarity,
      };

      return {
        ...prevState,
        reminders: operationResult.reminders,
        lists: operationResult.lists,
      };
    });

    return result;
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<RemindersContextType>(
    () => ({
      state,
      addReminder,
      toggleReminderComplete,
      addList,
      selectList,
      updateReminderCount,
      updateTask,
      addTaskWithRelationships,
    }),
    [state]
  );

  return (
    <RemindersContext.Provider value={value}>
      {children}
    </RemindersContext.Provider>
  );
};
