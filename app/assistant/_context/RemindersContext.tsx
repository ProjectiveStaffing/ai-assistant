'use client'
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { RemindersContextType } from "../_types/RemindersContextType";
import { AppState } from "../_types/AppState";
import { ReminderList } from "../_types/ReminderList";
import { ListIcon } from "../_icons/ListIcon";
import { Reminder } from "../_types/Reminder";

export const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {

    const initialLists: ReminderList[] = [
      { id: 'all', name: 'All', icon: ListIcon, color: 'text-gray-400', count: 0 },
      { id: 'tasks', name: 'Tasks', icon: ListIcon, color: 'text-blue-400', count: 0, parentId: 'task' },
      { id: 'projects', name: 'Projects', icon: ListIcon, color: 'text-purple-400', count: 0, parentId: 'project' },
      { id: 'habits', name: 'Habits', icon: ListIcon, color: 'text-green-400', count: 0, parentId: 'habit' },
    ];

    const initialReminders: Reminder[] = [];

    const calculatedLists = initialLists.map(list => {
      if (list.id === 'all') {
        return { ...list, count: initialReminders.length };
      }
      return { ...list, count: initialReminders.filter(r => r.listId === list.id && !r.isCompleted).length };
    });

    return {
      lists: calculatedLists,
      reminders: initialReminders,
      selectedListId: 'all', 
    };
  });

  const updateReminderCounts = (currentReminders: Reminder[]) => {
    setState(prevState => {
      const updatedLists = prevState.lists.map(list => {
        let count = 0;
        if (list.id === 'all') {
          count = currentReminders.filter(r => !r.isCompleted).length;
        } else if (list.id === 'today') {
          const today = new Date().toISOString().split('T')[0];
          count = currentReminders.filter(r => r.dueDate === today && !r.isCompleted).length;
        } else if (list.id === 'scheduled') {
          const today = new Date().toISOString().split('T')[0];
          count = currentReminders.filter(r => r.dueDate && r.dueDate > today && !r.isCompleted).length;
        } else if (list.id === 'flagged') {
          count = currentReminders.filter(r => r.isFlagged && !r.isCompleted).length;
        } else if (list.id === 'family') { // 👈🏽 Lógica para el contador de Family
          const familyLists = prevState.lists.filter(l => l.parentId === 'family');
          const familyReminders = currentReminders.filter(r => familyLists.some(fl => r.relationships?.includes(fl.name)));
          count = familyReminders.length;
        } else if (list.id === 'tasks') {
          count = currentReminders.filter(r =>
            r.itemType?.toLowerCase() === 'task' && !r.isCompleted
          ).length;
        } else if (list.id === 'projects') {
          count = currentReminders.filter(r =>
            r.itemType?.toLowerCase() === 'project' && !r.isCompleted
          ).length;
        } else if (list.id === 'habits') {
          count = currentReminders.filter(r =>
            r.itemType?.toLowerCase() === 'habit' && !r.isCompleted
          ).length;
        }
        else {
          count = currentReminders.filter(r => r.relationships?.includes(list.name) && !r.isCompleted).length;
        }
        return { ...list, count };
      });
      return { ...prevState, lists: updatedLists };
    });
  };

  useEffect(() => {
    updateReminderCounts(state.reminders);
  }, [state.reminders]);


  const addReminder = (text: string, listId: string, notes?: string, dueDate?: string) => {
    const newReminder: Reminder = {
      id: String(Date.now()),
      text,
      isCompleted: false,
      listId,
      notes,
      dueDate,
      isFlagged: false,
      assignedTo: "",
      itemType: ""
    };
    setState(prevState => ({
      ...prevState,
      reminders: [...prevState.reminders, newReminder],
    }));
  };

  const toggleReminderComplete = (reminderId: string) => {
    setState(prevState => ({
      ...prevState,
      reminders: prevState.reminders.map(r =>
        r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r
      ),
    }));
  };

  const addList = (name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string) => {
    const newList: ReminderList = {
      id: String(Date.now()),
      name,
      icon,
      color,
      count: 0, // Nueva lista empieza con 0 recordatorios
    };
    setState(prevState => ({
      ...prevState,
      lists: [...prevState.lists, newList],
    }));
  };

  const selectList = (listId: string) => {
    setState(prevState => ({
      ...prevState,
      selectedListId: listId,
    }));
  };

  const updateReminderCount = (listId: string, count: number) => {
    setState(prevState => ({
      ...prevState,
      lists: prevState.lists.map(list =>
        list.id === listId ? { ...list, count } : list
      ),
    }));
  };

  const addTaskWithRelationships = (
    taskName: string,
    peopleInvolved: string[],
    taskCategory: string,
    dateToPerform: string,
    itemType: string,
    assignedTo: string
  ) => {
    setState(prevState => {
      const updatedLists = [...prevState.lists];
      const updatedReminders = [...prevState.reminders];

      const familyList = updatedLists.find(list => list.id === 'family');
      const defaultListId = familyList ? familyList.id : 'all';
      
      const existingReminder = updatedReminders.find(r =>
        r.text === taskName && r.listId === defaultListId
      );

      if (!existingReminder) {
        const newReminder: Reminder = {
          id: String(Date.now() + Math.random()),
          text: taskName,
          isCompleted: false,
          listId: defaultListId,
          dueDate: dateToPerform || undefined,
          isFlagged: false,
          relationships: peopleInvolved,
          itemType,
          assignedTo
        };
        updatedReminders.push(newReminder);
      }
        const existingList = updatedLists.find(
          list => list.name.toLowerCase() === assignedTo.toLowerCase()
        );
        if (!existingList) {
          const newList: ReminderList = {
            id: String(Date.now() + Math.random()),
            name: assignedTo,
            icon: ListIcon,
            color: "text-green-400",
            count: 0,
            parentId: itemType?.toLowerCase() // Agrupar por tipo: task, project, habit
          };
          updatedLists.push(newList);
        }

      return {
        ...prevState,
        lists: updatedLists,
        reminders: updatedReminders
      };
    });
  };


  return (
    <RemindersContext.Provider value={{
      state,
      addReminder,
      toggleReminderComplete,
      addList,
      selectList,
      updateReminderCount,
      addTaskWithRelationships
    }}>
      {children}
    </RemindersContext.Provider>
  );
};
