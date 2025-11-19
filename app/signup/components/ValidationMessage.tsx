/**
 * Reusable validation message component
 * Shows success or error messages with appropriate styling
 * Following BEST_PRACTICES.md: Component size < 250 lines, Single Responsibility
 */

interface ValidationMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export default function ValidationMessage({ type, message }: ValidationMessageProps) {
  const styles = {
    error: 'text-red-500',
    success: 'text-green-500',
    info: 'text-gray-400',
  };

  const icons = {
    error: '⚠️',
    success: '✓',
    info: 'ℹ️',
  };

  return (
    <p className={`text-xs mt-1 flex items-center gap-1 ${styles[type]}`}>
      <span>{icons[type]}</span>
      {message}
    </p>
  );
}
