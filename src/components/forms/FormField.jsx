export default function FormField({ id, label, error, as: Tag = 'input', className = '', ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">{label}</label>
      <Tag
        id={id}
        className={`${Tag === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''} ${className}`.trim()}
        spellCheck={inputProps.type === 'email' ? false : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && <p id={`${id}-error`} className="form-field__error">{error}</p>}
    </div>
  )
}
