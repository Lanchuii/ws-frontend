import { WorshipSchedule } from '../../models/Schedule';
import { formatMonthLabel } from '../../utils/date';

interface Props {
  monthDate: Date;
  schedules: WorshipSchedule[];
}

interface WorkerAssignmentSummary {
  key: string;
  name: string;
  assignmentCount: number;
}

const MonthlyWorkerAssignments = ({
  monthDate,
  schedules,
}: Props) => {
  const summaries = buildWorkerAssignmentSummaries(schedules);

  return (
    <section className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
      <header className="mb-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">Worker assignment counts</h3>
          <p className="text-sm font-medium text-slate-500">
            {formatMonthLabel(monthDate)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
          {summaries.length} {summaries.length === 1 ? 'worker' : 'workers'}
        </span>
      </header>

      {summaries.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <article
              key={summary.key}
              className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5"
            >
              <p className="min-w-0 break-words text-sm font-bold text-slate-950">
                {summary.name}
              </p>
              <span className="inline-flex shrink-0 items-center rounded-md bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">
                {summary.assignmentCount}{' '}
                {summary.assignmentCount === 1 ? 'time' : 'times'}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-600">
          No workers are assigned to this service this month.
        </p>
      )}
    </section>
  );
};

const buildWorkerAssignmentSummaries = (
  schedules: WorshipSchedule[],
): WorkerAssignmentSummary[] => {
  const summaries = new Map<string, WorkerAssignmentSummary>();

  schedules.forEach((schedule) => {
    const workersSeenInSchedule = new Set<string>();

    schedule.assignments.forEach((assignment) => {
      const workerName = assignment.workerName.trim();

      if (!workerName) {
        return;
      }

      const workerKey =
        assignment.workerId || `name:${workerName.toLocaleLowerCase()}`;

      if (workersSeenInSchedule.has(workerKey)) {
        return;
      }

      workersSeenInSchedule.add(workerKey);
      const current = summaries.get(workerKey) ?? {
        key: workerKey,
        name: workerName,
        assignmentCount: 0,
      };

      current.assignmentCount += 1;
      summaries.set(workerKey, current);
    });
  });

  return [...summaries.values()].sort((first, second) => {
    return (
      second.assignmentCount - first.assignmentCount ||
      first.name.localeCompare(second.name)
    );
  });
};

export default MonthlyWorkerAssignments;
