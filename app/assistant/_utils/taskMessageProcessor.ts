/**
 * Task message processing utilities
 * Following BEST_PRACTICES.md: Functions < 40 lines, Type safety
 */

import type { PendingTask } from '../_types/PendingTask';
import type { GPTResponse } from '../_types/GTPResponse';

/**
 * Generates response message based on task action result
 */
export function generateTaskResponseMessage(
  result: { action: 'created' | 'updated' | 'kept_existing'; taskName: string; similarity?: number },
  pendingTask: PendingTask | null,
  modelResponse?: string
): string {
  const similarityPercent = Math.round((result.similarity || 0) * 100);

  if (result.action === 'updated') {
    return `✏️ I've updated the existing task "${result.taskName}" with new information (similarity: ${similarityPercent}%).`;
  }

  if (result.action === 'kept_existing') {
    return `🛡️ You already have a similar task "${result.taskName}" with more information. I've kept the more complete version (similarity: ${similarityPercent}%).`;
  }

  // Created
  if (pendingTask) {
    const itemType = getItemTypeName(pendingTask.itemType);
    return `✅ Perfect, ${itemType} created: "${pendingTask.taskName}".`;
  }

  return `✅ ${modelResponse || 'Task created successfully.'}`;
}

/**
 * Gets friendly name for item type
 */
function getItemTypeName(itemType: string): string {
  const translations: Record<string, string> = {
    task: 'task',
    project: 'project',
    habit: 'habit',
  };

  return translations[itemType.toLowerCase()] || 'task';
}

/**
 * Fetches task data from Azure API
 */
export async function fetchTaskFromAPI(
  message: string
): Promise<GPTResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_PROD || 'https://go-youtask.vercel.app';
  const response = await fetch(`${apiUrl}/api/task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Extracts task data from GPT response
 */
export function extractTaskData(data: GPTResponse) {
  const { taskName, peopleInvolved, taskCategory, dateToPerform, itemType, assignedTo } =
    data.response;

  return {
    taskName: taskName[0],
    peopleInvolved,
    taskCategory: taskCategory[0],
    dateToPerform,
    itemType: itemType[0],
    assignedTo,
  };
}
