import { AppState } from "./AppState";

export interface RemindersContextType {
  state: AppState;
  addReminder: (text: string, listId: string, notes?: string, dueDate?: string) => void;
  toggleReminderComplete: (reminderId: string) => void;
  addList: (name: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string) => void;
  selectList: (listId: string) => void;
  updateReminderCount: (listId: string, count: number) => void;
  addTaskWithRelationships: (
  taskName: string,
  relationships: string[],
  fecha?: string
) => void;
}