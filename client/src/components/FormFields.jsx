import React from "react";

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ label, value, onChange, required = false, type = "text", ...props }) {
  return (
    <Field label={label}>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} {...props} />
    </Field>
  );
}

export function SelectInput({ label, value, onChange, options, required = false, emptyLabel = "Sin seleccionar" }) {
  return (
    <Field label={label}>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TextArea({ label, value, onChange }) {
  return (
    <Field label={label}>
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={4} />
    </Field>
  );
}
