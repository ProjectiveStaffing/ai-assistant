import { MissingField } from '../_types/PendingTask';

/**
 * Valida si una tarea tiene todos los campos requeridos según su tipo
 */
export const validateTaskData = (
  taskData: {
    taskName: string;
    dateToPerform?: string;
    itemType: string;
    assignedTo?: string;
  }
): { isValid: boolean; missingFields: MissingField[] } => {
  const missingFields: MissingField[] = [];

  // Tasks y Projects REQUIEREN fecha
  if (
    (taskData.itemType?.toLowerCase() === 'task' ||
     taskData.itemType?.toLowerCase() === 'project') &&
    (!taskData.dateToPerform || taskData.dateToPerform.trim() === '')
  ) {
    missingFields.push('dateToPerform');
  }

  // Opcional: Validar assignedTo si es necesario
  // if (!taskData.assignedTo || taskData.assignedTo.trim() === '') {
  //   missingFields.push('assignedTo');
  // }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Genera pregunta contextual basada en el campo faltante
 */
export const getMissingFieldQuestion = (
  field: MissingField,
  itemType: string,
  taskName: string
): string => {
  const itemTypeNormalized = itemType?.toLowerCase();

  const questions: Record<MissingField, Record<string, string>> = {
    dateToPerform: {
      task: `Entendido, quieres "${taskName}" 📝. ¿Para cuándo quieres programar esta tarea?`,
      project: `Perfecto, un proyecto: "${taskName}" 💼. ¿Cuál es la fecha de inicio o límite del proyecto?`,
      default: `¿Para cuándo quieres "${taskName}"?`
    },
    assignedTo: {
      default: `¿Quién se encargará de "${taskName}"?`
    }
  };

  const fieldQuestions = questions[field];
  return fieldQuestions[itemTypeNormalized] || fieldQuestions.default;
};

/**
 * Extrae fecha de un mensaje de texto (para completar tarea pendiente)
 */
export const extractDateFromMessage = (message: string): string | null => {
  const lowerMessage = message.toLowerCase().trim();

  // Mapeo de palabras clave a fechas
  const dateKeywords: Record<string, () => string> = {
    'hoy': () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    'mañana': () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },
    'pasado mañana': () => {
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      return dayAfter.toISOString().split('T')[0];
    },
    'tomorrow': () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },
    'today': () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
  };

  // Buscar palabra clave
  for (const [keyword, getDate] of Object.entries(dateKeywords)) {
    if (lowerMessage.includes(keyword)) {
      return getDate();
    }
  }

  // Si el mensaje completo parece ser solo una fecha, retornarlo
  // Ejemplo: "lunes", "próximo viernes", "15 de diciembre"
  if (lowerMessage.length < 30) {
    return message; // Dejar que Azure OpenAI lo interprete después
  }

  return null;
};

/**
 * Determina si un mensaje parece ser una respuesta a una pregunta de fecha
 */
export const seemsLikeDateResponse = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();

  const dateIndicators = [
    'hoy', 'mañana', 'pasado', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
    'today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'próximo', 'próxima', 'siguiente', 'next',
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'semana', 'week', 'mes', 'month',
    'am', 'pm', ':', 'a las', 'at'
  ];

  // Si el mensaje es corto y contiene indicadores de fecha
  if (message.length < 50) {
    return dateIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  // Si tiene formato de fecha
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // 15/12/2024
    /\d{1,2}-\d{1,2}-\d{2,4}/,   // 15-12-2024
    /\d{4}-\d{2}-\d{2}/,          // 2024-12-15
    /\d{1,2}\s+de\s+\w+/,         // 15 de diciembre
    /\d{1,2}:\d{2}/               // 14:30
  ];

  return datePatterns.some(pattern => pattern.test(lowerMessage));
};
