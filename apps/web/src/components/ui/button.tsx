import type { ComponentProps } from 'react';

// Local shadcn/ui button primitive; visual treatment lives in globals.css.
export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return <button data-slot="button" className={`ui-button ${className}`.trim()} {...props} />;
}
