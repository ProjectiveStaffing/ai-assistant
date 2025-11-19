/**
 * Message handling utilities for different cases
 * Following BEST_PRACTICES.md: Functions < 40 lines, Single responsibility
 */

import type { PendingTask } from '../_types/PendingTask';
import { seemsLikeDateResponse } from './taskValidation';
import { generateTaskResponseMessage } from './taskMessageProcessor';

/**
 * Handles completion of pending task with date
 */
export function handlePendingTaskCompletion(
  message: string,
  pendingTask: PendingTask,
  addTaskWithRelationships: (
    taskName: string,
    peopleInvolved: string[],
    taskCategory: string,
    dateToPerform: string,
    itemType: string,
    assignedTo: string
  ) => { action: 'created' | 'updated' | 'kept_existing'; taskName: string; similarity?: number }
): { shouldContinue: boolean; responseText?: string } {
  // Check if message seems like a date response
  if (!seemsLikeDateResponse(message) || !pendingTask.missingFields.includes('dateToPerform')) {
    return { shouldContinue: true };
  }

  // Create task with provided date
  const result = addTaskWithRelationships(
    pendingTask.taskName,
    pendingTask.peopleInvolved,
    pendingTask.taskCategory,
    message,
    pendingTask.itemType,
    pendingTask.assignedTo
  );

  const responseText = generateTaskResponseMessage(result, pendingTask);

  return { shouldContinue: false, responseText };
}

/**
 * Creates pending task object from extracted data
 */
export function createPendingTaskObject(
  taskName: string,
  peopleInvolved: string[],
  taskCategory: string,
  dateToPerform: string,
  itemType: string,
  assignedTo: string,
  missingFields: ('dateToPerform' | 'assignedTo')[],
  originalMessage: string
): PendingTask {
  return {
    taskName,
    peopleInvolved,
    taskCategory,
    dateToPerform,
    itemType,
    assignedTo,
    missingFields,
    originalMessage,
  };
}
