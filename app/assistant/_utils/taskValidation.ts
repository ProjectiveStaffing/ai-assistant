import { MissingField } from '../_types/PendingTask';

/**
 * Validates if a task has all required fields based on its type
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

  // Tasks and Projects REQUIRE date
  if (
    (taskData.itemType?.toLowerCase() === 'task' ||
     taskData.itemType?.toLowerCase() === 'project') &&
    (!taskData.dateToPerform || taskData.dateToPerform.trim() === '')
  ) {
    missingFields.push('dateToPerform');
  }

  // Optional: Validate assignedTo if needed
  // if (!taskData.assignedTo || taskData.assignedTo.trim() === '') {
  //   missingFields.push('assignedTo');
  // }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Generates contextual question based on missing field
 */
export const getMissingFieldQuestion = (
  field: MissingField,
  itemType: string,
  taskName: string
): string => {
  const itemTypeNormalized = itemType?.toLowerCase();

  const questions: Record<MissingField, Record<string, string>> = {
    dateToPerform: {
      task: `Understood, you want "${taskName}" 📝. When do you want to schedule this task?`,
      project: `Perfect, a project: "${taskName}" 💼. What is the start date or project deadline?`,
      default: `When do you want "${taskName}"?`
    },
    assignedTo: {
      default: `Who will be responsible for "${taskName}"?`
    }
  };

  const fieldQuestions = questions[field];
  return fieldQuestions[itemTypeNormalized] || fieldQuestions.default;
};

// ============================================================================
// CONSTANTS - Date Keywords
// ============================================================================

/**
 * Keywords for relative date identification
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
 * Indicators that a message contains a date
 */
const DATE_INDICATOR_WORDS = [
  // Relative days - Spanish
  'hoy', 'mañana', 'pasado',
  // Relative days - English
  'today', 'tomorrow',
  // Next/following - Spanish and English
  'próximo', 'próxima', 'siguiente', 'next',

  // Days of the week - Spanish
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',

  // Days of the week - English
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',

  // Months - Spanish
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',

  // Months - English
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',

  // Time periods - Spanish and English
  'semana', 'week', 'mes', 'month',

  // Time indicators - Spanish and English
  'am', 'pm', ':', 'a las', 'at'
];

/**
 * Regex patterns to detect date formats
 */
const DATE_PATTERNS = [
  /\d{1,2}\/\d{1,2}\/\d{2,4}/, // 15/12/2024
  /\d{1,2}-\d{1,2}-\d{2,4}/,   // 15-12-2024
  /\d{4}-\d{2}-\d{2}/,          // 2024-12-15
  /\d{1,2}\s+de\s+\w+/,         // 15 de diciembre (Spanish)
  /\d{1,2}:\d{2}/               // 14:30
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Searches for relative date keywords in the message
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
 * Checks if message contains date indicators
 */
const hasDateIndicators = (message: string): boolean => {
  return DATE_INDICATOR_WORDS.some(indicator => message.includes(indicator));
};

/**
 * Checks if message matches date patterns
 */
const matchesDatePattern = (message: string): boolean => {
  return DATE_PATTERNS.some(pattern => pattern.test(message));
};

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Extracts date from text message (to complete pending task)
 */
export const extractDateFromMessage = (message: string): string | null => {
  const lowerMessage = message.toLowerCase().trim();

  // Search for relative date keyword
  const relativeDate = findRelativeDateKeyword(lowerMessage);
  if (relativeDate) {
    return relativeDate;
  }

  // If the full message seems to be just a date, return it
  // Example: "monday", "next friday", "15 de diciembre"
  if (lowerMessage.length < 30) {
    return message; // Let Azure OpenAI interpret it later
  }

  return null;
};

/**
 * Determines if a message seems to be a response to a date question
 */
export const seemsLikeDateResponse = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();

  // If message is short and contains date indicators
  if (message.length < 50 && hasDateIndicators(lowerMessage)) {
    return true;
  }

  // If it has date format
  return matchesDatePattern(lowerMessage);
};
