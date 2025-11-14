import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = ({ label, error, className, ...rest }: TextFieldProps) => (
  <label className={clsx('fd-field', className)}>
    <span className="fd-field__label">{label}</span>
    <input className={clsx('fd-field__input', error && 'fd-field__input--error')} {...rest} />
    {error ? <span className="fd-field__error">{error}</span> : null}
  </label>
);

