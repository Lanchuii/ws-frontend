import axios from 'axios';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBan,
  FaCheck,
  FaExchangeAlt,
  FaHistory,
  FaTimes,
} from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { WorshipSchedule } from '../models/Schedule';
import {
  RequestAssignmentSnapshot,
  SwapMode,
  SwapOptions,
  WorkerRequest,
  WorkerRequestStatus,
  WorkerUnavailability,
} from '../models/WorkerRequest';
import { Worker } from '../models/Worker';
import { fetchMyAssignments } from '../services/schedules';
import {
  approveWorkerRequest,
  cancelWorkerRequest,
  createSwapRequest,
  createUnavailableRequest,
  fetchMyWorkerRequests,
  fetchSwapOptions,
  fetchWorkerRequests,
  fetchWorkerUnavailability,
  rejectWorkerRequest,
  respondToSwapRequest,
  removeWorkerUnavailability,
} from '../services/workerRequests';
import { fetchWorkers } from '../services/workers';
import { formatLongDate, toDateKey } from '../utils/date';

const Requests = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState<WorshipSchedule[]>([]);
  const [worker, setWorker] = useState<{ id: string; name: string } | null>(null);
  const [myRequests, setMyRequests] = useState<WorkerRequest[]>([]);
  const [reviewRequests, setReviewRequests] = useState<WorkerRequest[]>([]);
  const [unavailability, setUnavailability] = useState<WorkerUnavailability[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [reviewStatus, setReviewStatus] = useState<WorkerRequestStatus | ''>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    const assignmentResult = await fetchMyAssignments();
    setAssignments(assignmentResult.items);
    setWorker(assignmentResult.worker);

    const requestsPromise = assignmentResult.worker
      ? fetchMyWorkerRequests({ limit: 100 })
      : Promise.resolve({ items: [], pagination: emptyPagination });
    const [mine, review, unavailable, workerItems] = await Promise.all([
      requestsPromise,
      isAdmin
        ? fetchWorkerRequests({ status: reviewStatus, limit: 100 })
        : Promise.resolve({ items: [], pagination: emptyPagination }),
      isAdmin
        ? fetchWorkerUnavailability()
        : Promise.resolve({ items: [], pagination: emptyPagination }),
      isAdmin ? fetchWorkers() : Promise.resolve([]),
    ]);
    setMyRequests(mine.items);
    setReviewRequests(review.items);
    setUnavailability(unavailable.items);
    setWorkers(workerItems);
  }, [isAdmin, reviewStatus]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadData()
      .then(() => setError(''))
      .catch((requestError) => setError(getRequestError(requestError)))
      .finally(() => setLoading(false));
  }, [isAuthenticated, loadData]);

  const runAction = async (id: string, action: () => Promise<unknown>, message: string) => {
    setBusyId(id);
    setError('');
    setSuccess('');
    try {
      await action();
      await loadData();
      setSuccess(message);
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setBusyId('');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Sign in to manage requests</h1>
          <Link to="/login" className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 font-semibold text-white">
            Log in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-amber-700">Worker requests</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Schedule changes and availability</h1>
          <p className="mt-1 text-sm text-slate-600">Submit changes for your linked worker and follow each decision.</p>
        </div>
        {worker && (
          <span className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            Linked as {worker.name}
          </span>
        )}
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {loading ? (
        <p className="mt-8 text-sm text-slate-600">Loading requests...</p>
      ) : (
        <>
          {worker ? (
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <SwapRequestForm
                schedules={assignments}
                workerId={worker.id}
                initialScheduleId={searchParams.get('sourceScheduleId') ?? ''}
                initialSlotKey={searchParams.get('sourceSlotKey') ?? ''}
                onCreated={async () => {
                  await loadData();
                  setSuccess('Swap request sent to the selected worker.');
                }}
              />
              <UnavailableRequestForm
                onCreated={async () => {
                  await loadData();
                  setSuccess('Unavailable date submitted for review.');
                }}
              />
            </section>
          ) : (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-bold text-amber-950">No linked worker account</h2>
              <p className="mt-1 text-sm text-amber-800">
                An admin must link your account to a worker before you can submit personal requests.
              </p>
            </section>
          )}

          {worker && (
            <TargetResponsePanel
              requests={myRequests.filter((request) =>
                request.type === 'swap' &&
                request.target_user_id === user?._id &&
                request.status === 'pending' &&
                (request.target_response ?? 'pending') === 'pending'
              )}
              busyId={busyId}
              onRespond={(request, decision, note) => runAction(
                request._id,
                () => respondToSwapRequest(request._id, decision, note),
                decision === 'accept'
                  ? 'Swap accepted and sent for admin review.'
                  : 'Swap declined.',
              )}
            />
          )}

          {worker && (
            <RequestList
              title="Submitted by me"
              icon={<FaHistory />}
              requests={myRequests.filter((request) =>
                request.requester_user_id === user?._id
              )}
              currentUserId={user?._id ?? ''}
              busyId={busyId}
              onCancel={(request) => runAction(
                request._id,
                () => cancelWorkerRequest(request._id),
                'Request cancelled.',
              )}
            />
          )}

          {worker && (
            <RequestList
              title="All activity involving me"
              icon={<FaExchangeAlt />}
              requests={myRequests}
              currentUserId={user?._id ?? ''}
              busyId={busyId}
              onCancel={(request) => runAction(
                request._id,
                () => cancelWorkerRequest(request._id),
                'Request cancelled.',
              )}
            />
          )}

          {isAdmin && (
            <AdminReviewPanel
              requests={reviewRequests}
              status={reviewStatus}
              busyId={busyId}
              onStatusChange={setReviewStatus}
              onApprove={(request, note) => runAction(
                request._id,
                () => approveWorkerRequest(request._id, note),
                'Request approved and applied.',
              )}
              onReject={(request, note) => runAction(
                request._id,
                () => rejectWorkerRequest(request._id, note),
                'Request rejected.',
              )}
            />
          )}

          {isAdmin && (
            <UnavailableDatesPanel
              records={unavailability}
              workers={workers}
              busyId={busyId}
              onRemove={(record) => runAction(
                record._id,
                () => removeWorkerUnavailability(record._id),
                'Unavailable date removed.',
              )}
            />
          )}
        </>
      )}
    </main>
  );
};

