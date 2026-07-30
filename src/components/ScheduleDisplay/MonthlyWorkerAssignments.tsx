import { FaUsers } from 'react-icons/fa';
import {
  findServiceTypeOption,
  ServiceTypeOption,
} from '../../constants/serviceTypes';
import { WorshipSchedule } from '../../models/Schedule';
import { formatMonthLabel } from '../../utils/date';

interface Props {
  monthDate: Date;
  schedules: WorshipSchedule[];
  serviceTypes: ServiceTypeOption[];
}

interface WorkerAssignmentSummary {
  key: string;
  name: string;
  assignmentCount: number;
  serviceCounts: Map<string, number>;
}

const MonthlyWorkerAssignments = ({
  monthDate,
  schedules,
  serviceTypes,
}: Props) => {
  const summaries = buildWorkerAssignmentSummaries(schedules);

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
            <FaUsers />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-950">
              Worker assignments
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {formatMonthLabel(monthDate)}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
          {summaries.length} {summaries.length === 1 ? 'worker' : 'workers'}
        </span>
      </header>

      {summaries.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Worker</th>
                  <th className="px-5 py-3">Services</th>
                  <th className="w-40 px-5 py-3 text-right">Times assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summaries.map((summary) => (
                  <tr key={summary.key}>
                    <td className="px-5 py-4 font-bold text-slate-950">
                      {summary.name}
                    </td>
                    <td className="px-5 py-4">
                      <ServiceCounts
                        counts={summary.serviceCounts}
                        serviceTypes={serviceTypes}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 font-bold text-white">
                        {summary.assignmentCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {summaries.map((summary) => (
              <article key={summary.key} className="px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 break-words font-bold text-slate-950">
                    {summary.name}
                  </p>
                  <span className="inline-flex shrink-0 items-center rounded-md bg-slate-950 px-3 py-1.5 text-sm font-bold text-white">
                    {summary.assignmentCount}{' '}
                    {summary.assignmentCount === 1 ? 'time' : 'times'}
                  </span>
                </div>
                <div className="mt-3">
                  <ServiceCounts
                    counts={summary.serviceCounts}
                    serviceTypes={serviceTypes}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-slate-600">
          No workers are assigned this month.
        </p>
      )}
    </section>
  );
};

const ServiceCounts = ({
  counts,
  serviceTypes,
}: {
  counts: Map<string, number>;
  serviceTypes: ServiceTypeOption[];
}) => (
  <div className="flex flex-wrap gap-2">
    {[...counts.entries()]
      .sort(([first], [second]) => {
        const firstIndex = serviceTypes.findIndex((item) => item.value === first);
        const secondIndex = serviceTypes.findIndex((item) => item.value === second);
        return normalizedIndex(firstIndex) - normalizedIndex(secondIndex);
      })
      .map(([serviceType, count]) => {
        const option = findServiceTypeOption(serviceType, serviceTypes);

        return (
          <span
            key={serviceType}
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${option.badgeClassName}`}
          >
            {option.label} {count}
          </span>
        );
      })}
  </div>
);

const normalizedIndex = (index: number) => {
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
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
        serviceCounts: new Map<string, number>(),
      };

      current.assignmentCount += 1;
      current.serviceCounts.set(
        schedule.serviceType,
        (current.serviceCounts.get(schedule.serviceType) ?? 0) + 1,
      );
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
