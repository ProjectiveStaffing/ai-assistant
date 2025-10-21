import { Reminder } from "./Reminder";
import { ReminderList } from "./ReminderList";

export interface AppState {
  lists: ReminderList[];
  reminders: Reminder[];
  selectedListId: string | null;
}