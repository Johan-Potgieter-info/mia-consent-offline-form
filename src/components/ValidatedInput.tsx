
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { validatePhoneNumber, validateEmail } from '../utils/validation';

interface ValidatedInputProps {
  type: 'phone' | 'email' | 'text' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  onValidationChange?: (isValid: boolean) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const ValidatedInput = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  label,
  onValidationChange,
  hasError = false,
  disabled = false
}: ValidatedInputProps) => {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validateInput = (inputValue: string) => {
    if (!required && !inputValue.trim()) {
      setError('');
      onValidationChange?.(true);
      return;
    }

    let validation;
    switch (type) {
      case 'phone':
      case 'tel':
        validation = validatePhoneNumber(inputValue);
        break;
      case 'email':
        validation = validateEmail(inputValue);
        break;
      default:
        validation = { isValid: true };
    }

    if (validation.isValid) {
      setError('');
      onValidationChange?.(true);
    } else {
      setError(validation.message || 'Invalid input');
      onValidationChange?.(false);
    }
  };

  useEffect(() => {
    if (touched) {
      validateInput(value);
    }
  }, [value, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // For phone numbers, only allow digits, spaces, dashes, parentheses, and plus
    if (type === 'phone' || type === 'tel') {
      newValue = newValue.replace(/[^\d\s\-\(\)\+]/g, '');
    }
    
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    validateInput(value);
  };

  const inputType = type === 'phone' || type === 'tel' ? 'tel' : type === 'email' ? 'email' : type === 'date' ? 'date' : 'text';

  // Show error if there's a validation error OR if hasError prop is passed
  const showError = (error && touched) || (hasError && required && !value.trim());
  const errorMessage = error || (hasError && required && !value.trim() ? 'This field is required.' : '');

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={label} className="block text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      <Input
        id={label}
        type={inputType}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} ${showError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {showError && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default ValidatedInput;
