import { Reminder } from '../_types/Reminder';

/**
 * Normalizes text for comparison
 * - Converts to lowercase
 * - Removes accents/diacritics
 * - Removes extra spaces
 * - Removes punctuation
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

/**
 * Calculates similarity between two texts using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  if (normalized1 === normalized2) return 1;

  const len1 = normalized1.length;
  const len2 = normalized2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // Deletion
        matrix[i][j - 1] + 1,     // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  const distance = matrix[len1][len2];
  return 1 - distance / maxLen;
};

/**
 * Checks if two tasks are similar based on multiple criteria
 */
export const areTasksSimilar = (
  task1: Pick<Reminder, 'text' | 'assignedTo' | 'itemType'>,
  task2: Pick<Reminder, 'text' | 'assignedTo' | 'itemType'>,
  threshold: number = 0.85
): boolean => {
  // 1. Check item type (task, project, habit)
  if (task1.itemType?.toLowerCase() !== task2.itemType?.toLowerCase()) {
    return false;
  }

  // 2. Calculate text similarity
  const textSimilarity = calculateTextSimilarity(task1.text, task2.text);

  // 3. If text similarity is high, consider them similar
  if (textSimilarity >= threshold) {
    return true;
  }

  // 4. Check if they have the same assignedTo and moderate similarity
  if (
    task1.assignedTo?.toLowerCase() === task2.assignedTo?.toLowerCase() &&
    textSimilarity >= 0.7
  ) {
    return true;
  }

  return false;
};

/**
 * Searches for a similar task in an array of reminders
 * Returns the index of the similar task or -1 if not found
 */
export const findSimilarTask = (
  newTask: Pick<Reminder, 'text' | 'assignedTo' | 'itemType'>,
  existingTasks: Reminder[],
  threshold: number = 0.85
): { index: number; task: Reminder | null; similarity: number } => {
  let bestMatch = -1;
  let bestSimilarity = 0;
  let bestTask: Reminder | null = null;

  for (let i = 0; i < existingTasks.length; i++) {
    const task = existingTasks[i];

    // Only compare with uncompleted tasks
    if (task.isCompleted) continue;

    const similarity = calculateTextSimilarity(newTask.text, task.text);

    if (similarity > bestSimilarity && areTasksSimilar(newTask, task, threshold)) {
      bestMatch = i;
      bestSimilarity = similarity;
      bestTask = task;
    }
  }

  return {
    index: bestMatch,
    task: bestTask,
    similarity: bestSimilarity
  };
};

/**
 * Calculates the "information level" of a task
 * Returns a score representing how much information it contains
 */
export const calculateInformationScore = (task: {
  text: string;
  dueDate?: string;
  assignedTo?: string;
  relationships?: string[];
  notes?: string;
}): number => {
  let score = 0;

  // Points for text length (more words = more details)
  const wordCount = task.text.trim().split(/\s+/).length;
  score += wordCount * 2; // 2 points per word

  // Points for having a date
  if (task.dueDate && task.dueDate !== '') {
    score += 15;

    // Extra points if it has specific time (e.g., "7pm", "19:00")
    const hasTime = /\d{1,2}:\d{2}|[ap]m|[AP]M|\d{1,2}\s*[ap]m/i.test(task.dueDate);
    if (hasTime) {
      score += 10;
    }
  }

  // Points for having an assigned person
  if (task.assignedTo && task.assignedTo !== '') {
    score += 8;
  }

  // Points for relationships (more people = more context)
  if (task.relationships && task.relationships.length > 0) {
    score += task.relationships.length * 5;
  }

  // Points for having notes
  if (task.notes && task.notes !== '') {
    score += task.notes.length * 0.5;
  }

  return score;
};

/**
 * Determines which task fields should be updated
 */
export const shouldUpdateField = (
  existingValue: string | undefined,
  newValue: string | undefined
): boolean => {
  // If new value is empty or undefined, keep existing
  if (!newValue || newValue === '') return false;

  // If existing value is empty, update with new
  if (!existingValue || existingValue === '') return true;

  // If they are different, update
  if (existingValue !== newValue) return true;

  return false;
};

/**
 * Checks if a date has specific time
 */
const hasTimeInDate = (date: string | undefined): boolean => {
  if (!date) return false;
  return /\d{1,2}:\d{2}|[ap]m/i.test(date);
};

/**
 * Determines if date field should be updated
 */
const shouldUpdateDateField = (
  existingDate: string | undefined,
  newDate: string | undefined
): boolean => {
  if (!shouldUpdateField(existingDate, newDate)) {
    return false;
  }

  const existingHasTime = hasTimeInDate(existingDate);
  const newHasTime = hasTimeInDate(newDate);

  // Only update if new has time and old doesn't, or if it's different
  return !existingDate || newHasTime >= existingHasTime;
};

