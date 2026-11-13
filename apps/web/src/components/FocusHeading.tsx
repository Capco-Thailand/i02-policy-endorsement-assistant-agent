'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function FocusHeading({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <h1 className="page-title" ref={heading} tabIndex={-1}>
      {children}
    </h1>
  );
}