interface SwapRequestFormProps {
  schedules: WorshipSchedule[];
  workerId: string;
  initialScheduleId: string;
  initialSlotKey: string;
  onCreated: () => Promise<void>;
}

const SwapRequestForm = ({ schedules, workerId, initialScheduleId, initialSlotKey, onCreated }: SwapRequestFormProps) => {
  const assignmentChoices = useMemo(() => schedules.flatMap((schedule) => {
    return schedule.assignments
      .filter(
        (assignment) => assignment.slotKey && assignment.workerId === workerId,
      )
      .map((assignment) => ({ schedule, assignment }));
  }), [schedules, workerId]);
  const initialChoice = assignmentChoices.find(({ schedule, assignment }) => {
    return schedule.id === initialScheduleId && (!initialSlotKey || assignment.slotKey === initialSlotKey);
  });
  const [mode, setMode] = useState<SwapMode>('replacement');
  const [sourceValue, setSourceValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [reason, setReason] = useState('');
  const [options, setOptions] = useState<SwapOptions['options']>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sourceValue && assignmentChoices.length) {
      const choice = initialChoice ?? assignmentChoices[0];
      setSourceValue(`${choice.schedule.id}::${choice.assignment.slotKey}`);
    }
  }, [assignmentChoices, initialChoice, sourceValue]);

  useEffect(() => {
    if (!sourceValue) return;
    const [scheduleId, slotKey] = sourceValue.split('::');
    setLoadingOptions(true);
    setTargetValue('');
    fetchSwapOptions(mode, scheduleId, slotKey)
      .then((result) => {
        setOptions(result.options);
        setError('');
      })
      .catch((requestError) => setError(getRequestError(requestError)))
      .finally(() => setLoadingOptions(false));
  }, [mode, sourceValue]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sourceValue || !targetValue) return;
    const [sourceScheduleId, sourceSlotKey] = sourceValue.split('::');
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'replacement') {
        await createSwapRequest({
          mode,
          source_schedule_id: sourceScheduleId,
          source_slot_key: sourceSlotKey,
          target_worker_id: targetValue,
          reason,
        });
      } else {
        const [targetScheduleId, targetSlotKey] = targetValue.split('::');
        await createSwapRequest({
          mode,
          source_schedule_id: sourceScheduleId,
          source_slot_key: sourceSlotKey,
          target_schedule_id: targetScheduleId,
          target_slot_key: targetSlotKey,
          reason,
        });
      }
      setReason('');
      setTargetValue('');
      await onCreated();
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700"><FaExchangeAlt /></span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Request a swap</h2>
          <p className="text-sm text-slate-600">Replace your assignment or exchange two serving dates.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Field label="Swap type">
          <select value={mode} onChange={(event) => setMode(event.target.value as SwapMode)} className={inputClass}>
            <option value="replacement">Replace me for one assignment</option>
            <option value="exchange">Exchange two assignments</option>
          </select>
        </Field>
        <Field label="My assignment">
          <select value={sourceValue} onChange={(event) => setSourceValue(event.target.value)} className={inputClass}>
            {assignmentChoices.map(({ schedule, assignment }) => (
              <option key={`${schedule.id}:${assignment.slotKey}`} value={`${schedule.id}::${assignment.slotKey}`}>
                {formatLongDate(schedule.date)} - {schedule.serviceType} - {assignment.role}
              </option>
            ))}
          </select>
        </Field>
        <Field label={mode === 'replacement' ? 'Replacement worker' : 'Assignment to exchange'}>
          <select value={targetValue} onChange={(event) => setTargetValue(event.target.value)} className={inputClass} disabled={loadingOptions}>
            <option value="">{loadingOptions ? 'Checking eligible options...' : 'Select an option'}</option>
            {options.map((option) => isAssignmentOption(option) ? (
              <option key={`${option.schedule_id}:${option.slot_key}`} value={`${option.schedule_id}::${option.slot_key}`}>
                {formatLongDate(option.schedule_date)} - {option.service_type} - {option.worker_name} ({option.role})
              </option>
            ) : (
              <option key={option.worker_id} value={option.worker_id}>{option.worker_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Reason (optional)">
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className={inputClass} />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={!targetValue || submitting} className={primaryButtonClass}>
        <FaExchangeAlt /> {submitting ? 'Submitting...' : 'Submit swap request'}
      </button>
    </form>
  );
};

const UnavailableRequestForm = ({ onCreated }: { onCreated: () => Promise<void> }) => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createUnavailableRequest(date, reason);
      setDate('');
      setReason('');
      await onCreated();
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-600"><FaBan /></span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Mark a date unavailable</h2>
          <p className="text-sm text-slate-600">Approval blocks assignments across every service that day.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Field label="Unavailable date">
          <input type="date" min={toDateKey(new Date())} value={date} onChange={(event) => setDate(event.target.value)} required className={inputClass} />
        </Field>
        <Field label="Reason (optional)">
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className={inputClass} />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={!date || submitting} className={primaryButtonClass}>
        <FaBan /> {submitting ? 'Submitting...' : 'Submit unavailable date'}
      </button>
    </form>
  );
};

