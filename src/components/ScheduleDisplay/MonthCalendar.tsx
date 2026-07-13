import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getServiceTypeOption } from '../../constants/serviceTypes';
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
}: Props) => {
  const days = getMonthDays(monthDate);
  const schedulesByDate = schedules.reduce<Record<string, WorshipSchedule[]>>((acc, schedule) => {
    const key = toDateKey(schedule.date);
    acc[key] = [...(acc[key] ?? []), schedule];
    return acc;
  }, {});
  const todayKey = toDateKey(new Date());

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-950">{formatMonthLabel(monthDate)}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Previous month"
          >
            <FaChevronLeft />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Next month"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs font-bold uppercase text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
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
              className={`min-h-[116px] border-b border-r border-slate-200 p-2 text-left ${
                day ? 'bg-white' : 'bg-slate-50'
              } ${dateKey === selectedDateKey ? 'ring-2 ring-inset ring-amber-500' : ''}`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold ${
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

                  <div className="mt-2 space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${getServiceTypeOption(schedule.serviceType).badgeClassName}`}
                        title={getScheduleCalendarLabel(schedule)}
                      >
                        <span className="block truncate">
                          {getScheduleCalendarLabel(schedule)}
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

const getScheduleCalendarLabel = (schedule: WorshipSchedule) => {
  const serviceLabel = getServiceTypeOption(schedule.serviceType).label;
  const leader = schedule.assignments.find((assignment) => {
    return assignment.role.toLowerCase() === 'leader';
  });

  return leader?.workerName ? `${serviceLabel}: ${leader.workerName}` : serviceLabel;
};

export default MonthCalendar;
