import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';

// Radix-backed shadcn/ui label primitive.
export function Label({ className = '', ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={`ui-label ${className}`.trim()} {...props} />;
}
