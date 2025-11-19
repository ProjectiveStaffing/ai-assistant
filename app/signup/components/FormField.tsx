/**
 * Reusable form field component with validation UI
 * Following BEST_PRACTICES.md: Component size < 250 lines, Props destructuring
 */

import ValidationMessage from './ValidationMessage';

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showValidation?: boolean;
  successMessage?: string;
  helpText?: string;
  required?: boolean;
  minLength?: number;
}

export default function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  error = '',
  showValidation = false,
  successMessage = '',
  helpText = '',
  required = false,
  minLength,
}: FormFieldProps) {
  const hasError = error.length > 0;
  const hasSuccess = !hasError && value.length > 0 && showValidation;

  const getBorderColor = (): string => {
    if (hasError) return 'border-red-500';
    if (hasSuccess) return 'border-green-500';
    return 'border-gray-600';
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          className={`w-full px-4 py-3 bg-gray-700 text-white rounded-md border ${getBorderColor()}
            placeholder-gray-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
            transition-all duration-200 pr-10`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
        />

        {/* Validation Icon */}
        {showValidation && value.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <span className="text-red-500 text-xl">✗</span>
            ) : (
              <span className="text-green-500 text-xl">✓</span>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {hasError && <ValidationMessage type="error" message={error} />}
      {hasSuccess && successMessage && (
        <ValidationMessage type="success" message={successMessage} />
      )}
      {!hasError && !hasSuccess && helpText && (
        <ValidationMessage type="info" message={helpText} />
      )}
    </div>
  );
}
