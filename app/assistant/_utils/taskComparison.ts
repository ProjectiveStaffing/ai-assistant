import { Reminder } from '../_types/Reminder';

/**
 * Normaliza texto para comparación
 * - Convierte a minúsculas
 * - Elimina tildes/acentos
 * - Elimina espacios extras
 * - Elimina puntuación
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^\w\s]/g, '') // Elimina puntuación
    .replace(/\s+/g, ' ') // Normaliza espacios
    .trim();
};

/**
 * Calcula la similitud entre dos textos usando distancia de Levenshtein
 * Retorna un valor entre 0 (totalmente diferentes) y 1 (idénticos)
 */
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);

  if (normalized1 === normalized2) return 1;

  const len1 = normalized1.length;
  const len2 = normalized2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Distancia de Levenshtein
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
        matrix[i - 1][j] + 1,     // Eliminación
        matrix[i][j - 1] + 1,     // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  const distance = matrix[len1][len2];
  return 1 - distance / maxLen;
};

/**
 * Verifica si dos tareas son similares basándose en múltiples criterios
 */
export const areTasksSimilar = (
  task1: Pick<Reminder, 'text' | 'assignedTo' | 'itemType'>,
  task2: Pick<Reminder, 'text' | 'assignedTo' | 'itemType'>,
  threshold: number = 0.85
): boolean => {
  // 1. Verificar tipo de item (task, project, habit)
  if (task1.itemType?.toLowerCase() !== task2.itemType?.toLowerCase()) {
    return false;
  }

  // 2. Calcular similitud de texto
  const textSimilarity = calculateTextSimilarity(task1.text, task2.text);

  // 3. Si la similitud de texto es alta, considerarlas similares
  if (textSimilarity >= threshold) {
    return true;
  }

  // 4. Verificar si tienen el mismo assignedTo y similitud moderada
  if (
    task1.assignedTo?.toLowerCase() === task2.assignedTo?.toLowerCase() &&
    textSimilarity >= 0.7
  ) {
    return true;
  }

  return false;
};

/**
 * Busca una tarea similar en un array de recordatorios
 * Retorna el índice de la tarea similar o -1 si no encuentra
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

    // Solo comparar con tareas no completadas
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
 * Calcula el "nivel de información" de una tarea
 * Retorna un score que representa cuánta información contiene
 */
export const calculateInformationScore = (task: {
  text: string;
  dueDate?: string;
  assignedTo?: string;
  relationships?: string[];
  notes?: string;
}): number => {
  let score = 0;

  // Puntos por longitud del texto (más palabras = más detalles)
  const wordCount = task.text.trim().split(/\s+/).length;
  score += wordCount * 2; // 2 puntos por palabra

  // Puntos por tener fecha
  if (task.dueDate && task.dueDate !== '') {
    score += 15;

    // Puntos extra si tiene hora específica (ej: "7pm", "19:00")
    const hasTime = /\d{1,2}:\d{2}|[ap]m|[AP]M|\d{1,2}\s*[ap]m/i.test(task.dueDate);
    if (hasTime) {
      score += 10;
    }
  }

  // Puntos por tener persona asignada
  if (task.assignedTo && task.assignedTo !== '') {
    score += 8;
  }

  // Puntos por relationships (más personas = más contexto)
  if (task.relationships && task.relationships.length > 0) {
    score += task.relationships.length * 5;
  }

  // Puntos por tener notas
  if (task.notes && task.notes !== '') {
    score += task.notes.length * 0.5;
  }

  return score;
};

/**
 * Determina qué campos de la tarea deben actualizarse
 */
export const shouldUpdateField = (
  existingValue: string | undefined,
  newValue: string | undefined
): boolean => {
  // Si el nuevo valor está vacío o indefinido, mantener el existente
  if (!newValue || newValue === '') return false;

  // Si el valor existente está vacío, actualizar con el nuevo
  if (!existingValue || existingValue === '') return true;

  // Si son diferentes, actualizar
  if (existingValue !== newValue) return true;

  return false;
};

/**
 * Verifica si una fecha tiene hora específica
 */
const hasTimeInDate = (date: string | undefined): boolean => {
  if (!date) return false;
  return /\d{1,2}:\d{2}|[ap]m/i.test(date);
};

/**
 * Determina si se debe actualizar el campo de fecha
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

  // Solo actualizar si la nueva tiene hora y la vieja no, o si es diferente
  return !existingDate || newHasTime >= existingHasTime;
};

/**
 * Actualiza el campo de texto si la nueva versión es más completa
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
 * Actualiza el campo de fecha si es necesario
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
 * Actualiza el campo assignedTo si es necesario
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
 * Actualiza las relaciones combinando valores únicos
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
 * Marca la tarea como no completada si estaba completada
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
 * Compara scores de información y determina si debe continuar
 */
const shouldProceedWithMerge = (
  existingScore: number,
  newScore: number
): { shouldProceed: boolean; reason: string } => {
  if (newScore < existingScore) {
    return {
      shouldProceed: false,
      reason: `La tarea existente tiene más información (${existingScore} vs ${newScore})`
    };
  }

  return {
    shouldProceed: true,
    reason: ''
  };
};

/**
 * Aplica todas las actualizaciones necesarias a la tarea
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
 * Combina información de una tarea existente con nueva información
 * SOLO actualiza si la nueva tarea tiene MÁS o IGUAL información
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

  // Calcular scores de información
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

  // Verificar si debe proceder con el merge
  const { shouldProceed, reason: skipReason } = shouldProceedWithMerge(existingScore, newScore);

  if (!shouldProceed) {
    return {
      updates: {},
      shouldUpdate: false,
      reason: skipReason
    };
  }

  // Aplicar todas las actualizaciones
  const hasChanges = applyTaskUpdates(existingTask, newData, updates);

  return {
    updates,
    shouldUpdate: hasChanges,
    reason: hasChanges
      ? `Tarea actualizada con más información (${newScore} vs ${existingScore})`
      : 'No hay cambios necesarios'
  };
};
