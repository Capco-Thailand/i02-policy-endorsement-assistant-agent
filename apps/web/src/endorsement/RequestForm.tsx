'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { RequestBody } from '../lib/api';
import { useCreateRequest, usePolicy } from '../lib/queries';
import { routes } from '../lib/routes';
import { FocusHeading } from '../policies/FocusHeading';
import { DocumentUpload } from './DocumentUpload';

type ChangeType = RequestBody['changeType'];
type Row = { id: number; name: string; allocationPercent: string };
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
};

export function RequestForm({ policyId }: { policyId: string }) {
  const query = usePolicy(policyId);
  const mutation = useCreateRequest(policyId);
  const client = useQueryClient();
  const router = useRouter();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const inFlight = useRef(false);
  const nextRowId = useRef(1);
  const [submitting, setSubmitting] = useState(false);
  const [changeType, setChangeType] = useState<ChangeType | ''>('');
  const [requestedEffectiveDate, setDate] = useState('');
  const [correspondenceAddress, setAddress] = useState('');
  const [paymentFrequency, setFrequency] = useState<
    'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL'
  >('MONTHLY');
  const [riderAction, setRiderAction] = useState<'ADD' | 'REMOVE'>('ADD');
  const [beneficiaries, setBeneficiaries] = useState<Row[]>([
    { id: 0, name: '', allocationPercent: '' },
  ]);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [expiredOnSubmit, setExpiredOnSubmit] = useState(false);
  const [saved, setSaved] = useState<
    Awaited<ReturnType<typeof mutation.mutateAsync>>['request'] | null
  >(null);
  const beneficiaryReady =
    beneficiaries.length > 0 &&
    beneficiaries.every(
      (row) =>
        row.name.trim() &&
        row.allocationPercent &&
        Number.isFinite(Number(row.allocationPercent)) &&
        Number(row.allocationPercent) > 0,
    ) &&
    beneficiaries.reduce(
      (sum, row) => sum + Number(row.allocationPercent),
      0,
    ) === 100;
  const ready =
    validDate(requestedEffectiveDate) &&
    (changeType === 'BENEFICIARY'
      ? beneficiaryReady
      : changeType === 'ADDRESS'
        ? Boolean(correspondenceAddress.trim())
        : changeType === 'PAYMENT_FREQUENCY' ||
          changeType === 'ACCIDENTAL_DEATH_RIDER');

  useEffect(() => {
    if (query.error?.message === 'UNAUTHORIZED') {
      client.clear();
      router.replace(`${routes.signIn}?ended=1`);
    }
  }, [query.error, client, router]);
  useEffect(() => {
    if (!error) return;
    if (errorField) document.getElementById(errorField)?.focus();
    else errorRef.current?.focus();
  }, [error, errorField]);
  useEffect(() => {
    if (changeType) document.getElementById('change-fields-heading')?.focus();
  }, [changeType]);

  if (query.isPending)
    return (
      <>
        <FocusHeading>Loading policy…</FocusHeading>
        <p role="status">Loading policy…</p>
      </>
    );
  if (query.isError) {
    if (query.error.message === 'UNAUTHORIZED') return null;
    return (
      <>
        <FocusHeading>Policy unavailable</FocusHeading>
        <p role="alert">
          {query.error.message === 'NOT_FOUND'
            ? 'This policy is unavailable.'
            : 'Could not load policy.'}
        </p>
        {query.error.message !== 'NOT_FOUND' && (
          <button type="button" onClick={() => void query.refetch()}>
            Try again
          </button>
        )}
      </>
    );
  }
  const { policy } = query.data;
  if (policy.status !== 'ACTIVE' || expiredOnSubmit)
    return (
      <>
        <FocusHeading>Change request unavailable</FocusHeading>
        <p>{policy.id} · EXPIRED</p>
        <p role="alert">
          This policy is expired. Change requests are unavailable.
        </p>
        <Link href={routes.policy(policyId)}>Back to policy</Link>
      </>
    );

  const updateRow = (index: number, patch: Partial<Row>) =>
    setBeneficiaries((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    setErrorField('');
    const fieldError = (field: string, message: string) => {
      setErrorField(field);
      setError(message);
    };
    if (!changeType) {
      fieldError('change-type', 'Choose a change type.');
      return;
    }
    if (!validDate(requestedEffectiveDate)) {
      fieldError('requested-date', 'Enter a valid requested effective date.');
      return;
    }
    let body: RequestBody;
    if (changeType === 'BENEFICIARY') {
      const invalidName = beneficiaries.findIndex((item) => !item.name.trim());
      if (invalidName >= 0) {
        fieldError(
          `beneficiary-name-${invalidName}`,
          'Enter a beneficiary name.',
        );
        return;
      }
      const invalidAllocation = beneficiaries.findIndex(
        (item) =>
          !item.allocationPercent ||
          !Number.isFinite(Number(item.allocationPercent)) ||
          Number(item.allocationPercent) <= 0,
      );
      if (invalidAllocation >= 0) {
        fieldError(
          `allocation-${invalidAllocation}`,
          'Enter a positive allocation percentage.',
        );
        return;
      }
      const rows = beneficiaries.map((item) => ({
        name: item.name.trim(),
        allocationPercent: Number(item.allocationPercent),
      }));
      if (rows.reduce((sum, item) => sum + item.allocationPercent, 0) !== 100) {
        fieldError(
          'allocation-0',
          'Enter beneficiaries with allocations totaling exactly 100%.',
        );
        return;
      }
      body = { changeType, requestedEffectiveDate, beneficiaries: rows };
    } else if (changeType === 'ADDRESS') {
      if (!correspondenceAddress.trim()) {
        fieldError('address', 'Enter a correspondence address.');
        return;
      }
      body = {
        changeType,
        requestedEffectiveDate,
        correspondenceAddress: correspondenceAddress.trim(),
      };
    } else if (changeType === 'PAYMENT_FREQUENCY')
      body = { changeType, requestedEffectiveDate, paymentFrequency };
    else body = { changeType, requestedEffectiveDate, riderAction };
    inFlight.current = true;
    setSubmitting(true);
    try {
      const result = await mutation.mutateAsync(body);
      setSaved(result.request);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : 'API_UNAVAILABLE';
      if (code === 'POLICY_EXPIRED') {
        setExpiredOnSubmit(true);
        return;
      }
      if (code === 'INVALID_REQUESTED_EFFECTIVE_DATE') {
        fieldError('requested-date', 'Enter a valid requested effective date.');
        return;
      }
      if (code === 'INVALID_ALLOCATION' || code === 'INVALID_BENEFICIARIES') {
        fieldError(
          'allocation-0',
          'Enter beneficiaries with allocations totaling exactly 100%.',
        );
        return;
      }
      if (code === 'INVALID_CORRESPONDENCE_ADDRESS') {
        fieldError('address', 'Enter a correspondence address.');
        return;
      }
      setError(
        code === 'API_UNAVAILABLE'
          ? 'Could not record request. Try again.'
          : code === 'UNAUTHORIZED'
            ? 'Your session ended. Sign in again.'
            : code === 'NOT_FOUND'
              ? 'This policy is unavailable.'
              : 'Check the entered fields and try again.',
      );
      if (code === 'UNAUTHORIZED') {
        client.clear();
        router.replace(`${routes.signIn}?ended=1`);
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };
  return (
    <>
      <Link className="policy-back" href={routes.policy(policyId)}>
        ← Back to policy
      </Link>
      <div className="policy-heading">
        <div>
          <FocusHeading key={saved ? 'saved' : 'entry'}>
            {saved ? 'Request recorded' : 'Request a policy change'}
          </FocusHeading>
          <p className="policy-id">
            {policy.label} · {policy.id}
          </p>
        </div>
        <span className="policy-status active">ACTIVE</span>
      </div>
      {saved ? (
        <section className="request-panel" role="status">
          <h2>Pending checks</h2>
          <p>
            Your request was recorded and is pending checks. Request {saved.id}.
            No policy coverage has changed.
          </p>
          <DocumentUpload
            policyId={policyId}
            requestId={saved.id}
            changeType={saved.changeType}
          />
          <Link href={routes.policy(policyId)}>Return to policy</Link>
        </section>
      ) : (
        <form
          className="request-panel"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <p>
            Synthetic request only. Recording it does not approve a change or
            bind coverage.
          </p>
          <label htmlFor="change-type">Change type</label>
          <select
            id="change-type"
            aria-describedby={
              errorField === 'change-type' ? 'change-type-error' : undefined
            }
            value={changeType}
            onChange={(event) => {
              setChangeType(event.target.value as ChangeType | '');
              setError('');
              setErrorField('');
            }}
            required
          >
            <option value="">Choose a change</option>
            <option value="BENEFICIARY">Beneficiary</option>
            <option value="ADDRESS">Correspondence address</option>
            <option value="PAYMENT_FREQUENCY">Payment frequency</option>
            <option value="ACCIDENTAL_DEATH_RIDER">
              Accidental-death rider
            </option>
          </select>
          {errorField === 'change-type' && (
            <p id="change-type-error" role="alert" className="request-error">
              {error}
            </p>
          )}
          <label htmlFor="requested-date">Requested effective date</label>
          <input
            id="requested-date"
            aria-describedby={
              errorField === 'requested-date'
                ? 'requested-date-error'
                : 'requested-date-help'
            }
            type="date"
            value={requestedEffectiveDate}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <small id="requested-date-help">
            Required. Use a valid calendar date.
          </small>
          {errorField === 'requested-date' && (
            <p id="requested-date-error" role="alert" className="request-error">
              {error}
            </p>
          )}
          {changeType === 'BENEFICIARY' && (
            <fieldset>
              <legend>
                <span id="change-fields-heading" tabIndex={-1}>
                  Replacement beneficiaries
                </span>
              </legend>
              <p>Replace the full list. Allocations must total exactly 100%.</p>
              <p>
                Total allocation:{' '}
                {beneficiaries.reduce(
                  (sum, item) => sum + (Number(item.allocationPercent) || 0),
                  0,
                )}
                %
              </p>
              {beneficiaries.map((row, index) => (
                <div className="beneficiary-row" key={row.id}>
                  <label>
                    Beneficiary name {index + 1}
                    <input
                      id={`beneficiary-name-${index}`}
                      aria-describedby={
                        errorField === `beneficiary-name-${index}`
                          ? 'beneficiaries-error'
                          : undefined
                      }
                      value={row.name}
                      onChange={(event) =>
                        updateRow(index, { name: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Allocation percent {index + 1}
                    <input
                      id={`allocation-${index}`}
                      aria-describedby={
                        errorField === `allocation-${index}`
                          ? 'beneficiaries-error'
                          : undefined
                      }
                      type="number"
                      min="0.01"
                      max="100"
                      step="any"
                      value={row.allocationPercent}
                      onChange={(event) =>
                        updateRow(index, {
                          allocationPercent: event.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setBeneficiaries((rows) =>
                        rows.filter((_, i) => i !== index),
                      )
                    }
                    disabled={beneficiaries.length === 1}
                  >
                    Remove beneficiary {index + 1}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setBeneficiaries((rows) => [
                    ...rows,
                    {
                      id: nextRowId.current++,
                      name: '',
                      allocationPercent: '',
                    },
                  ])
                }
              >
                Add beneficiary
              </button>
              {(errorField.startsWith('allocation-') ||
                errorField.startsWith('beneficiary-name-')) && (
                <p
                  id="beneficiaries-error"
                  role="alert"
                  className="request-error"
                >
                  {error}
                </p>
              )}
            </fieldset>
          )}
          {changeType === 'ADDRESS' && (
            <fieldset>
              <legend>
                <span id="change-fields-heading" tabIndex={-1}>
                  Correspondence address change
                </span>
              </legend>
              <label htmlFor="address">Correspondence address</label>
              <textarea
                id="address"
                aria-describedby={
                  errorField === 'address' ? 'address-error' : undefined
                }
                value={correspondenceAddress}
                onChange={(event) => setAddress(event.target.value)}
                required
              />
              {errorField === 'address' && (
                <p id="address-error" role="alert" className="request-error">
                  {error}
                </p>
              )}
            </fieldset>
          )}
          {changeType === 'PAYMENT_FREQUENCY' && (
            <fieldset>
              <legend>
                <span id="change-fields-heading" tabIndex={-1}>
                  Payment frequency change
                </span>
              </legend>
              <label htmlFor="frequency">New payment frequency</label>
              <select
                id="frequency"
                value={paymentFrequency}
                onChange={(event) =>
                  setFrequency(event.target.value as typeof paymentFrequency)
                }
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="SEMI_ANNUAL">Semi-annual</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </fieldset>
          )}
          {changeType === 'ACCIDENTAL_DEATH_RIDER' && (
            <fieldset>
              <legend>
                <span id="change-fields-heading" tabIndex={-1}>
                  Accidental-death rider change
                </span>
              </legend>
              <label htmlFor="rider">Accidental-death rider action</label>
              <select
                id="rider"
                value={riderAction}
                onChange={(event) =>
                  setRiderAction(event.target.value as typeof riderAction)
                }
              >
                <option value="ADD">Add</option>
                <option value="REMOVE">Remove</option>
              </select>
            </fieldset>
          )}
          {error && !errorField && (
            <p
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="request-error"
            >
              {error}
            </p>
          )}
          {submitting && <p role="status">Recording request…</p>}
          <button
            type="submit"
            disabled={!ready || submitting || mutation.isPending}
          >
            {submitting || mutation.isPending ? 'Recording…' : 'Record request'}
          </button>
        </form>
      )}
    </>
  );
}
