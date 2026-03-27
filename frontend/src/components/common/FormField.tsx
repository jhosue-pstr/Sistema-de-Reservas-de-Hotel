import { useState } from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'time' | 'tel' | 'password';
  value: string | number;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      
      {options ? (
        <select
          className={`form-select ${error ? 'is-invalid' : ''}`}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
