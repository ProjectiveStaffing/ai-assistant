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
    return `✏️ He actualizado la tarea existente "${result.taskName}" con la nueva información (similitud: ${similarityPercent}%).`;
  }

  if (result.action === 'kept_existing') {
    return `🛡️ Ya tienes una tarea similar "${result.taskName}" con más información. He mantenido la versión más completa (similitud: ${similarityPercent}%).`;
  }

  // Created
  if (pendingTask) {
    const itemTypeES = getItemTypeInSpanish(pendingTask.itemType);
    return `✅ Perfecto, ${itemTypeES} creada: "${pendingTask.taskName}".`;
  }

  return `✅ ${modelResponse || 'Tarea creada exitosamente.'}`;
}

/**
 * Translates item type to Spanish
 */
function getItemTypeInSpanish(itemType: string): string {
  const translations: Record<string, string> = {
    task: 'tarea',
    project: 'proyecto',
    habit: 'hábito',
  };

  return translations[itemType.toLowerCase()] || 'tarea';
}

/**
 * Fetches task data from Azure API
 */
export async function fetchTaskFromAPI(
  message: string
): Promise<GPTResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_PROD || 'http://localhost:8080';
  const response = await fetch(`${apiUrl}/youtask/api/v0/task`, {
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
