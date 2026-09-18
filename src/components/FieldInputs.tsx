interface NumberInputProps {
  id: string;
  label: string;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string | null;
  ariaLabel?: string;
}

export function NumberInput({
  id,
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  error,
  ariaLabel,
}: NumberInputProps) {
  return (
    <div className="numfield">
      <label className="numlabel" htmlFor={id}>
        {label}
      </label>
      <div className={`numwrap${error ? ' is-error' : ''}`}>
        <input
          id={id}
          className="numinput"
          type="number"
          aria-label={ariaLabel ?? label}
          inputMode="decimal"
          value={Number.isFinite(value) ? String(value) : ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
        {unit && <span className="numunit">{unit}</span>}
      </div>
      {error && (
        <p className="fielderr" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectInput({ id, label, value, onChange, options }: SelectInputProps) {
  return (
    <div className="numfield">
      <label className="numlabel" htmlFor={id}>
        {label}
      </label>
      <div className="selectwrap">
        <select
          id={id}
          className="numinput selectinput"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}