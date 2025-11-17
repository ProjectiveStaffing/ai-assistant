import { AppState } from "./AppState";
import { Reminder } from "./Reminder";

export interface RemindersContextType {
  state: AppState;
  addReminder: (text: string, listId: string, notes?: string, dueDate?: string) => void;
  toggleReminderComplete: (reminderId: string) => void;
  addList: (name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string) => void;
  selectList: (listId: string) => void;
  updateReminderCount: (listId: string, count: number) => void;
  updateTask: (taskId: string, updates: Partial<Reminder>) => void;
  addTaskWithRelationships: (
    taskName: string,
    peopleInvolved: string[],
    taskCategory: string,
    dateToPerform: string,
    itemType: string,
    assignedTo: string
  ) => { action: 'created' | 'updated'; taskName: string; similarity?: number };
}