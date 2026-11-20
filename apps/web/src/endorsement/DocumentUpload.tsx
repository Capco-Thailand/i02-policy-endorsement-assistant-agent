'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useDocumentUpload, useRules } from '../lib/queries';
import type { RequestBody } from '../lib/api';
import { routes } from '../lib/routes';

export function DocumentUpload({
  policyId,
  requestId,
  changeType,
  requestedEffectiveDate,
}: {
  policyId: string;
  requestId: string;
  changeType: RequestBody['changeType'];
  requestedEffectiveDate: string;
}) {
  const [file, setFile] = useState<File>();
  const upload = useDocumentUpload(policyId);
  const rules = useRules(policyId, changeType, requestedEffectiveDate);
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    if (rules.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [rules.error, client, router]);
  if (rules.error?.message === 'UNAUTHORIZED') return null;
  if (rules.error?.message === 'NOT_FOUND')
    return <p role="alert">This policy is unavailable.</p>;
  const citations =
    !rules.isError && rules.data?.status === 'AVAILABLE'
      ? rules.data.citations.filter((item) => item.role === 'GUIDANCE')
      : [];
  return (
    <section aria-labelledby="document-upload-heading">
      <h3 id="document-upload-heading">Mock document upload</h3>
      <div aria-live="polite">
        {rules.isPending ? (
          <p>Loading document guidance…</p>
        ) : citations.length ? (
          citations.map((item) => (
            <div key={`${item.sourceId}:${item.sectionId}`}>
              <p>
                {item.value.kind === 'NONE'
                  ? 'No document required: '
                  : 'Document guidance: '}
                {item.text}
              </p>
              <p>
                Source {item.sourceId} · version {item.version} · section{' '}
                {item.sectionId}
              </p>
            </div>
          ))
        ) : (
          <div>
            <p>
              Document guidance is unresolved. No document requirement is
              verified.
            </p>
            {rules.isError && rules.error.message === 'API_UNAVAILABLE' && (
              <button type="button" onClick={() => void rules.refetch()}>
                Retry guidance
              </button>
            )}
          </div>
        )}
      </div>
      <p>
        Use a synthetic file only. Never upload real identity or health records.
        This demonstration does not check whether the file meets any
        requirement.
      </p>
      {upload.data ? (
        <p aria-live="polite">
          <strong>{upload.data.status}</strong> — {upload.data.explanation}
        </p>
      ) : (
        <>
          <label htmlFor="synthetic-document">
            Synthetic document (PDF, PNG, or JPEG; up to 10 MiB)
          </label>
          <input
            id="synthetic-document"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={(event) => setFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={!file || upload.isPending}
            onClick={() => file && upload.mutate({ requestId, file })}
          >
            {upload.isPending
              ? 'Uploading synthetic file…'
              : 'Upload synthetic file'}
          </button>
          {upload.isError && (
            <p role="alert">
              Upload failed. Check the file type and size, then try again.
            </p>
          )}
        </>
      )}
    </section>
  );
}
