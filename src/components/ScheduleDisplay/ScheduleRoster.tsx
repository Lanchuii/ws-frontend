import { WorshipSchedule } from '../../models/Schedule';
import { ServiceTypeConfiguration } from '../../models/ServiceConfiguration';

interface Props {
  schedule: WorshipSchedule;
  compact?: boolean;
  highlightLeader?: boolean;
  serviceType?: ServiceTypeConfiguration;
}

const preferredRoles = [
  'Leader',
  'Backup',
  'Acoustic',
  'Electric',
  'Keyboard',
  'Bass',
  'Drums',
  'Beatbox',
];

const ScheduleRoster = ({ schedule, compact = false, highlightLeader = false, serviceType }: Props) => {
  const assignments = [...schedule.assignments].sort((a, b) => {
    if (serviceType) {
      const aIndex = serviceType.assignment_slots.findIndex(
        (slot) => slot.key === a.slotKey,
      );
      const bIndex = serviceType.assignment_slots.findIndex(
        (slot) => slot.key === b.slotKey,
      );

      if (aIndex >= 0 || bIndex >= 0) {
        return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
      }
    }

    return preferredRoles.indexOf(a.role) - preferredRoles.indexOf(b.role);
  });

  return (
    <div className={compact ? 'space-y-2' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
      {assignments.map((assignment, index) => (
        <div
          key={`${assignment.role}-${assignment.workerId ?? assignment.workerName}-${index}`}
          className={
            highlightLeader && assignment.role === 'Leader'
              ? 'rounded-md border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm ring-1 ring-amber-100'
              : 'rounded-md border border-slate-200 bg-white px-3 py-2'
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {serviceType?.assignment_slots.find((slot) => slot.key === assignment.slotKey)?.label ?? assignment.role}
          </p>
          <p
            className={
              highlightLeader && assignment.role === 'Leader'
                ? 'mt-1 truncate text-lg font-bold text-slate-950'
                : 'mt-1 truncate text-sm font-semibold text-slate-950'
            }
          >
            {assignment.workerName || 'Unassigned'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ScheduleRoster;
