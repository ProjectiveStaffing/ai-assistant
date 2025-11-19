/**
 * Task operations utilities
 * Following BEST_PRACTICES.md: Function size < 40 lines, Type safety
 */

import type { Reminder } from '../_types/Reminder';
import type { ReminderList } from '../_types/ReminderList';
import { findSimilarTask, mergeTaskData } from './taskComparison';
import { ListIcon } from '../_icons/ListIcon';

export interface TaskData {
  taskName: string;
  peopleInvolved: string[];
  taskCategory: string;
  dateToPerform: string;
  itemType: string;
  assignedTo: string;
}

export interface TaskOperationResult {
  action: 'created' | 'updated' | 'kept_existing';
  taskName: string;
  similarity?: number;
  reminders: Reminder[];
  lists: ReminderList[];
}

/**
 * Creates or updates a task with relationships
 */
export function processTaskWithRelationships(
  taskData: TaskData,
  currentReminders: Reminder[],
  currentLists: ReminderList[]
): TaskOperationResult {
  const { taskName, itemType, assignedTo } = taskData;

  // Check for similar task
  const similarTaskResult = checkForSimilarTask(
    { text: taskName, assignedTo, itemType },
    currentReminders
  );

  if (similarTaskResult.found) {
    return handleSimilarTask(
      similarTaskResult,
      taskData,
      currentReminders,
      currentLists
    );
  }

  // Create new task
  return createNewTask(taskData, currentReminders, currentLists);
}

/**
 * Checks if a similar task exists
 */
function checkForSimilarTask(
  newTaskData: { text: string; assignedTo: string; itemType: string },
  reminders: Reminder[]
): {
  found: boolean;
  index: number;
  task: Reminder | null;
  similarity: number;
} {
  const { index, task, similarity } = findSimilarTask(
    newTaskData,
    reminders,
    0.85
  );

  return {
    found: task !== null && index !== -1,
    index,
    task,
    similarity,
  };
}

/**
 * Handles update or merge of similar task
 */
function handleSimilarTask(
  similarResult: ReturnType<typeof checkForSimilarTask>,
  taskData: TaskData,
  reminders: Reminder[],
  lists: ReminderList[]
): TaskOperationResult {
  const { task, index, similarity } = similarResult;

  if (!task) {
    return createNewTask(taskData, reminders, lists);
  }

  const mergeResult = mergeTaskData(task, taskData);
  const updatedReminders = [...reminders];

  if (mergeResult.shouldUpdate) {
    // Update with more complete data
    updatedReminders[index] = {
      ...task,
      ...mergeResult.updates,
    };

    const updatedLists = createRelationshipLists(
      taskData.peopleInvolved,
      taskData.taskCategory,
      taskData.itemType,
      lists
    );

    return {
      action: 'updated',
      taskName: task.text,
      similarity,
      reminders: updatedReminders,
      lists: updatedLists,
    };
  }

  // Keep existing (it has more info)
  return {
    action: 'kept_existing',
    taskName: task.text,
    similarity,
    reminders: updatedReminders,
    lists,
  };
}

/**
 * Creates a new task with relationships
 */
function createNewTask(
  taskData: TaskData,
  reminders: Reminder[],
  lists: ReminderList[]
): TaskOperationResult {
  const { taskName, peopleInvolved, taskCategory, dateToPerform, itemType, assignedTo } = taskData;

  const defaultListId = lists.find(l => l.id === 'family')?.id || 'all';

  const newReminder: Reminder = {
    id: String(Date.now()),
    text: taskName,
    isCompleted: false,
    listId: defaultListId,
    dueDate: dateToPerform,
    relationships: [...peopleInvolved, taskCategory].filter(Boolean),
    notes: '',
    isFlagged: false,
    itemType: itemType,
    assignedTo: assignedTo,
  };

  const updatedLists = createRelationshipLists(
    peopleInvolved,
    taskCategory,
    itemType,
    lists
  );

  return {
    action: 'created',
    taskName,
    reminders: [...reminders, newReminder],
    lists: updatedLists,
  };
}

/**
 * Creates lists for relationships if they don't exist
 */
function createRelationshipLists(
  peopleInvolved: string[],
  taskCategory: string,
  itemType: string,
  currentLists: ReminderList[]
): ReminderList[] {
  const updatedLists = [...currentLists];
  const relationships = [...peopleInvolved, taskCategory].filter(Boolean);

  relationships.forEach(relationship => {
    const exists = updatedLists.some(list => list.name === relationship);

    if (!exists) {
      const parentId = determineParentId(relationship, itemType);

      updatedLists.push({
        id: String(Date.now() + Math.random()),
        name: relationship,
        icon: ListIcon,
        color: getColorForRelationship(relationship),
        count: 0,
        parentId,
      });
    }
  });

  return updatedLists;
}

/**
 * Determines parent ID for a relationship
 */
function determineParentId(relationship: string, itemType: string): string {
  const lowerRelationship = relationship.toLowerCase();
  const lowerItemType = itemType.toLowerCase();

  if (lowerItemType === 'task') return 'task';
  if (lowerItemType === 'project') return 'project';
  if (lowerItemType === 'habit') return 'habit';

  // Family relationships
  const familyKeywords = ['family', 'familia', 'mom', 'dad', 'sister', 'brother'];
  if (familyKeywords.some(keyword => lowerRelationship.includes(keyword))) {
    return 'family';
  }

  return 'all';
}

/**
 * Gets color for relationship type
 */
function getColorForRelationship(relationship: string): string {
  const hash = relationship.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colors = [
    'text-blue-400',
    'text-green-400',
    'text-yellow-400',
    'text-purple-400',
    'text-pink-400',
    'text-indigo-400',
  ];

  return colors[Math.abs(hash) % colors.length];
}