/**
 * Updates text field if new version is more complete
 */
const updateTextField = (
  existingText: string,
  newText: string,
  updates: Partial<Reminder>
): boolean => {
  if (newText.length > existingText.length) {
    updates.text = newText;
    return true;
  }
  return false;
};

/**
 * Updates date field if necessary
 */
const updateDateField = (
  existingDate: string | undefined,
  newDate: string,
  updates: Partial<Reminder>
): boolean => {
  if (shouldUpdateDateField(existingDate, newDate)) {
    updates.dueDate = newDate;
    return true;
  }
  return false;
};

/**
 * Updates assignedTo field if necessary
 */
const updateAssignedToField = (
  existingAssignedTo: string | undefined,
  newAssignedTo: string,
  updates: Partial<Reminder>
): boolean => {
  if (shouldUpdateField(existingAssignedTo, newAssignedTo)) {
    updates.assignedTo = newAssignedTo;
    return true;
  }
  return false;
};

/**
 * Updates relationships by combining unique values
 */
const updateRelationships = (
  existingRelationships: string[] | undefined,
  newPeopleInvolved: string[],
  updates: Partial<Reminder>
): boolean => {
  if (!newPeopleInvolved || newPeopleInvolved.length === 0) {
    return false;
  }

  const existing = existingRelationships || [];
  const combined = Array.from(new Set([...existing, ...newPeopleInvolved]));

  if (combined.length !== existing.length) {
    updates.relationships = combined;
    return true;
  }

  return false;
};

/**
 * Marks task as incomplete if it was completed
 */
const markAsIncomplete = (
  isCompleted: boolean,
  updates: Partial<Reminder>
): boolean => {
  if (isCompleted) {
    updates.isCompleted = false;
    return true;
  }
  return false;
};

/**
 * Compares information scores and determines if should proceed
 */
const shouldProceedWithMerge = (
  existingScore: number,
  newScore: number
): { shouldProceed: boolean; reason: string } => {
  if (newScore < existingScore) {
    return {
      shouldProceed: false,
      reason: `Existing task has more information (${existingScore} vs ${newScore})`
    };
  }

  return {
    shouldProceed: true,
    reason: ''
  };
};

/**
 * Applies all necessary updates to the task
 */
const applyTaskUpdates = (
  existingTask: Reminder,
  newData: {
    taskName: string;
    peopleInvolved: string[];
    dateToPerform: string;
    assignedTo: string;
  },
  updates: Partial<Reminder>
): boolean => {
  let hasChanges = false;

  hasChanges = updateTextField(existingTask.text, newData.taskName, updates) || hasChanges;
  hasChanges = updateDateField(existingTask.dueDate, newData.dateToPerform, updates) || hasChanges;
  hasChanges = updateAssignedToField(existingTask.assignedTo, newData.assignedTo, updates) || hasChanges;
  hasChanges = updateRelationships(existingTask.relationships, newData.peopleInvolved, updates) || hasChanges;
  hasChanges = markAsIncomplete(existingTask.isCompleted, updates) || hasChanges;

  return hasChanges;
};

/**
 * Merges information from existing task with new information
 * ONLY updates if new task has MORE or EQUAL information
 */
export const mergeTaskData = (
  existingTask: Reminder,
  newData: {
    taskName: string;
    peopleInvolved: string[];
    taskCategory: string;
    dateToPerform: string;
    itemType: string;
    assignedTo: string;
  }
): { updates: Partial<Reminder>; shouldUpdate: boolean; reason: string } => {
  const updates: Partial<Reminder> = {};

  // Calculate information scores
  const existingScore = calculateInformationScore({
    text: existingTask.text,
    dueDate: existingTask.dueDate,
    assignedTo: existingTask.assignedTo,
    relationships: existingTask.relationships,
    notes: existingTask.notes
  });

  const newScore = calculateInformationScore({
    text: newData.taskName,
    dueDate: newData.dateToPerform,
    assignedTo: newData.assignedTo,
    relationships: newData.peopleInvolved,
    notes: undefined
  });

  // Check if should proceed with merge
  const { shouldProceed, reason: skipReason } = shouldProceedWithMerge(existingScore, newScore);

  if (!shouldProceed) {
    return {
      updates: {},
      shouldUpdate: false,
      reason: skipReason
    };
  }

  // Apply all updates
  const hasChanges = applyTaskUpdates(existingTask, newData, updates);

  return {
    updates,
    shouldUpdate: hasChanges,
    reason: hasChanges
      ? `Task updated with more information (${newScore} vs ${existingScore})`
      : 'No changes needed'
  };
};
