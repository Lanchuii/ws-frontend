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

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map((day) => (
          <div key={day} className="px-0.5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:px-2 sm:py-3 sm:text-xs">
            <span className="sm:hidden">{day.charAt(0)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
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
              className={`flex aspect-square flex-col items-start border-b border-r border-slate-200 p-1 text-left sm:block sm:aspect-auto sm:min-h-[116px] sm:p-2 ${
                day ? 'bg-white' : 'bg-slate-50'
              } ${dateKey === selectedDateKey ? 'sm:ring-2 sm:ring-inset sm:ring-amber-500' : ''}`}
            >
              {day && (
                <>
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 sm:rounded-md sm:text-sm ${
                        dateKey === selectedDateKey || isToday
                          ? 'bg-amber-500 text-white'
                          : isSunday
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-slate-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="mt-auto flex justify-start -space-x-1 sm:hidden">
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
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${serviceType.badgeClassName}`}
                            title={getScheduleCalendarLabel(schedule, serviceTypes)}
                          >
                            {getServiceInitial(serviceType)}
                          </span>
                        );
                      })}
                    {daySchedules.length > 3 && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-200 px-0.5 text-[8px] font-bold text-slate-600 ring-1 ring-white">
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
