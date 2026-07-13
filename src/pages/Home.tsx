import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import UpcomingSchedulePanel from '../components/ScheduleDisplay/UpcomingSchedulePanel';
import { useAuth } from '../context/useAuth';
import { WorshipSchedule } from '../models/Schedule';
import { fetchSchedules } from '../services/schedules';
import { formatLongDate, getComingSunday, isSameDateKey, toDateKey } from '../utils/date';

const Home = () => {
  const [schedules, setSchedules] = useState<WorshipSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const comingSunday = useMemo(() => getComingSunday(), []);
  const comingSundayKey = toDateKey(comingSunday);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchSchedules()
      .then((items) => {
        setSchedules(items);
        setError('');
      })
      .catch(() => {
        setError('Schedules could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const upcomingSchedule = schedules.find((schedule) => {
    return isSameDateKey(schedule.date, comingSundayKey);
  });
  const activeSchedules = schedules.filter((schedule) => schedule.status === 'active');
  const todayKey = toDateKey(new Date());
  const nextSchedules = schedules
    .filter((schedule) => schedule.date >= todayKey)
    .slice(0, 3);

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
            <p className="mt-3 text-sm font-medium text-slate-500">Upcoming Services</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{nextSchedules.length}</p>
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
    </main>
  );
};

export default Home;
