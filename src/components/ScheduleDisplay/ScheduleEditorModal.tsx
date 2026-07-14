import { FormEvent, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ServiceTypeValue, serviceTypes } from '../../constants/serviceTypes';
import { WorshipSchedule } from '../../models/Schedule';
import { Worker, WorkerRole } from '../../models/Worker';
import { createSchedule, SaveSchedulePayload, updateSchedule } from '../../services/schedules';

interface Props {
  date: string;
  workers: Worker[];
  schedule?: WorshipSchedule;
  onClose: () => void;
  onSaved: () => void;
}

const mainRoles: WorkerRole[] = ['Leader', 'Backup', 'Acoustic', 'Electric', 'Keyboard', 'Bass', 'Drums'];
const nonMainRoles: WorkerRole[] = ['Leader', 'Acoustic', 'Bass'];
const allWorkerRoles: WorkerRole[] = [...mainRoles, 'Beatbox'];
const mainRequiredRoles: WorkerRole[] = ['Leader', 'Acoustic', 'Bass', 'Drums'];
const nonMainRequiredRoles: WorkerRole[] = ['Leader', 'Acoustic'];

const getRequiredRoles = (serviceType: ServiceTypeValue) =>
  serviceType === 'main'
    ? mainRequiredRoles
    : serviceType === 'midweek'
      ? ['Leader']
      : nonMainRequiredRoles;

const ScheduleEditorModal = ({ date, workers, schedule, onClose, onSaved }: Props) => {
  const [serviceType, setServiceType] = useState<ServiceTypeValue>(
    schedule?.serviceType ?? 'main',
  );
  const [lineup, setLineup] = useState(schedule?.lineup ?? '');
  const [notes, setNotes] = useState(schedule?.notes ?? '');
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    return (schedule?.assignments ?? []).reduce<Record<string, string>>((acc, assignment) => {
      acc[assignment.role] = assignment.workerId ?? '';
      return acc;
    }, {});
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const workersByRole = useMemo(() => {
    return allWorkerRoles.reduce<Record<string, Worker[]>>((acc, role) => {
      acc[role] = workers.filter((worker) => worker.roles.includes(role));
      return acc;
    }, {});
  }, [workers]);

  const requiredRoles = useMemo(() => {
    return new Set<WorkerRole>(getRequiredRoles(serviceType));
  }, [serviceType]);

  const visibleRoles = serviceType === 'main'
    ? mainRoles
    : serviceType === 'midweek'
      ? (['Leader', 'Bass'] as WorkerRole[])
      : nonMainRoles;
  const midweekInstrumentValue = assignments.Keyboard
    ? `Keyboard:${assignments.Keyboard}`
    : assignments.Acoustic
      ? `Acoustic:${assignments.Acoustic}`
      : '';
  const percussionValue = assignments.Beatbox
    ? `Beatbox:${assignments.Beatbox}`
    : assignments.Drums
      ? `Drums:${assignments.Drums}`
      : '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const scheduleAssignments = visibleRoles
      .map((role) => ({
        role,
        worker_id: assignments[role],
      }))
      .filter((assignment) => Boolean(assignment.worker_id));

    if (serviceType !== 'main' && percussionValue) {
      const [role, workerId] = percussionValue.split(':') as [WorkerRole, string];
      scheduleAssignments.push({ role, worker_id: workerId });
    }

    if (serviceType === 'midweek' && midweekInstrumentValue) {
      const [role, workerId] = midweekInstrumentValue.split(':') as [WorkerRole, string];
      scheduleAssignments.push({ role, worker_id: workerId });
    }

    const payload: SaveSchedulePayload = {
      date,
      service_type: serviceType,
      lineup: lineup || undefined,
      notes: notes || undefined,
      assignments: scheduleAssignments,
    };

    const missingRequiredRole = getRequiredRoles(serviceType).find(
      (role) => !assignments[role],
    );

    if (missingRequiredRole) {
      setError(`${missingRequiredRole} is required.`);
      return;
    }

    if (serviceType === 'midweek' && !midweekInstrumentValue) {
      setError('Acoustic / Keyboard is required.');
      return;
    }

    setSubmitting(true);

    try {
      if (schedule) {
        await updateSchedule(schedule.id, payload);
      } else {
        await createSchedule(payload);
      }

      onSaved();
      onClose();
    } catch {
      setError('Schedule could not be saved. Check worker conflicts and required roles.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              {schedule ? 'Edit schedule' : 'Create schedule'}
            </p>
            <h2 className="text-xl font-bold text-slate-950">{date}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close"
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
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value as ServiceTypeValue)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              {serviceTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            {visibleRoles.map((role) => (
              <label key={role} className="block">
                <span className="text-sm font-semibold text-slate-700">
                  {role}
                  {requiredRoles.has(role) && <span className="text-red-600"> *</span>}
                </span>
                <select
                  value={assignments[role] ?? ''}
                  onChange={(event) =>
                    setAssignments({ ...assignments, [role]: event.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Unassigned</option>
                  {(workersByRole[role] ?? []).map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            {serviceType === 'midweek' && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Acoustic / Keyboard <span className="text-red-600">*</span>
                </span>
                <select
                  value={midweekInstrumentValue}
                  onChange={(event) => {
                    const nextAssignments = {
                      ...assignments,
                      Acoustic: '',
                      Keyboard: '',
                    };

                    if (event.target.value) {
                      const [role, workerId] = event.target.value.split(':') as [
                        WorkerRole,
                        string,
                      ];
                      nextAssignments[role] = workerId;
                    }

                    setAssignments(nextAssignments);
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  required
                >
                  <option value="">Unassigned</option>
                  {(['Acoustic', 'Keyboard'] as WorkerRole[]).flatMap((role) =>
                    (workersByRole[role] ?? []).map((worker) => (
                      <option key={`${role}-${worker._id}`} value={`${role}:${worker._id}`}>
                        {worker.name} ({role})
                      </option>
                    )),
                  )}
                </select>
              </label>
            )}

            {serviceType !== 'main' && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Drums / Beatbox
                </span>
                <select
                  value={percussionValue}
                  onChange={(event) => {
                    const nextAssignments = {
                      ...assignments,
                      Drums: '',
                      Beatbox: '',
                    };

                    if (event.target.value) {
                      const [role, workerId] = event.target.value.split(':') as [
                        WorkerRole,
                        string,
                      ];
                      nextAssignments[role] = workerId;
                    }

                    setAssignments(nextAssignments);
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="">Unassigned</option>
                  {(['Drums', 'Beatbox'] as WorkerRole[]).flatMap((role) =>
                    (workersByRole[role] ?? []).map((worker) => (
                      <option key={`${role}-${worker._id}`} value={`${role}:${worker._id}`}>
                        {worker.name} ({role})
                      </option>
                    )),
                  )}
                </select>
              </label>
            )}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Line up</span>
            <input
              type="text"
              value={lineup}
              onChange={(event) => setLineup(event.target.value)}
              placeholder="Spotify playlist link or lineup notes"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
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
              disabled={submitting}
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save schedule'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ScheduleEditorModal;
