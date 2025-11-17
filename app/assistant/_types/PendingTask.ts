export interface PendingTask {
  taskName: string;
  peopleInvolved: string[];
  taskCategory: string;
  dateToPerform?: string;
  itemType: string;
  assignedTo: string;
  missingFields: ('dateToPerform' | 'assignedTo')[];
  originalMessage: string;
}

export type MissingField = 'dateToPerform' | 'assignedTo';
