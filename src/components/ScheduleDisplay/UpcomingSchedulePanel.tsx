import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarDay, FaEdit, FaExternalLinkAlt, FaMusic } from 'react-icons/fa';
import { WorshipSchedule } from '../../models/Schedule';
import { formatLongDate } from '../../utils/date';
import ScheduleRoster from './ScheduleRoster';

interface Props {
  schedule?: WorshipSchedule;
  targetDate: Date;
  loading: boolean;
  canManageLineup?: boolean;
  onManageLineup?: (schedule: WorshipSchedule) => void;
}

const UpcomingSchedulePanel = ({ schedule, targetDate, loading, canManageLineup, onManageLineup }: Props) => {
  if (loading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (!schedule) {
    return (
      <section className="rounded-lg border border-dashed border-amber-300 bg-white p-8 text-center shadow-sm">
        <FaCalendarDay className="mx-auto text-4xl text-amber-500" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-amber-700">
          Coming Sunday
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">No schedule yet</h1>
        <p className="mt-2 text-sm text-slate-600">
          There is no saved schedule for {formatLongDate(targetDate)}.
        </p>
        <Link
          to="/calendar"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open Calendar
          <FaArrowRight />
        </Link>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-slate-50 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-amber-500 text-xl text-white shadow-sm">
              <FaCalendarDay />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                Coming Sunday
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950 sm:text-4xl">
                {formatLongDate(schedule.date)}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Worship team assignment for the next Sunday service.
              </p>
            </div>
          </div>

          <Link
            to="/calendar"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open Calendar
            <FaArrowRight />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Team Roster
            </p>
            <h2 className="text-xl font-bold text-slate-950">Assigned workers</h2>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700 ring-1 ring-amber-200">
            {schedule.status}
          </span>
          {canManageLineup && onManageLineup && (
            <button type="button" onClick={() => onManageLineup(schedule)} className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white sm:mt-0">
              <FaEdit /> {schedule.songs.length || schedule.lineup ? 'Edit lineup' : 'Add lineup'}
            </button>
          )}
        </div>
        <ScheduleRoster schedule={schedule} highlightLeader />

        {schedule.lineup && (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
              Line up
            </p>
            {isUrl(schedule.lineup) ? (
              <a
                href={schedule.lineup}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-950 underline decoration-amber-400 underline-offset-4 hover:text-amber-700"
              >
                Open playlist
                <FaExternalLinkAlt className="text-xs" />
              </a>
            ) : (
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {schedule.lineup}
              </p>
            )}
          </div>
        )}

        {schedule.songs.length > 0 && (
          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <FaMusic className="text-amber-600" />
              Songs
            </div>
            <div className="flex flex-wrap gap-2">
              {schedule.songs.map((song, index) => (
                <span
                  key={`${song.title}-${index}`}
                  className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {song.title}{song.artist ? ` — ${song.artist}` : ''}{song.key ? ` (${song.key})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const isUrl = (value: string) => /^https?:\/\//i.test(value);

export default UpcomingSchedulePanel;
