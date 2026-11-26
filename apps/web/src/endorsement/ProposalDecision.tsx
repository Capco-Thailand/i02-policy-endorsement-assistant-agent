import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

type Props = {
  onDecide: (decision: 'APPROVED' | 'REJECTED') => void;
  isPending: boolean;
  isError: boolean;
};

export function ProposalDecision({ onDecide, isPending, isError }: Props) {
  const [confirming, setConfirming] = useState(false);
  const rejectButton = useRef<HTMLButtonElement>(null);
  const restoreRejectFocus = useRef(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const savingStatus = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (confirming) confirmButton.current?.focus();
    else if (restoreRejectFocus.current) {
      restoreRejectFocus.current = false;
      rejectButton.current?.focus();
    }
  }, [confirming]);
  useEffect(() => {
    if (isPending) savingStatus.current?.focus();
  }, [isPending]);
  const cancel = () => {
    restoreRejectFocus.current = true;
    setConfirming(false);
  };
  return (
    <section
      className="request-panel proposal-decision-panel"
      aria-labelledby="decision-heading"
    >
      <h2 id="decision-heading">Your decision</h2>
      <p>
        Approval records your decision only. Your policy and coverage stay
        unchanged.
      </p>
      {isError && (
        <p role="alert">Your decision was not recorded. Try again.</p>
      )}
      {isPending && (
        <p ref={savingStatus} role="status" tabIndex={-1}>
          Recording your decision…
        </p>
      )}
      <div className="proposal-decision-actions" inert={confirming}>
        <Button
          type="button"
          disabled={isPending}
          onClick={() => onDecide('APPROVED')}
        >
          Approve proposal
        </Button>
        <Button
          type="button"
          ref={rejectButton}
          variant="outline"
          disabled={isPending}
          onClick={() => setConfirming(true)}
        >
          Reject proposal
        </Button>
      </div>
      {confirming && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reject-title"
          aria-describedby="reject-description"
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancel();
            if (event.key === 'Tab') {
              event.preventDefault();
              if (event.shiftKey) {
                (document.activeElement === cancelButton.current
                  ? confirmButton
                  : cancelButton
                ).current?.focus();
              } else {
                (document.activeElement === confirmButton.current
                  ? cancelButton
                  : confirmButton
                ).current?.focus();
              }
            }
          }}
        >
          <h3 id="reject-title">Reject proposal?</h3>
          <p id="reject-description">
            Rejecting records your decision and does not change your policy or
            coverage.
          </p>
          <Button
            type="button"
            ref={cancelButton}
            variant="outline"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            ref={confirmButton}
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              setConfirming(false);
              onDecide('REJECTED');
            }}
          >
            Confirm rejection
          </Button>
        </div>
      )}
    </section>
  );
}
