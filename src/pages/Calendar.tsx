import { useEffect, useMemo, useState } from 'react';
import AutoGenerateScheduleModal from '../components/ScheduleDisplay/AutoGenerateScheduleModal';
import MonthCalendar from '../components/ScheduleDisplay/MonthCalendar';
import ScheduleEditorModal from '../components/ScheduleDisplay/ScheduleEditorModal';
import ScheduleRoster from '../components/ScheduleDisplay/ScheduleRoster';
import { ServiceTypeOption, getServiceTypeOption, serviceTypes } from '../constants/serviceTypes';
import { useAuth } from '../context/useAuth';
import { WorshipSchedule } from '../models/Schedule';
import { Worker } from '../models/Worker';
import { deleteSchedule, fetchSchedules } from '../services/schedules';
import { fetchWorkers } from '../services/workers';
import { formatLongDate, toDateKey } from '../utils/date';

const mainScheduleColumns = [
  { label: 'Worship Leader', roles: ['Leader'] },
  { label: 'Back Ups', roles: ['Backup'] },
  { label: 'Main Acoustic', roles: ['Acoustic'] },
  { label: 'Electric', roles: ['Electric'] },
  { label: 'Bass', roles: ['Bass'] },
  { label: 'Keyboard', roles: ['Keyboard'] },
  { label: 'Drums', roles: ['Drums'] },
];

const nonMainScheduleColumns = [
  { label: 'Worship Leader', roles: ['Leader'] },
  { label: 'Acoustic', roles: ['Acoustic'] },
  { label: 'Bass', roles: ['Bass'] },
  { label: 'Drums / Beatbox', roles: ['Drums', 'Beatbox'] },
];

const midweekScheduleColumns = [
  { label: 'Worship Leader', roles: ['Leader'] },
  { label: 'Acoustic / Keyboard', roles: ['Acoustic', 'Keyboard'] },
  { label: 'Bass', roles: ['Bass'] },
  { label: 'Drums / Beatbox', roles: ['Drums', 'Beatbox'] },
];

const selectedDateColumns = [
  ...mainScheduleColumns.slice(0, -1),
  { label: 'Drums / Beatbox', roles: ['Drums', 'Beatbox'] },
];

const Calendar = () => {
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([]);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [showEditor, setShowEditor] = useState(false);
  const [showAutoGenerator, setShowAutoGenerator] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorshipSchedule | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();

  const loadSchedules = async () => {
    const items = await fetchSchedules();
    setSchedules(items);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([loadSchedules(), isAdmin ? fetchWorkers('active') : Promise.resolve([])])
      .then(([, activeWorkers]) => {
        setWorkers(activeWorkers);
        setError('');
      })
      .catch(() => setError('Schedules could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin]);

  const selectedMonthSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const [year, month] = schedule.date.split('-').map(Number);

      return (
        year === monthDate.getFullYear() &&
        month === monthDate.getMonth() + 1
      );
    });
  }, [monthDate, schedules]);
  const todaySchedule = schedules.find((schedule) => schedule.date === toDateKey(new Date()));
  const selectedDateSchedules = schedules.filter((schedule) => schedule.date === selectedDateKey);

  const changeMonth = (amount: number) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const handleDeleteSchedule = async (schedule: WorshipSchedule) => {
    const serviceLabel = getServiceTypeOption(schedule.serviceType).label;
    const confirmed = window.confirm(`Delete the ${serviceLabel} schedule for ${selectedDateKey}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteSchedule(schedule.id);
      await loadSchedules();
      setError('');
    } catch {
      setError('Schedule could not be deleted.');
    }
  };

  const openCreateSchedule = () => {
    setEditingSchedule(undefined);
    setShowEditor(true);
  };

  const openEditSchedule = (schedule: WorshipSchedule) => {
    setEditingSchedule(schedule);
    setShowEditor(true);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Calendar
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Monthly worship schedule</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Scan all service schedules and worker assignments in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAutoGenerator(true)}
              className="rounded-md bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Auto generate
            </button>
          )}
          <div className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            {selectedMonthSchedules.length} service{selectedMonthSchedules.length === 1 ? '' : 's'} this month
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Log in to view the calendar.
        </div>
      )}

      {loading ? (
        <div className="h-[640px] animate-pulse rounded-lg bg-slate-200" />
      ) : (
        <MonthCalendar
          monthDate={monthDate}
          schedules={schedules}
          onPreviousMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
          onToday={() => setMonthDate(new Date())}
          selectedDateKey={selectedDateKey}
          onSelectDate={setSelectedDateKey}
        />
      )}

      <section className="mt-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Selected date</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{selectedDateKey}</p>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={openCreateSchedule}
                  className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create schedule
                </button>
              </div>
            )}
          </div>
          {selectedDateSchedules.length > 0 ? (
            <div className="mt-4">
              <SelectedDateScheduleTable
                schedules={selectedDateSchedules}
                isAdmin={isAdmin}
                onEdit={openEditSchedule}
                onDelete={handleDeleteSchedule}
              />

              <div className="divide-y divide-slate-200 md:hidden">
                {selectedDateSchedules.map((schedule) => {
                  const serviceType = getServiceTypeOption(schedule.serviceType);

                  return (
                    <article key={schedule.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${serviceType.badgeClassName}`}
                          >
                            {serviceType.label}
                          </span>
                          <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                            {schedule.status}
                          </p>
                        </div>

                        {isAdmin && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEditSchedule(schedule)}
                              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                              Edit schedule
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                              Delete schedule
                            </button>
                          </div>
                        )}
                      </div>

                      <ScheduleRoster schedule={schedule} compact />
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No service is scheduled for this date.</p>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-6">
        {serviceTypes.map((serviceType) => (
          <MonthlyServiceSummary
            key={serviceType.value}
            serviceType={serviceType}
            schedules={selectedMonthSchedules.filter((schedule) => {
              return schedule.serviceType === serviceType.value;
            })}
          />
        ))}
      </section>

      {todaySchedule && (
        <p className="mt-4 text-sm text-slate-500">
          Today: {formatLongDate(todaySchedule.date)}
        </p>
      )}

      {showEditor && isAdmin && (
        <ScheduleEditorModal
          date={selectedDateKey}
          workers={workers}
          schedule={editingSchedule}
          onClose={() => setShowEditor(false)}
          onSaved={loadSchedules}
        />
      )}

      {showAutoGenerator && isAdmin && (
        <AutoGenerateScheduleModal
          monthDate={monthDate}
          workers={workers}
          onClose={() => setShowAutoGenerator(false)}
          onConfirmed={loadSchedules}
        />
      )}
    </main>
  );
};

