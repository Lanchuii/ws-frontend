import { WorshipSchedule } from '../../models/Schedule';

interface Props {
  schedule: WorshipSchedule;
  compact?: boolean;
  highlightLeader?: boolean;
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

const ScheduleRoster = ({ schedule, compact = false, highlightLeader = false }: Props) => {
  const assignments = [...schedule.assignments].sort((a, b) => {
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
            {assignment.role}
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
