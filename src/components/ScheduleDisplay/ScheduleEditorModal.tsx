import axios from 'axios';
import { FormEvent, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  ServiceTypeConfiguration,
  WorkerGroup,
} from '../../models/ServiceConfiguration';
import { WorshipSchedule } from '../../models/Schedule';
import { Worker, WorkerRole } from '../../models/Worker';
import {
  createSchedule,
  SaveSchedulePayload,
  updateSchedule,
} from '../../services/schedules';
import {
  getAssignmentsForSlot,
  getSlotEligibility,
  isWorkerEligible,
} from '../../utils/serviceRules';

interface Props {
  date: string;
  workers: Worker[];
  serviceTypes: ServiceTypeConfiguration[];
  workerGroups: WorkerGroup[];
  schedule?: WorshipSchedule;
  onClose: () => void;
  onSaved: () => void;
}

interface SlotSelection {
  role: WorkerRole;
  workerId: string;
}

const ScheduleEditorModal = ({
  date,
  workers,
  serviceTypes,
  workerGroups,
  schedule,
  onClose,
  onSaved,
}: Props) => {
  const scheduleWeekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const eligibleServiceTypes = serviceTypes.filter(
    (item) =>
      item.is_active &&
      (item.recurrence.type === 'once' ||
        item.recurrence.weekday === scheduleWeekday),
  );
  const initialServiceType =
    serviceTypes.find((item) => item.code === schedule?.serviceType) ??
    eligibleServiceTypes[0];
  const [serviceTypeCode, setServiceTypeCode] = useState(
    initialServiceType?.code ?? 'main',
  );
  const [lineup, setLineup] = useState(schedule?.lineup ?? '');
  const [notes, setNotes] = useState(schedule?.notes ?? '');
  const [selections, setSelections] = useState<Record<string, SlotSelection[]>>(
    () => buildInitialSelections(schedule, initialServiceType),
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const serviceType = serviceTypes.find(
    (item) => item.code === serviceTypeCode,
  );
  const slots = useMemo(
    () =>
      [...(serviceType?.assignment_slots ?? [])].sort(
        (a, b) => a.display_order - b.display_order,
      ),
    [serviceType],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!serviceType) {
      setError('Select an active service type.');
      return;
    }

    const missingSlot = slots.find(
      (slot) => slot.required && !selections[slot.key]?.length,
    );

    if (missingSlot) {
      setError(`${missingSlot.label} is required.`);
      return;
    }

    const payload: SaveSchedulePayload = {
      date,
      service_type: serviceType.code,
      lineup: lineup || undefined,
      notes: notes || undefined,
      assignments: slots.flatMap((slot) =>
        (selections[slot.key] ?? []).map((selection) => ({
          slot_key: slot.key,
          role: selection.role,
          worker_id: selection.workerId,
        })),
      ),
    };

    setSubmitting(true);

    try {
      if (schedule) {
        await updateSchedule(schedule.id, payload);
      } else {
        await createSchedule(payload);
      }

      await onSaved();
      onClose();
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-700">
              {schedule ? 'Edit schedule' : 'Create schedule'}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{date}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close schedule editor"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Service type</span>
            <select
              value={serviceTypeCode}
              onChange={(event) => {
                setServiceTypeCode(event.target.value);
                setSelections({});
              }}
              disabled={Boolean(schedule)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
            >
              {eligibleServiceTypes.map((item) => (
                <option key={item._id} value={item.code}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            {slots.map((slot) => {
              const eligibility = getSlotEligibility(
                slot,
                serviceType!.worker_eligibility,
              );
              const options = workers
                .filter(
                  (worker) =>
                    worker.status === 'active' &&
                    slot.allowed_roles.some((role) =>
                      worker.roles.includes(role),
                    ) &&
                    isWorkerEligible(worker, eligibility, workerGroups),
                )
                .flatMap((worker) =>
                  slot.allowed_roles
                    .filter((role) => worker.roles.includes(role))
                    .map((role) => ({ worker, role })),
                );
              const slotSelections = selections[slot.key] ?? [];
              const selection = slotSelections[0];

              return (
                <label key={slot.key} className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    {slot.label}
                    {slot.required && <span className="text-red-600"> *</span>}
                  </span>
                  {slot.allow_multiple ? (
                    <div className="mt-1 max-h-44 space-y-1 overflow-auto rounded-md border border-slate-300 bg-white p-2">
                      {options.map(({ worker, role }) => {
                        const checked = slotSelections.some(
                          (item) => item.workerId === worker._id && item.role === role,
                        );
                        return (
                          <label key={`${role}-${worker._id}`} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const nextSelections = checked
                                  ? slotSelections.filter(
                                      (item) => item.workerId !== worker._id || item.role !== role,
                                    )
                                  : [...slotSelections, { role, workerId: worker._id }];
                                setSelections({ ...selections, [slot.key]: nextSelections });
                              }}
                              className="h-4 w-4 accent-amber-600"
                            />
                            {worker.name}
                            {slot.allowed_roles.length > 1 ? ` (${role})` : ''}
                          </label>
                        );
                      })}
                      {!options.length && <p className="px-2 py-1 text-sm text-slate-500">No eligible workers</p>}
                    </div>
                  ) : (
                    <select
                      value={selection ? `${selection.role}:${selection.workerId}` : ''}
                      onChange={(event) => {
                        if (!event.target.value) {
                          const next = { ...selections };
                          delete next[slot.key];
                          setSelections(next);
                          return;
                        }

                        const [role, workerId] = event.target.value.split(':') as [WorkerRole, string];
                        setSelections({ ...selections, [slot.key]: [{ role, workerId }] });
                      }}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    >
                      <option value="">Unassigned</option>
                      {options.map(({ worker, role }) => (
                        <option key={`${role}-${worker._id}`} value={`${role}:${worker._id}`}>
                          {worker.name}{slot.allowed_roles.length > 1 ? ` (${role})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              );
            })}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Line up</span>
            <input
              value={lineup}
              onChange={(event) => setLineup(event.target.value)}
              placeholder="Spotify playlist link or lineup notes"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !serviceType}
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save schedule'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const buildInitialSelections = (
  schedule: WorshipSchedule | undefined,
  serviceType: ServiceTypeConfiguration | undefined,
) => {
  if (!schedule || !serviceType) {
    return {};
  }

  const usedIndexes = new Set<number>();
  return serviceType.assignment_slots.reduce<Record<string, SlotSelection[]>>(
    (result, slot) => {
      const assignments = getAssignmentsForSlot(
        schedule.assignments,
        slot,
        usedIndexes,
      );
      result[slot.key] = assignments
        .filter((assignment) => assignment.workerId)
        .map((assignment) => ({
          role: assignment.role as WorkerRole,
          workerId: assignment.workerId as string,
        }));
      return result;
    },
    {},
  );
};

const getRequestError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      'Schedule could not be saved. Check the configured rules.'
    );
  }

  return 'Schedule could not be saved. Check the configured rules.';
};

export default ScheduleEditorModal;
