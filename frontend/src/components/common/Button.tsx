import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost' | 'outline';
};

export const Button = ({
  children,
  className,
  variant = 'solid',
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    className={clsx('fd-btn', `fd-btn--${variant}`, className)}
    disabled={disabled}
    {...rest}
  >
    {children}
  </button>
);

