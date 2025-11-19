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

// ============================================================================
// CONSTANTS - Date Keywords
// ============================================================================

/**
 * Keywords para identificación de fechas relativas
 */
const RELATIVE_DATE_KEYWORDS: Record<string, () => string> = {
  'hoy': () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },
  'today': () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },
  'mañana': () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },
  'tomorrow': () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },
  'pasado mañana': () => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }
};

/**
 * Indicadores de que un mensaje contiene una fecha
 */
const DATE_INDICATOR_WORDS = [
  // Días relativos
  'hoy', 'mañana', 'pasado',
  'today', 'tomorrow',
  'próximo', 'próxima', 'siguiente', 'next',

  // Días de la semana - Español
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',

  // Días de la semana - Inglés
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',

  // Meses - Español
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',

  // Meses - Inglés
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',

  // Periodos
  'semana', 'week', 'mes', 'month',

  // Indicadores de hora
  'am', 'pm', ':', 'a las', 'at'
];

/**
 * Patrones regex para detectar formatos de fecha
 */
const DATE_PATTERNS = [
  /\d{1,2}\/\d{1,2}\/\d{2,4}/, // 15/12/2024
  /\d{1,2}-\d{1,2}-\d{2,4}/,   // 15-12-2024
  /\d{4}-\d{2}-\d{2}/,          // 2024-12-15
  /\d{1,2}\s+de\s+\w+/,         // 15 de diciembre
  /\d{1,2}:\d{2}/               // 14:30
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Busca keywords de fecha relativa en el mensaje
 */
const findRelativeDateKeyword = (message: string): string | null => {
  for (const [keyword, getDate] of Object.entries(RELATIVE_DATE_KEYWORDS)) {
    if (message.includes(keyword)) {
      return getDate();
    }
  }
  return null;
};

/**
 * Verifica si el mensaje contiene indicadores de fecha
 */
const hasDateIndicators = (message: string): boolean => {
  return DATE_INDICATOR_WORDS.some(indicator => message.includes(indicator));
};

/**
 * Verifica si el mensaje coincide con patrones de fecha
 */
const matchesDatePattern = (message: string): boolean => {
  return DATE_PATTERNS.some(pattern => pattern.test(message));
};

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Extrae fecha de un mensaje de texto (para completar tarea pendiente)
 */
export const extractDateFromMessage = (message: string): string | null => {
  const lowerMessage = message.toLowerCase().trim();

  // Buscar palabra clave de fecha relativa
  const relativeDate = findRelativeDateKeyword(lowerMessage);
  if (relativeDate) {
    return relativeDate;
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

  // Si el mensaje es corto y contiene indicadores de fecha
  if (message.length < 50 && hasDateIndicators(lowerMessage)) {
    return true;
  }

  // Si tiene formato de fecha
  return matchesDatePattern(lowerMessage);
};
