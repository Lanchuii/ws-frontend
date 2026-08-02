import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaExternalLinkAlt,
  FaExchangeAlt,
  FaMusic,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';
import LineupEditorModal from '../components/ScheduleDisplay/LineupEditorModal';
import UpcomingSchedulePanel from '../components/ScheduleDisplay/UpcomingSchedulePanel';
import LeaderSongsEditorModal from '../components/Workers/LeaderSongsEditorModal';
import { getServiceTypeOption } from '../constants/serviceTypes';
import { useAuth } from '../context/useAuth';
import { WorshipSchedule } from '../models/Schedule';
import { WorkerRole } from '../models/Worker';
import { fetchMyAssignments, fetchSchedules } from '../services/schedules';
import { formatLongDate, getComingSunday, isSameDateKey, toDateKey } from '../utils/date';

const Home = () => {
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([]);
  const [myAssignments, setMyAssignments] = useState<WorshipSchedule[]>([]);
  const [linkedWorker, setLinkedWorker] = useState<LinkedWorker | null>(null);
  const [showSongEditor, setShowSongEditor] = useState(false);
  const [lineupSchedule, setLineupSchedule] = useState<WorshipSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();
  const comingSunday = useMemo(() => getComingSunday(), []);
  const comingSundayKey = toDateKey(comingSunday);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchSchedules(),
      isAdmin ? Promise.resolve(null) : fetchMyAssignments(),
    ])
      .then(([items, assignmentsResult]) => {
        setSchedules(items);
        setMyAssignments(assignmentsResult?.items ?? []);
        setLinkedWorker(assignmentsResult?.worker ?? null);
        setError('');
      })
      .catch(() => {
        setError('Schedules could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin]);

  const upcomingSchedule = schedules.find((schedule) => {
    return isSameDateKey(schedule.date, comingSundayKey);
  });
  const activeSchedules = schedules.filter((schedule) => schedule.status === 'active');
  const todayKey = toDateKey(new Date());
  const nextSchedules = schedules
    .filter((schedule) => schedule.date >= todayKey)
    .slice(0, 3);
  const memberAssignments = myAssignments.filter((schedule) => schedule.date >= todayKey);

  const handleLineupSaved = (updatedSchedule: WorshipSchedule) => {
    const replaceSchedule = (schedule: WorshipSchedule) => {
      return schedule.id === updatedSchedule.id ? updatedSchedule : schedule;
    };

    setSchedules((items) => items.map(replaceSchedule));
    setMyAssignments((items) => items.map(replaceSchedule));
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <UpcomingSchedulePanel
          schedule={upcomingSchedule}
          targetDate={comingSunday}
          loading={loading}
        />
        <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <FaClock className="text-amber-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">Coming Sunday</p>
            <p className="mt-1 text-lg font-bold text-slate-950">{formatLongDate(comingSunday)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <FaCalendarAlt className="text-amber-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">Active Schedules</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{activeSchedules.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <FaUsers className="text-amber-600" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              {isAuthenticated && !isAdmin ? 'My Upcoming Services' : 'Upcoming Services'}
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-950">
              {isAuthenticated && !isAdmin ? memberAssignments.length : nextSchedules.length}
            </p>
          </div>
        </aside>
      </section>

      {!isAuthenticated && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Log in to view schedules and open the calendar.</span>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Log in
                <FaArrowRight />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {isAuthenticated && !isAdmin ? (
        <MemberAssignmentsPanel
          schedules={memberAssignments}
          worker={linkedWorker}
          onEditSongs={() => setShowSongEditor(true)}
          onEditLineup={setLineupSchedule}
        />
      ) : (
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Next services</h2>
            <p className="text-sm text-slate-600">A quick list before jumping into the calendar.</p>
          </div>
          <Link to="/calendar" className="text-sm font-bold text-amber-700 hover:text-amber-800">
            View month
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-200">
          {nextSchedules.length > 0 ? (
            nextSchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-bold text-slate-950">{formatLongDate(schedule.date)}</p>
                  <p className="text-sm capitalize text-slate-500">{schedule.serviceType} service</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                  {schedule.status}
                </span>
              </div>
            ))
          ) : (
            <p className="py-5 text-sm text-slate-600">No upcoming schedules are saved yet.</p>
          )}
        </div>
      </section>
      )}

      {showSongEditor && linkedWorker && (
        <LeaderSongsEditorModal
          onClose={() => setShowSongEditor(false)}
        />
      )}

      {lineupSchedule && (
        <LineupEditorModal
          schedule={lineupSchedule}
          onClose={() => setLineupSchedule(null)}
          onSaved={handleLineupSaved}
        />
      )}
    </main>
  );
};

interface LinkedWorker {
  id: string;
  name: string;
  roles: WorkerRole[];
}

interface MemberAssignmentsPanelProps {
  schedules: WorshipSchedule[];
  worker: LinkedWorker | null;
  onEditSongs: () => void;
  onEditLineup: (schedule: WorshipSchedule) => void;
}

const MemberAssignmentsPanel = ({
  schedules,
  worker,
  onEditSongs,
  onEditLineup,
}: MemberAssignmentsPanelProps) => {
  const isLeader = worker?.roles.includes('Leader');

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
            <FaUserCheck />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-950">My serving dates</h2>
            <p className="text-sm text-slate-600">
              {worker
                ? `Upcoming assignments for ${worker.name}.`
                : 'Your upcoming worship team assignments.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/requests?action=unavailable"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FaCalendarAlt />
            Mark unavailable
          </Link>
          {isLeader && (
            <button
              type="button"
              onClick={onEditSongs}
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-50"
            >
              <FaMusic />
              Edit songs
            </button>
          )}
          <Link
            to="/calendar"
            className="rounded-md px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 hover:text-amber-800"
          >
            View calendar
          </Link>
        </div>
      </div>

      {!worker ? (
        <div className="px-5 py-8 text-center">
          <p className="font-bold text-slate-950">Your account is not linked to a worker yet.</p>
          <p className="mt-1 text-sm text-slate-600">
            Ask an admin to link your member account from the Workers page.
          </p>
        </div>
      ) : schedules.length > 0 ? (
        <div className="divide-y divide-slate-200">
          {schedules.map((schedule) => {
            const serviceType = getServiceTypeOption(schedule.serviceType);
            const assignedEntries = schedule.assignments.filter(
              (assignment) => assignment.workerId === worker.id,
            );
            const roles = assignedEntries.map((assignment) => assignment.role);
            const isAssignedLeader = roles.includes('Leader');

            return (
              <article
                key={schedule.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto] sm:items-center"
              >
                <div>
                  <p className="font-bold text-slate-950">{formatLongDate(schedule.date)}</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${serviceType.badgeClassName}`}>
                    {serviceType.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Serving as</p>
                  <p className="mt-1 font-semibold text-slate-950">{roles.join(', ') || 'Assigned worker'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Link
                    to={`/requests?sourceScheduleId=${encodeURIComponent(schedule.id)}${assignedEntries.length === 1 && assignedEntries[0].slotKey ? `&sourceSlotKey=${encodeURIComponent(assignedEntries[0].slotKey)}` : ''}`}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <FaExchangeAlt />
                    Request swap
                  </Link>
                  {schedule.lineup && /^https?:\/\//i.test(schedule.lineup) ? (
                    <a
                      href={schedule.lineup}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800"
                    >
                      Line up
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  ) : schedule.lineup ? (
                    <span className="text-sm font-semibold text-slate-700">
                      {schedule.lineup}
                    </span>
                  ) : null}
                  {isAssignedLeader && (
                    <button
                      type="button"
                      onClick={() => onEditLineup(schedule)}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FaEdit />
                      {schedule.lineup ? 'Edit lineup' : 'Add lineup'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-slate-600">
          You have no upcoming serving dates.
        </p>
      )}
    </section>
  );
};

export default Home;
