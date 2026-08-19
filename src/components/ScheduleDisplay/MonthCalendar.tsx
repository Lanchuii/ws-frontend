import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { findServiceTypeOption, ServiceTypeOption } from '../../constants/serviceTypes';
import { WorshipSchedule } from '../../models/Schedule';
import { formatMonthLabel, getMonthDays, toDateKey } from '../../utils/date';

interface Props {
  monthDate: Date;
  schedules: WorshipSchedule[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  selectedDateKey?: string;
  onSelectDate: (dateKey: string) => void;
  serviceTypes: ServiceTypeOption[];
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MonthCalendar = ({
  monthDate,
  schedules,
  onPreviousMonth,
  onNextMonth,
  onToday,
  selectedDateKey,
  onSelectDate,
  serviceTypes,
}: Props) => {
  const days = getMonthDays(monthDate);
  const schedulesByDate = schedules.reduce<Record<string, WorshipSchedule[]>>((acc, schedule) => {
    const key = toDateKey(schedule.date);
    acc[key] = [...(acc[key] ?? []), schedule];
    return acc;
  }, {});
  const todayKey = toDateKey(new Date());
  const visibleServiceTypeValues = new Set(
    days.flatMap((day) => {
      if (!day) return [];

      return (schedulesByDate[toDateKey(day)] ?? []).map(
        (schedule) => schedule.serviceType,
      );
    }),
  );
  const visibleServiceTypes = [...visibleServiceTypeValues].map((value) =>
    findServiceTypeOption(value, serviceTypes),
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-950 sm:text-xl">{formatMonthLabel(monthDate)}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 sm:h-10 sm:w-10"
            aria-label="Previous month"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="h-9 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 sm:h-10 sm:px-4 sm:text-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 sm:h-10 sm:w-10"
            aria-label="Next month"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {visibleServiceTypes.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:hidden">
          {visibleServiceTypes.map((serviceType) => (
            <span
              key={serviceType.value}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600"
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black ${serviceType.badgeClassName}`}
              >
                {getServiceInitial(serviceType)}
              </span>
              {getCompactServiceLabel(serviceType)}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map((day) => (
          <div key={day} className="px-0.5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:px-2 sm:py-3 sm:text-xs">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 bg-slate-50 p-2 sm:gap-0 sm:bg-white sm:p-0">
        {days.map((day, index) => {
          const dateKey = day ? toDateKey(day) : '';
          const daySchedules = schedulesByDate[dateKey] ?? [];
          const isToday = dateKey === todayKey;
          const isSunday = day?.getDay() === 0;

          return (
            <button
              type="button"
              key={`${dateKey || 'blank'}-${index}`}
              disabled={!day}
              onClick={() => day && onSelectDate(dateKey)}
              aria-label={day ? getCalendarDayLabel(day, daySchedules, serviceTypes) : undefined}
              className={`relative aspect-square rounded-md border border-slate-200 p-1 text-left sm:aspect-auto sm:min-h-[116px] sm:rounded-none sm:border-0 sm:border-b sm:border-r sm:p-2 ${
                day ? 'bg-white' : 'bg-slate-50'
              } ${dateKey === selectedDateKey ? 'ring-2 ring-inset ring-amber-500' : ''}`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold sm:h-7 sm:w-7 sm:text-sm ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSunday
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-slate-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="absolute bottom-1 left-1 flex -space-x-1 sm:hidden">
                    {daySchedules
                      .slice(0, daySchedules.length > 3 ? 2 : 3)
                      .map((schedule) => {
                        const serviceType = findServiceTypeOption(
                          schedule.serviceType,
                          serviceTypes,
                        );

                        return (
                          <span
                            key={schedule.id}
                            className={`inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-black ${serviceType.badgeClassName}`}
                            title={getScheduleCalendarLabel(schedule, serviceTypes)}
                          >
                            {getServiceInitial(serviceType)}
                          </span>
                        );
                      })}
                    {daySchedules.length > 3 && (
                      <span className="inline-flex h-4 min-w-5 items-center justify-center rounded bg-slate-200 px-1 text-[8px] font-bold text-slate-600 ring-1 ring-white">
                        +{daySchedules.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 hidden space-y-1 sm:block">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${findServiceTypeOption(schedule.serviceType, serviceTypes).badgeClassName}`}
                        title={getScheduleCalendarLabel(schedule, serviceTypes)}
                      >
                        <span className="block truncate">
                          {getScheduleCalendarLabel(schedule, serviceTypes)}
                        </span>
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <p className="text-xs font-medium text-slate-500">
                        +{daySchedules.length - 2} more
                      </p>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const getScheduleCalendarLabel = (
  schedule: WorshipSchedule,
  serviceTypes: ServiceTypeOption[],
) => {
  const serviceLabel = findServiceTypeOption(schedule.serviceType, serviceTypes).label;
  const leader = schedule.assignments.find((assignment) => {
    return assignment.role.toLowerCase() === 'leader';
  });

  return leader?.workerName ? `${serviceLabel}: ${leader.workerName}` : serviceLabel;
};

const getServiceInitial = (serviceType: ServiceTypeOption) => {
  return serviceType.label.trim().charAt(0).toUpperCase() || '?';
};

const getCompactServiceLabel = (serviceType: ServiceTypeOption) => {
  return serviceType.label.replace(/\s+service$/i, '');
};

const getCalendarDayLabel = (
  day: Date,
  schedules: WorshipSchedule[],
  serviceTypes: ServiceTypeOption[],
) => {
  const dateLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(day);

  if (!schedules.length) return dateLabel;

  return `${dateLabel}: ${schedules
    .map((schedule) => getScheduleCalendarLabel(schedule, serviceTypes))
    .join(', ')}`;
};

export default MonthCalendar;
