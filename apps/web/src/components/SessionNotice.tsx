'use client';

import React, { useEffect, useRef } from 'react';
import { SESSION_REASONS, type SessionReason } from '@/lib/routes';

type SessionNoticeProps = { reason: SessionReason };

export function SessionNotice({ reason }: SessionNoticeProps) {
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const text =
    reason === SESSION_REASONS.expired
      ? 'Your session ended. Sign in again to continue.'
      : 'You signed out.';

  useEffect(() => {
    noticeRef.current?.focus();
  }, []);

  return (
    <p
      aria-live="polite"
      className="auth-message info"
      ref={noticeRef}
      role="status"
      tabIndex={-1}
    >
      {text}
    </p>
  );
}
