export interface Reminder {
  id: string;
  text: string;
  isCompleted: boolean;
  dueDate?: string;
  notes?: string;
  listId: string;
  isFlagged: boolean;
  relationships?: string[]; //
}