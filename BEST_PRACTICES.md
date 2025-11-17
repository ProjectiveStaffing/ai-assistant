# Best Practices - Youtask

This document defines coding standards, security practices, and architectural guidelines for the Youtask project.

## Table of Contents
1. [TypeScript Guidelines](#typescript-guidelines)
2. [React & Next.js Best Practices](#react--nextjs-best-practices)
3. [Component Architecture](#component-architecture)
4. [Security Best Practices](#security-best-practices)
5. [Code Quality & Clean Code](#code-quality--clean-code)
6. [State Management](#state-management)
7. [API & Data Fetching](#api--data-fetching)
8. [File & Folder Organization](#file--folder-organization)

---

## TypeScript Guidelines

### Type Safety
```typescript
// ✅ GOOD: Explicit types for function parameters and return values
function calculateScore(task: Reminder, weights: ScoreWeights): number {
  return task.relationships.length * weights.relationshipWeight;
}

// ❌ BAD: Implicit any types
function calculateScore(task, weights) {
  return task.relationships.length * weights.relationshipWeight;
}
```

### Interface vs Type
```typescript
// ✅ GOOD: Use interfaces for object shapes (extensible)
interface Reminder {
  id: string;
  text: string;
  isCompleted: boolean;
}

// ✅ GOOD: Use types for unions, intersections, and utilities
type ReminderStatus = 'pending' | 'in_progress' | 'completed';
type PartialReminder = Partial<Reminder>;

// ❌ BAD: Using 'any' type
type UserData = any;
```

### Avoid Type Assertions
```typescript
// ✅ GOOD: Type guards
function isReminder(obj: unknown): obj is Reminder {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'text' in obj;
}

// ❌ BAD: Type assertion without validation
const reminder = data as Reminder;
```

### Strict Null Checks
```typescript
// ✅ GOOD: Handle null/undefined explicitly
function getTaskName(task: Reminder | null): string {
  return task?.text ?? 'Untitled Task';
}

// ❌ BAD: Assuming non-null values
function getTaskName(task: Reminder): string {
  return task.text; // Could crash if task is null
}
```

---

## React & Next.js Best Practices

### Component Function Declaration
```typescript
// ✅ GOOD: Named function component with explicit types
export default function ChatBox({ initialMessage }: ChatBoxProps) {
  return <div>{initialMessage}</div>;
}

// ❌ BAD: Anonymous arrow function
export default ({ initialMessage }) => {
  return <div>{initialMessage}</div>;
};
```

### Client vs Server Components
```typescript
// ✅ GOOD: Only use 'use client' when needed (state, effects, browser APIs)
'use client';
import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ GOOD: Server component by default (no state, no browser APIs)
export default async function TaskList() {
  const tasks = await fetchTasks(); // Server-side data fetching
  return <ul>{tasks.map(task => <li key={task.id}>{task.text}</li>)}</ul>;
}
```

### Hooks Rules
```typescript
// ✅ GOOD: Call hooks at the top level
function TaskManager() {
  const [tasks, setTasks] = useState<Reminder[]>([]);
  const { state, addReminder } = useReminders();

  useEffect(() => {
    // Side effects
  }, [tasks]);

  return <div>...</div>;
}

// ❌ BAD: Conditional hooks
function TaskManager() {
  if (condition) {
    const [tasks, setTasks] = useState([]); // ERROR!
  }
}
```

### Memoization
```typescript
// ✅ GOOD: Memoize expensive calculations
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}, [tasks]);

// ✅ GOOD: Memoize callback functions passed as props
const handleAddTask = useCallback((taskName: string) => {
  addReminder({ text: taskName, isCompleted: false });
}, [addReminder]);

// ❌ BAD: Creating new functions on every render
<Button onClick={() => addReminder({ text: 'New Task' })} />
```

---

## Component Architecture

### Component Size Limit
**Rule: Components should not exceed 250 lines of code**

```typescript
// ✅ GOOD: Break down large components
// ChatBox.tsx (120 lines)
export default function ChatBox() {
  return (
    <div>
      <ChatHeader />
      <ChatMessages messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}

// ChatMessages.tsx (80 lines)
function ChatMessages({ messages }: ChatMessagesProps) {
  return <div>{messages.map(msg => <Message key={msg.id} {...msg} />)}</div>;
}

// ❌ BAD: 500-line component with everything mixed
export default function ChatBox() {
  // 500 lines of state, handlers, rendering...
}
```

### Single Responsibility Principle
```typescript
// ✅ GOOD: Each component has one responsibility
function TaskList({ tasks }: TaskListProps) {
  return (
    <ul>
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </ul>
  );
}

function TaskItem({ task }: TaskItemProps) {
  return (
    <li>
      <TaskCheckbox checked={task.isCompleted} />
      <TaskName text={task.text} />
      <TaskActions taskId={task.id} />
    </li>
  );
}

// ❌ BAD: Component doing too much
function TaskList({ tasks }: TaskListProps) {
  // Handles rendering, API calls, validation, state management...
}
```

### Props Destructuring
```typescript
// ✅ GOOD: Destructure props with types
interface TaskItemProps {
  task: Reminder;
  onToggle: (id: string) => void;
  showDetails?: boolean;
}

function TaskItem({ task, onToggle, showDetails = false }: TaskItemProps) {
  return <div onClick={() => onToggle(task.id)}>{task.text}</div>;
}

// ❌ BAD: Using props object directly
function TaskItem(props) {
  return <div onClick={() => props.onToggle(props.task.id)}>{props.task.text}</div>;
}
```

---

## Security Best Practices

### Environment Variables
```typescript
// ✅ GOOD: Validate environment variables at app startup
if (!process.env.NEXT_PUBLIC_PLAYFAB_TITLE_ID) {
  throw new Error("NEXT_PUBLIC_PLAYFAB_TITLE_ID is not defined");
}

// ✅ GOOD: Never expose server-only secrets to client
// .env
NEXT_PUBLIC_API_URL=https://api.example.com  // ✅ Safe for client
DATABASE_URL=postgresql://...                 // ✅ Server-only (no NEXT_PUBLIC_)

// ❌ BAD: Exposing sensitive data to client
NEXT_PUBLIC_DATABASE_PASSWORD=secret123  // ❌ NEVER DO THIS
```

### Input Validation
```typescript
// ✅ GOOD: Validate and sanitize all user inputs
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email.length === 0 || email.length > 254) {
    return false;
  }

  return emailRegex.test(email);
}

// ✅ GOOD: Validate on both client and server
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!validateEmail(email)) {
    setError('Invalid email format');
    return;
  }

  // Then validate again on the server
  await api.register({ email });
}

// ❌ BAD: Trusting user input without validation
function handleSubmit(data: any) {
  api.register(data); // No validation!
}
```

### XSS Prevention
```typescript
// ✅ GOOD: React automatically escapes text content
function TaskName({ text }: { text: string }) {
  return <div>{text}</div>; // Safe - React escapes HTML
}

// ❌ BAD: Using dangerouslySetInnerHTML without sanitization
function TaskName({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />; // DANGEROUS!
}

// ✅ ACCEPTABLE: Using dangerouslySetInnerHTML with sanitization
import DOMPurify from 'dompurify';

function TaskName({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### Secure API Calls
```typescript
// ✅ GOOD: Validate and sanitize before sending to API
async function createTask(taskData: TaskInput) {
  // Validate
  if (!validateTaskData(taskData)) {
    throw new Error('Invalid task data');
  }

  // Sanitize
  const sanitized = {
    taskName: taskData.taskName.trim().substring(0, 200),
    dateToPerform: validateDate(taskData.dateToPerform),
  };

  // Send to API
  const response = await fetch('/api/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sanitized),
  });

  return response.json();
}

// ❌ BAD: Sending unvalidated user input
async function createTask(taskData: any) {
  await fetch('/api/task', {
    method: 'POST',
    body: JSON.stringify(taskData), // No validation!
  });
}
```

### Authentication & Sessions
```typescript
// ✅ GOOD: Store session tokens securely
if (result.data.SessionTicket) {
  sessionStorage.setItem('playfabTicket', result.data.SessionTicket);
}

// ❌ BAD: Storing sensitive data in localStorage (persists across sessions)
localStorage.setItem('password', password); // NEVER DO THIS

// ❌ BAD: Storing tokens in cookies without security flags
document.cookie = `token=${sessionTicket}`; // Missing httpOnly, secure flags
```

---

## Code Quality & Clean Code

### Naming Conventions
```typescript
// ✅ GOOD: Clear, descriptive names
const isTaskCompleted = task.isCompleted;
const filteredTasks = tasks.filter(task => !task.isCompleted);
const handleTaskToggle = (taskId: string) => { /* ... */ };

// ❌ BAD: Unclear abbreviations
const tsk = task.isCompleted;
const arr = tasks.filter(t => !t.c);
const fn = (id: string) => { /* ... */ };
```

### Function Size
**Rule: Functions should not exceed 40 lines**

```typescript
// ✅ GOOD: Small, focused functions
function calculateInformationScore(task: Reminder): number {
  let score = 0;
  score += calculateTextScore(task.text);
  score += calculateDateScore(task.dueDate);
  score += calculateRelationshipScore(task.relationships);
  return score;
}

function calculateTextScore(text: string): number {
  const wordCount = text.trim().split(/\s+/).length;
  return wordCount * 2;
}

// ❌ BAD: Long function doing multiple things
function processTask(task: any) {
  // 100+ lines of mixed logic
}
```

### DRY (Don't Repeat Yourself)
```typescript
// ✅ GOOD: Extract reusable logic
function validateField(value: string, minLength: number, maxLength: number, fieldName: string): string {
  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  if (value.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return '';
}

const usernameError = validateField(username, 3, 20, 'Username');
const displayNameError = validateField(displayName, 3, 25, 'Display Name');

// ❌ BAD: Duplicated validation logic
if (username.length < 3) {
  setUsernameError('Username debe tener al menos 3 caracteres');
}
// Same logic repeated for displayName, email, etc.
```

### Early Returns
```typescript
// ✅ GOOD: Guard clauses and early returns
function processTask(task: Reminder | null): string {
  if (!task) {
    return 'No task provided';
  }

  if (task.isCompleted) {
    return 'Task already completed';
  }

  if (!task.dueDate) {
    return 'Task has no due date';
  }

  return `Processing task: ${task.text}`;
}

// ❌ BAD: Nested conditionals
function processTask(task: Reminder | null): string {
  if (task) {
    if (!task.isCompleted) {
      if (task.dueDate) {
        return `Processing task: ${task.text}`;
      } else {
        return 'Task has no due date';
      }
    } else {
      return 'Task already completed';
    }
  } else {
    return 'No task provided';
  }
}
```

### Comments
```typescript
// ✅ GOOD: Comments explain WHY, not WHAT
// Use Levenshtein distance instead of simple string comparison
// to handle typos and small variations in task names
const similarity = calculateTextSimilarity(text1, text2);

// ✅ GOOD: JSDoc for complex functions
/**
 * Calculates similarity between two task names using Levenshtein distance.
 * Returns a value between 0 (completely different) and 1 (identical).
 *
 * @param text1 - First task name
 * @param text2 - Second task name
 * @returns Similarity score (0-1)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Implementation...
}

// ❌ BAD: Comments that restate the code
// Set username to value
setUsername(value);

// Loop through tasks
tasks.forEach(task => { /* ... */ });
```

---

## State Management

### Context API Usage
```typescript
// ✅ GOOD: Separate context from logic
// RemindersContext.tsx
export const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const value = useMemo(() => ({
    state,
    addReminder,
    toggleReminderComplete,
    // ... other methods
  }), [state]);

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

// useReminders.ts
export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within RemindersProvider');
  }
  return context;
}

// ❌ BAD: Everything in one file, no custom hook
```

### State Updates
```typescript
// ✅ GOOD: Immutable state updates
const addReminder = (reminder: Reminder) => {
  setState(prevState => ({
    ...prevState,
    reminders: [...prevState.reminders, reminder],
  }));
};

// ❌ BAD: Mutating state directly
const addReminder = (reminder: Reminder) => {
  state.reminders.push(reminder); // NEVER DO THIS
  setState(state);
};
```

---

## API & Data Fetching

### Error Handling
```typescript
// ✅ GOOD: Comprehensive error handling
async function fetchTaskData(taskId: string): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!isValidTask(data)) {
      throw new Error('Invalid task data received from API');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
      throw new Error('Unable to connect to server');
    }
    throw error;
  }
}

// ❌ BAD: No error handling
async function fetchTaskData(taskId: string) {
  const response = await fetch(`/api/tasks/${taskId}`);
  return response.json();
}
```

### Loading States
```typescript
// ✅ GOOD: Handle loading, error, and success states
function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const data = await fetchTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <div>{tasks.map(task => <TaskItem key={task.id} task={task} />)}</div>;
}
```

---

## File & Folder Organization

### Directory Structure
```
app/
├── assistant/
│   ├── _context/          # React contexts (prefixed with _ to avoid routing)
│   ├── _hook/             # Custom hooks
│   ├── _types/            # TypeScript interfaces
│   ├── _utils/            # Utility functions
│   ├── _icons/            # SVG icon components
│   └── components/        # React components
│       ├── ChatBox.tsx
│       ├── Sidebar.tsx
│       └── RemindersSection.tsx
├── signup/
│   └── page.tsx
└── login/
    └── page.tsx
