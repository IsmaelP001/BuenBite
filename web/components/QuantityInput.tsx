'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';


// Tipos para el componente QuantityInput
interface QuantityInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Componente reutilizable QuantityInput
const QuantityInput: React.FC<QuantityInputProps> = ({ 
  value = 1, 
  onChange, 
  min = 1, 
  max = 99, 
  disabled = false,
  size = 'md' 
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleIncrement = (): void => {
    if (disabled || value >= max) return;
    onChange(Math.min(value + 1, max));
  };

  const handleDecrement = (): void => {
    if (disabled || value <= min) return;
    onChange(Math.max(value - 1, min));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleBlur = (): void => {
    setIsEditing(false);
    let numValue = parseInt(inputValue) || min;
    numValue = Math.max(min, Math.min(max, numValue));
    onChange(numValue);
    setInputValue(String(numValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(String(value));
      setIsEditing(false);
    }
  };

  const handleClick = (): void => {
    if (!disabled) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const iconSizes: Record<'sm' | 'md' | 'lg', number> = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={`inline-flex items-center border border-gray-300 rounded-lg bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`${sizeClasses[size]} px-3 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:text-gray-300 rounded-l-lg`}
        aria-label="Disminuir cantidad"
        type="button"
      >
        <Minus size={iconSizes[size]} />
      </button>
      
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        disabled={disabled}
        className={`${sizeClasses[size]} w-12 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-gray-50`}
        aria-label="Cantidad"
      />
      
      <button
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`${sizeClasses[size]} px-3 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:text-gray-300 rounded-r-lg`}
        aria-label="Aumentar cantidad"
        type="button"
      >
        <Plus size={iconSizes[size]} />
      </button>
    </div>
  );
};


export default QuantityInput
