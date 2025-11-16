import { useContext } from "react";
import { RemindersContext } from "../_context/RemindersContext";

export const useReminders = () => {
  const context = useContext(RemindersContext);
  console.log("context", context);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};