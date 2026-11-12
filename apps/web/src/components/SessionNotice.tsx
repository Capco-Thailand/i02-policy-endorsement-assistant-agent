'use client';

import React, { useEffect, useRef } from 'react';

type SessionNoticeProps = { reason: 'expired' | 'signed-out' };

export function SessionNotice({ reason }: SessionNoticeProps) {
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const text =
    reason === 'expired'
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
