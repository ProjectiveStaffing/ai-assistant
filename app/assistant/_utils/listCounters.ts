/**
 * List counter utilities
 * Following BEST_PRACTICES.md: Single Responsibility, Function size < 40 lines
 */

import type { Reminder } from '../_types/Reminder';
import type { ReminderList } from '../_types/ReminderList';

/**
 * Calculates the count for a specific list type
 */
function calculateListCount(
  list: ReminderList,
  reminders: Reminder[],
  allLists: ReminderList[]
): number {
  const today = new Date().toISOString().split('T')[0];

  switch (list.id) {
    case 'all':
      return reminders.filter(r => !r.isCompleted).length;

    case 'today':
      return reminders.filter(
        r => r.dueDate === today && !r.isCompleted
      ).length;

    case 'scheduled':
      return reminders.filter(
        r => r.dueDate && r.dueDate > today && !r.isCompleted
      ).length;

    case 'flagged':
      return reminders.filter(
        r => r.isFlagged && !r.isCompleted
      ).length;

    case 'family':
      return calculateFamilyCount(reminders, allLists);

    case 'tasks':
      return calculateItemTypeCount(reminders, 'task');

    case 'projects':
      return calculateItemTypeCount(reminders, 'project');

    case 'habits':
      return calculateItemTypeCount(reminders, 'habit');

    default:
      return calculateRelationshipCount(reminders, list.name);
  }
}

/**
 * Calculates count for family-related lists
 */
function calculateFamilyCount(
  reminders: Reminder[],
  allLists: ReminderList[]
): number {
  const familyLists = allLists.filter(l => l.parentId === 'family');
  const familyReminders = reminders.filter(r =>
    familyLists.some(fl => r.relationships?.includes(fl.name))
  );
  return familyReminders.length;
}

/**
 * Calculates count for specific item types
 */
function calculateItemTypeCount(
  reminders: Reminder[],
  itemType: string
): number {
  return reminders.filter(
    r => r.itemType?.toLowerCase() === itemType && !r.isCompleted
  ).length;
}

/**
 * Calculates count based on relationships
 */
function calculateRelationshipCount(
  reminders: Reminder[],
  listName: string
): number {
  return reminders.filter(
    r => r.relationships?.includes(listName) && !r.isCompleted
  ).length;
}

/**
 * Updates counts for all lists
 */
export function updateListCounts(
  lists: ReminderList[],
  reminders: Reminder[]
): ReminderList[] {
  return lists.map(list => ({
    ...list,
    count: calculateListCount(list, reminders, lists),
  }));
}
