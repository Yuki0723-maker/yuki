import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
}

interface InputProps extends FieldProps, InputHTMLAttributes<HTMLInputElement> {}
interface TextareaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}
interface SelectProps extends FieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent';

export function InputField({ label, required, ...props }: InputProps) {
  return (
    <div>
      <label className={labelClass}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input className={inputClass} {...props} />
    </div>
  );
}

export function TextareaField({ label, required, rows = 3, ...props }: TextareaProps) {
  return (
    <div>
      <label className={labelClass}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <textarea className={`${inputClass} resize-y`} rows={rows} {...props} />
    </div>
  );
}

export function SelectField({ label, required, options, ...props }: SelectProps) {
  return (
    <div>
      <label className={labelClass}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <select className={inputClass} {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
