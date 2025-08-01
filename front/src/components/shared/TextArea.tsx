import React from 'react';

interface TextAreaProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  name,
  label,
  required = false,
  defaultValue,
  placeholder,
  className,
  maxLength,
  rows = 4,
  onChange
}) => {
  return (
    <div className="relative mb-4">
      <label
        htmlFor={id}
        className="leading-7 text-sm text-gray-600"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        className={`w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${className || ''}`}
      />
    </div>
  );
};

export default TextArea;