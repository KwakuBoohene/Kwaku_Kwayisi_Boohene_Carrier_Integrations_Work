import type {
  AnswerValue,
  FormField as FieldDefinition,
} from "@/lib/form-schema";

interface FieldProps {
  field: FieldDefinition;
  value: AnswerValue | undefined;
  error?: string;
  hint?: string;
  onChange: (value: AnswerValue | undefined) => void;
}

function describedBy(field: FieldDefinition, error?: string, hint?: string) {
  return [hint && `${field.key}-hint`, error && `${field.key}-error`].filter(Boolean).join(" ") || undefined;
}

const controlStyle =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-teal-700 focus:outline-2 focus:outline-teal-700";

function SelectionControl({ field, value, error, hint, onChange }: FieldProps) {
  if (field.type !== "select" && field.type !== "boolean") return null;
  const options = field.type === "select" ? field.options : [true, false];
  const selected = value === undefined ? "" : String(value);
  const unsupported =
    selected !== "" && !options.some((option) => String(option) === selected);
  return (
    <select
      id={field.key}
      name={field.key}
      className={controlStyle}
      value={selected}
      required={field.required}
      aria-invalid={!!error}
      aria-describedby={describedBy(field, error, hint)}
      onChange={(event) =>
        onChange(
          options.find((option) => String(option) === event.target.value),
        )
      }
    >
      <option value="">Select an answer</option>
      {unsupported && (
        <option value={selected} disabled>
          {selected} (unsupported)
        </option>
      )}
      {options.map((option) => (
        <option key={String(option)} value={String(option)}>
          {typeof option === "boolean" ? (option ? "Yes" : "No") : option}
        </option>
      ))}
    </select>
  );
}

function Checkboxes({ field, value, error, hint, onChange }: FieldProps) {
  if (field.type !== "multiselect") return null;
  const selected = Array.isArray(value) ? value : [];
  return (
    <fieldset
      id={field.key}
      aria-invalid={!!error}
      aria-describedby={describedBy(field, error, hint)}
    >
      <legend className="font-medium">
        {field.label}
        {!field.required && " (optional)"}
      </legend>
      <div className="mt-3 flex flex-wrap gap-4">
        {field.options.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={field.key}
              value={option}
              checked={selected.includes(option)}
              className="size-4 accent-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option),
                )
              }
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function InputControl({ field, value, error, hint, onChange }: FieldProps) {
  if (field.type === "select" || field.type === "boolean") {
    return (
      <SelectionControl
        field={field}
        value={value}
        error={error}
        hint={hint}
        onChange={onChange}
      />
    );
  }
  if (field.type === "multiselect") return null;
  return (
    <input
      id={field.key}
      name={field.key}
      type={field.type}
      className={controlStyle}
      value={
        typeof value === "string" || typeof value === "number" ? value : ""
      }
      required={field.required}
      pattern={field.type === "text" ? field.pattern : undefined}
      min={field.type === "number" ? field.min : undefined}
      step={field.type === "number" ? "any" : undefined}
      aria-invalid={!!error}
      aria-describedby={describedBy(field, error, hint)}
      onChange={(event) =>
        onChange(
          field.type === "number"
            ? event.target.value === ""
              ? undefined
              : Number(event.target.value)
            : event.target.value,
        )
      }
    />
  );
}

export function FormField(props: FieldProps) {
  const { field, error, hint } = props;
  return (
    <div>
      {field.type === "multiselect" ? (
        <Checkboxes {...props} />
      ) : (
        <>
          <label htmlFor={field.key} className="font-medium">
            {field.label}
            {!field.required && " (optional)"}
          </label>
          <InputControl {...props} />
        </>
      )}
      {hint && <p id={`${field.key}-hint`} className="mt-2 text-sm text-slate-600">{hint}</p>}
      {error && (
        <p id={`${field.key}-error`} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
