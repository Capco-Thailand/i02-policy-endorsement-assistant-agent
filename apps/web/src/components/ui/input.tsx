import type { ComponentProps } from 'react';

// Local shadcn/ui input primitive; visual treatment lives in globals.css.
export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input data-slot="input" className={`ui-input ${className}`.trim()} {...props} />;
}
