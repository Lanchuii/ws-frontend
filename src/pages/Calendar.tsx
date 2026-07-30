import { useEffect, useMemo, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import AutoGenerateScheduleModal from '../components/ScheduleDisplay/AutoGenerateScheduleModal';
import BulkEditSchedulesModal from '../components/ScheduleDisplay/BulkEditSchedulesModal';
import MonthCalendar from '../components/ScheduleDisplay/MonthCalendar';
import ScheduleEditorModal from '../components/ScheduleDisplay/ScheduleEditorModal';
import ScheduleRoster from '../components/ScheduleDisplay/ScheduleRoster';
import MonthlyWorkerAssignments from '../components/ScheduleDisplay/MonthlyWorkerAssignments';
import {
  ServiceTypeOption,
  findServiceTypeOption,
  toServiceTypeOptions,
} from '../constants/serviceTypes';
import { useAuth } from '../context/useAuth';
import { WorshipSchedule } from '../models/Schedule';
import { Worker } from '../models/Worker';
import { deleteSchedule, fetchSchedules } from '../services/schedules';
import { fetchWorkers } from '../services/workers';
import {
  ServiceTypeConfiguration,
  WorkerGroup,
} from '../models/ServiceConfiguration';
import {
  fetchServiceTypes,
  fetchWorkerGroups,
} from '../services/serviceConfiguration';
import { getAssignmentForSlot } from '../utils/serviceRules';
import { formatLongDate, toDateKey } from '../utils/date';

const Calendar = () => {
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([]);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [serviceTypeConfigs, setServiceTypeConfigs] = useState<ServiceTypeConfiguration[]>([]);
  const [workerGroups, setWorkerGroups] = useState<WorkerGroup[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [showEditor, setShowEditor] = useState(false);
  const [showAutoGenerator, setShowAutoGenerator] = useState(false);
  const [bulkEditingServiceType, setBulkEditingServiceType] = useState<ServiceTypeConfiguration>();
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
    Promise.all([
      loadSchedules(),
      isAdmin ? fetchWorkers('active') : Promise.resolve([]),
      fetchServiceTypes(),
      fetchWorkerGroups(),
    ])
      .then(([, activeWorkers, configuredServiceTypes, configuredWorkerGroups]) => {
        setWorkers(activeWorkers);
        setServiceTypeConfigs(configuredServiceTypes);
        setWorkerGroups(configuredWorkerGroups);
        setError('');
      })
      .catch(() => setError('Schedules could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin]);
  const serviceTypeOptions = useMemo(
    () => toServiceTypeOptions(serviceTypeConfigs),
    [serviceTypeConfigs],
  );

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
    const serviceLabel = findServiceTypeOption(schedule.serviceType, serviceTypeOptions).label;
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
          serviceTypes={serviceTypeOptions}
        />
      )}

      {isAdmin && !loading && (
        <MonthlyWorkerAssignments
          monthDate={monthDate}
          schedules={selectedMonthSchedules}
          serviceTypes={serviceTypeOptions}
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
                serviceTypes={serviceTypeConfigs}
                serviceTypeOptions={serviceTypeOptions}
              />

              <div className="divide-y divide-slate-200 md:hidden">
                {selectedDateSchedules.map((schedule) => {
                  const serviceType = findServiceTypeOption(schedule.serviceType, serviceTypeOptions);

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

                      <ScheduleRoster
                        schedule={schedule}
                        compact
                        serviceType={serviceTypeConfigs.find(
                          (item) => item.code === schedule.serviceType,
                        )}
                      />
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
        {serviceTypeConfigs
          .filter(
            (serviceType) =>
              serviceType.is_active ||
              selectedMonthSchedules.some(
                (schedule) => schedule.serviceType === serviceType.code,
              ),
          )
          .map((serviceType) => {
          const option = findServiceTypeOption(serviceType.code, serviceTypeOptions);
          return (
          <MonthlyServiceSummary
            key={serviceType._id}
            serviceType={serviceType}
            option={option}
            schedules={selectedMonthSchedules.filter((schedule) => {
              return schedule.serviceType === serviceType.code;
            })}
            isAdmin={isAdmin}
            onBulkEdit={() => setBulkEditingServiceType(serviceType)}
          />
          );
        })}
      </section>

      {todaySchedule && (
        <p className="mt-4 text-sm text-slate-500">
          Today: {formatLongDate(todaySchedule.date)}
        </p>
      )}

      {showEditor && isAdmin && (
        <ScheduleEditorModal
          date={editingSchedule?.date ?? selectedDateKey}
          workers={workers}
          serviceTypes={serviceTypeConfigs}
          workerGroups={workerGroups}
          schedule={editingSchedule}
          onClose={() => setShowEditor(false)}
          onSaved={loadSchedules}
        />
      )}

      {showAutoGenerator && isAdmin && (
        <AutoGenerateScheduleModal
          monthDate={monthDate}
          workers={workers}
          serviceTypes={serviceTypeConfigs}
          workerGroups={workerGroups}
          onClose={() => setShowAutoGenerator(false)}
          onConfirmed={loadSchedules}
        />
      )}

      {bulkEditingServiceType && isAdmin && (
        <BulkEditSchedulesModal
          monthDate={monthDate}
          serviceType={bulkEditingServiceType}
          schedules={selectedMonthSchedules.filter((schedule) => {
            return schedule.serviceType === bulkEditingServiceType.code;
          })}
          workers={workers}
          workerGroups={workerGroups}
          onClose={() => setBulkEditingServiceType(undefined)}
          onSaved={loadSchedules}
        />
      )}
    </main>
  );
};

interface MonthlyServiceSummaryProps {
  serviceType: ServiceTypeConfiguration;
  option: ServiceTypeOption;
  schedules: WorshipSchedule[];
  isAdmin: boolean;
  onBulkEdit: () => void;
}

interface SelectedDateScheduleTableProps {
  schedules: WorshipSchedule[];
  isAdmin: boolean;
  onEdit: (schedule: WorshipSchedule) => void;
  onDelete: (schedule: WorshipSchedule) => void;
  serviceTypes: ServiceTypeConfiguration[];
  serviceTypeOptions: ServiceTypeOption[];
}

const SelectedDateScheduleTable = ({
  schedules,
  isAdmin,
  onEdit,
  onDelete,
  serviceTypes,
  serviceTypeOptions,
}: SelectedDateScheduleTableProps) => {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
            <th className="w-40 px-3 py-3 text-left">Service Type</th>
            <th className="px-3 py-3 text-left">Worker assignments</th>
            {isAdmin && <th className="w-48 px-3 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {schedules.map((schedule) => {
            const option = findServiceTypeOption(schedule.serviceType, serviceTypeOptions);
            const serviceType = serviceTypes.find((item) => item.code === schedule.serviceType);
            const slots = [...(serviceType?.assignment_slots ?? [])].sort(
              (a, b) => a.display_order - b.display_order,
            );
            const usedIndexes = new Set<number>();

            return (
              <tr key={schedule.id} className="align-top">
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${option.badgeClassName}`}
                  >
                    {option.label}
                  </span>
                  <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                    {schedule.status}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {slots.map((slot) => {
                      const assignment = getAssignmentForSlot(
                        schedule.assignments,
                        slot,
                        usedIndexes,
                      );
                      return (
                        <div key={slot.key} className="border-l-2 border-slate-200 pl-2">
                          <p className="text-xs font-bold uppercase text-slate-500">{slot.label}</p>
                          <p className="font-semibold text-slate-950">{assignment?.workerName || '-'}</p>
                        </div>
                      );
                    })}
                  </div>
                </td>
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
  option,
  schedules,
  isAdmin,
  onBulkEdit,
}: MonthlyServiceSummaryProps) => {
  const columns = [...serviceType.assignment_slots].sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-950">{option.label}</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              {schedules.length}
            </span>
            {isAdmin && schedules.length > 0 && (
              <button
                type="button"
                onClick={onBulkEdit}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                aria-label={`Bulk edit ${option.label} schedules`}
              >
                <FaEdit aria-hidden="true" />
                Edit month
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        {schedules.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className={`border-b border-slate-200 text-xs font-bold uppercase ${option.tableHeaderClassName}`}>
                    <th className="w-36 px-3 py-3 text-left">Date</th>
                    {columns.map((column) => (
                      <th key={column.key} className="px-3 py-3 text-left">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedules.map((schedule) => {
                    const usedIndexes = new Set<number>();
                    return (
                    <tr key={schedule.id} className="align-top">
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-950">
                          {formatScheduleSummaryDate(schedule.date)}
                        </p>
                      </td>
                      {columns.map((column) => {
                        const assignment = getAssignmentForSlot(
                          schedule.assignments,
                          column,
                          usedIndexes,
                        );
                        return (
                          <td key={column.key} className="px-3 py-3 font-semibold text-slate-950">
                            {assignment?.workerName || '-'}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 md:hidden">
              {schedules.map((schedule) => {
                const usedIndexes = new Set<number>();
                return (
                <article key={schedule.id} className="p-4">
                  <div className="mb-3">
                    <p className="font-bold text-slate-950">{formatLongDate(schedule.date)}</p>
                  </div>

                  <div className="space-y-2">
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200"
                      >
                        <span className="text-xs font-bold uppercase text-slate-500">
                          {column.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">
                          {getAssignmentForSlot(schedule.assignments, column, usedIndexes)?.workerName || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
                );
              })}
            </div>
          </>
        ) : (
          <p className="p-4 text-sm text-slate-600">
            No {option.label.toLowerCase()} schedules are saved for this month.
          </p>
        )}
      </div>
    </section>
  );
};

const formatScheduleSummaryDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
};

export default Calendar;
