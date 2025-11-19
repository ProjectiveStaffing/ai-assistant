import { useContext } from "react";
import { RemindersContext } from "../_context/RemindersContext";

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};