```

### Import Organization
```typescript
// ✅ GOOD: Organized imports
// 1. External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal contexts and hooks
import { useReminders } from '@/app/assistant/_hook/useReminders';

// 3. Components
import ChatBox from '@/app/assistant/components/ChatBox';
import Sidebar from '@/app/assistant/components/Sidebar';

// 4. Types
import type { Reminder, ReminderList } from '@/app/assistant/_types/Reminder';

// 5. Utilities
import { calculateTextSimilarity } from '@/app/assistant/_utils/taskComparison';

// ❌ BAD: Random import order
import { calculateTextSimilarity } from '@/app/assistant/_utils/taskComparison';
import { useReminders } from '@/app/assistant/_hook/useReminders';
import { useState } from 'react';
```

### File Naming
```
✅ GOOD:
- ChatBox.tsx (PascalCase for components)
- useReminders.ts (camelCase for hooks)
- taskComparison.ts (camelCase for utilities)
- Reminder.ts (PascalCase for types)

❌ BAD:
- chatbox.tsx
- UseReminders.ts
- TaskComparison.ts
- reminder.ts
```

---

## Summary Checklist

### Before Committing Code
- [ ] No TypeScript `any` types (use `unknown` if needed)
- [ ] All functions have explicit return types
- [ ] Components are under 250 lines
- [ ] Functions are under 40 lines
- [ ] All user inputs are validated
- [ ] No sensitive data exposed to client
- [ ] Environment variables are validated at startup
- [ ] Error states are handled in async operations
- [ ] State updates are immutable
- [ ] Imports are organized
- [ ] No console.logs in production code (use proper logging)
- [ ] Component props have TypeScript interfaces
- [ ] Custom hooks follow naming convention (use*)

### Performance Considerations
- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for functions passed as props
- [ ] Avoid unnecessary re-renders
- [ ] Use React.memo for pure components
- [ ] Lazy load heavy components when possible

### Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Form inputs have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Color is not the only indicator of state
