'use client';

import { useState } from 'react';
import { useDocumentUpload } from '../lib/queries';
import type { RequestBody } from '../lib/api';

const guidance: Record<RequestBody['changeType'], string> = {
  BENEFICIARY:
    'A real insurer may request beneficiary and relationship evidence.',
  ADDRESS:
    'A real insurer may request proof of the new correspondence address.',
  PAYMENT_FREQUENCY: 'A real insurer may request payment-method information.',
  ACCIDENTAL_DEATH_RIDER:
    'Adding a rider may require health disclosure or underwriting by a real insurer. Do not upload real health records here.',
};

export function DocumentUpload({
  policyId,
  requestId,
  changeType,
}: {
  policyId: string;
  requestId: string;
  changeType: RequestBody['changeType'];
}) {
  const [file, setFile] = useState<File>();
  const upload = useDocumentUpload(policyId);
  return (
    <section aria-labelledby="document-upload-heading">
      <h3 id="document-upload-heading">Mock document upload</h3>
      <p>
        Example guidance from a synthetic fixture, pending cited FR-05 rules:{' '}
        {guidance[changeType]}
      </p>
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