const RequestList = ({ title, icon, requests, currentUserId, busyId, onCancel }: {
  title: string;
  icon: React.ReactNode;
  requests: WorkerRequest[];
  currentUserId: string;
  busyId: string;
  onCancel: (request: WorkerRequest) => void;
}) => (
  <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
      <span className="text-amber-700">{icon}</span>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <span className="ml-auto rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{requests.length}</span>
    </div>
    {requests.length ? (
      <div className="divide-y divide-slate-200">
        {requests.map((request) => (
          <article key={request._id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(180px,1fr)_minmax(260px,2fr)_auto] md:items-center">
            <div>
              <StatusBadge status={request.status} />
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{request.type === 'swap' ? `${request.swap_mode} swap` : 'Unavailable date'}</p>
            </div>
            <RequestDescription request={request} />
            <div className="flex justify-end">
              {request.status === 'pending' && request.requester_user_id === currentUserId && (
                <button type="button" disabled={busyId === request._id} onClick={() => onCancel(request)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    ) : <p className="px-5 py-8 text-sm text-slate-600">No requests yet.</p>}
  </section>
);

const TargetResponsePanel = ({ requests, busyId, onRespond }: {
  requests: WorkerRequest[];
  busyId: string;
  onRespond: (
    request: WorkerRequest,
    decision: 'accept' | 'decline',
    note?: string,
  ) => void;
}) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-amber-50 px-5 py-4">
        <p className="text-xs font-bold uppercase text-amber-700">Action required</p>
        <h2 className="text-xl font-bold text-slate-950">Needs your response</h2>
      </div>
      {requests.length ? (
        <div className="divide-y divide-slate-200">
          {requests.map((request) => (
            <article key={request._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <RequestDescription request={request} />
                <p className="mt-2 text-sm font-semibold text-amber-700">
                  Requested by {request.requester_worker_name}
                </p>
              </div>
              <div>
                <input
                  value={notes[request._id] ?? ''}
                  onChange={(event) => setNotes((current) => ({
                    ...current,
                    [request._id]: event.target.value,
                  }))}
                  placeholder="Response note (optional)"
                  className={inputClass}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" disabled={busyId === request._id} onClick={() => onRespond(request, 'decline', notes[request._id])} className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><FaTimes /> Decline</button>
                  <button type="button" disabled={busyId === request._id} onClick={() => onRespond(request, 'accept', notes[request._id])} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><FaCheck /> Accept</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="px-5 py-6 text-sm text-slate-600">No swaps are waiting for your response.</p>}
    </section>
  );
};

const AdminReviewPanel = ({ requests, status, busyId, onStatusChange, onApprove, onReject }: {
  requests: WorkerRequest[];
  status: WorkerRequestStatus | '';
  busyId: string;
  onStatusChange: (status: WorkerRequestStatus | '') => void;
  onApprove: (request: WorkerRequest, note?: string) => void;
  onReject: (request: WorkerRequest, note?: string) => void;
}) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-amber-700">Admin review</p>
          <h2 className="text-xl font-bold text-slate-950">Request queue</h2>
        </div>
        <select value={status} onChange={(event) => onStatusChange(event.target.value as WorkerRequestStatus | '')} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {requests.length ? <div className="divide-y divide-slate-200">{requests.map((request) => (
        <article key={request._id} className="grid gap-4 px-5 py-4 lg:grid-cols-[180px_minmax(260px,1fr)_280px] lg:items-center">
          <div><p className="font-bold text-slate-950">{request.requester_worker_name}</p><StatusBadge status={request.status} /></div>
          <RequestDescription request={request} />
          <div>
            <input value={notes[request._id] ?? ''} onChange={(event) => setNotes((items) => ({ ...items, [request._id]: event.target.value }))} placeholder="Review note (optional)" className={inputClass} />
            {(request.status === 'pending' && request.type !== 'swap') ||
            (request.status === 'pending' && request.target_response === 'accepted') ? <div className="mt-2 flex justify-end gap-2">
              <button type="button" disabled={busyId === request._id} onClick={() => onReject(request, notes[request._id])} className="inline-flex items-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><FaTimes /> Reject</button>
              <button type="button" disabled={busyId === request._id} onClick={() => onApprove(request, notes[request._id])} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><FaCheck /> Approve</button>
            </div> : request.status === 'pending' && request.type === 'swap' ? (
              <p className="mt-2 text-right text-xs font-bold uppercase text-amber-700">Awaiting target consent</p>
            ) : null}
          </div>
        </article>
      ))}</div> : <p className="px-5 py-8 text-sm text-slate-600">No requests match this filter.</p>}
    </section>
  );
};

const UnavailableDatesPanel = ({ records, workers, busyId, onRemove }: {
  records: WorkerUnavailability[];
  workers: Worker[];
  busyId: string;
  onRemove: (record: WorkerUnavailability) => void;
}) => {
  const names = new Map(workers.map((worker) => [worker._id, worker.name]));
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-xl font-bold text-slate-950">Approved unavailable dates</h2></div>
      {records.length ? <div className="divide-y divide-slate-200">{records.map((record) => (
        <div key={record._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-bold text-slate-950">{names.get(record.worker_id) ?? 'Worker'}</p><p className="text-sm text-slate-600">{formatLongDate(record.date)}{record.reason ? ` - ${record.reason}` : ''}</p></div>
          <button type="button" disabled={busyId === record._id} onClick={() => onRemove(record)} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><FaTimes /> Remove</button>
        </div>
      ))}</div> : <p className="px-5 py-8 text-sm text-slate-600">No active unavailable dates.</p>}
    </section>
  );
};

const RequestDescription = ({ request }: { request: WorkerRequest }) => {
  if (request.type === 'unavailable') {
    return <div><p className="font-bold text-slate-950">{request.unavailable_date ? formatLongDate(request.unavailable_date) : 'Unavailable date'}</p><RequestNotes request={request} /></div>;
  }
  const source = request.source_assignment;
  return <div>
    <p className="font-bold text-slate-950">{source ? `${formatLongDate(source.schedule_date)} - ${source.service_type} - ${source.role}` : 'Schedule swap'}</p>
    <p className="mt-1 text-sm text-slate-600">{request.swap_mode === 'exchange' && request.target_assignment ? `Exchange with ${request.target_assignment.worker_name} on ${formatLongDate(request.target_assignment.schedule_date)}` : `Replacement: ${request.target_worker_name ?? '-'}`}</p>
    {request.target_response && (
      <p className="mt-1 text-xs font-bold uppercase text-slate-500">
        Target response: {request.target_response}
      </p>
    )}
    <RequestNotes request={request} />
  </div>;
};

const RequestNotes = ({ request }: { request: WorkerRequest }) => (
  <div className="mt-2 space-y-1 text-sm">
    {request.reason && <p className="text-slate-600">Reason: {request.reason}</p>}
    {request.reviewer_note && <p className="text-slate-600">Review: {request.reviewer_note}</p>}
    {request.failure_reason && <p className="font-medium text-red-700">{request.failure_reason}</p>}
  </div>
);

const StatusBadge = ({ status }: { status: WorkerRequestStatus }) => {
  const classes: Record<WorkerRequestStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
    failed: 'bg-red-50 text-red-700 ring-red-200',
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${classes[status]}`}>{status}</span>;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label><span className="mb-1 block text-xs font-bold uppercase text-slate-600">{label}</span>{children}</label>;
const Alert = ({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) => <div className={`mt-5 rounded-md border px-4 py-3 text-sm font-medium ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{children}</div>;
const isAssignmentOption = (option: SwapOptions['options'][number]): option is RequestAssignmentSnapshot => 'schedule_id' in option;
const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100';
const primaryButtonClass = 'mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';
const emptyPagination = { page: 0, per_page: 20, last_page: 0, total_rows: 0 };

const getRequestError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    const blockers = error.response?.data?.errors?.blocking_schedules;
    if (typeof message === 'string' && Array.isArray(blockers) && blockers.length) {
      const schedules = blockers.map((item) => {
        return `${item.service_type} on ${formatLongDate(item.date)}`;
      });
      return `${message}: ${schedules.join(', ')}`;
    }
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return 'The request could not be completed.';
};

export default Requests;