interface MonthlyServiceSummaryProps {
  serviceType: ServiceTypeOption;
  schedules: WorshipSchedule[];
}

interface SelectedDateScheduleTableProps {
  schedules: WorshipSchedule[];
  isAdmin: boolean;
  onEdit: (schedule: WorshipSchedule) => void;
  onDelete: (schedule: WorshipSchedule) => void;
}

const SelectedDateScheduleTable = ({
  schedules,
  isAdmin,
  onEdit,
  onDelete,
}: SelectedDateScheduleTableProps) => {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
            <th className="w-40 px-3 py-3 text-left">Service Type</th>
            {selectedDateColumns.map((column) => (
              <th key={column.label} className="px-3 py-3 text-left">
                {column.label}
              </th>
            ))}
            {isAdmin && <th className="w-48 px-3 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {schedules.map((schedule) => {
            const serviceType = getServiceTypeOption(schedule.serviceType);

            return (
              <tr key={schedule.id} className="align-top">
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${serviceType.badgeClassName}`}
                  >
                    {serviceType.label}
                  </span>
                  <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                    {schedule.status}
                  </p>
                </td>
                {selectedDateColumns.map((column) => (
                  <td key={column.label} className="px-3 py-3 font-semibold text-slate-950">
                    {getWorkersForRoles(schedule, column.roles) || '-'}
                  </td>
                ))}
                {isAdmin && (
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(schedule)}
                        className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(schedule)}
                        className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const MonthlyServiceSummary = ({
  serviceType,
  schedules,
}: MonthlyServiceSummaryProps) => {
  const columns = serviceType.value === 'main'
    ? mainScheduleColumns
    : serviceType.value === 'midweek'
      ? midweekScheduleColumns
      : nonMainScheduleColumns;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{serviceType.summaryTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Workers listed by schedule date.
            </p>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
            {schedules.length}
          </span>
        </div>
      </div>

      <div>
        {schedules.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className={`border-b border-slate-200 text-xs font-bold uppercase ${serviceType.tableHeaderClassName}`}>
                    <th className="w-36 px-3 py-3 text-left">Date</th>
                    {columns.map((column) => (
                      <th key={column.label} className="px-3 py-3 text-left">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="align-top">
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-950">
                          {formatScheduleSummaryDate(schedule.date)}
                        </p>
                      </td>
                      {columns.map((column) => (
                        <td key={column.label} className="px-3 py-3 font-semibold text-slate-950">
                          {getWorkersForRoles(schedule, column.roles) || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {schedules.map((schedule) => (
                <article key={schedule.id} className="p-4">
                  <div className="mb-3">
                    <p className="font-bold text-slate-950">{formatLongDate(schedule.date)}</p>
                  </div>

                  <div className="space-y-2">
                    {columns.map((column) => (
                      <div
                        key={column.label}
                        className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200"
                      >
                        <span className="text-xs font-bold uppercase text-slate-500">
                          {column.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">
                          {getWorkersForRoles(schedule, column.roles) || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="p-4 text-sm text-slate-600">
            No {serviceType.label.toLowerCase()} schedules are saved for this month.
          </p>
        )}
      </div>
    </section>
  );
};

const getWorkersForRoles = (schedule: WorshipSchedule, roles: string[]) => {
  return schedule.assignments
    .filter((assignment) => {
      return roles.some((role) => assignment.role.toLowerCase() === role.toLowerCase());
    })
    .map((assignment) => assignment.workerName)
    .filter(Boolean)
    .join(', ');
};

const formatScheduleSummaryDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
};

export default Calendar;
