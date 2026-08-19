import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import {
  previewScheduleReminders,
  ScheduleReminderPreview,
  sendScheduleReminders,
} from '../../services/notifications';
import { formatLongDate, toDateKey } from '../../utils/date';

const mondayFor = (value = new Date()) => {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const distance = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - distance);
  return toDateKey(date);
};

const ScheduleReminderModal = ({ onClose }: { onClose: () => void }) => {
  const [weekStart, setWeekStart] = useState(mondayFor);
  const [preview, setPreview] = useState<ScheduleReminderPreview>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await previewScheduleReminders(weekStart);
      setPreview(result);
      setSelected(new Set(result.recipients.map((item) => item.user_id)));
    } catch {
      setPreview(undefined);
      setError('The reminder preview could not be loaded. Choose a Monday.');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { void loadPreview(); }, [loadPreview]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const result = await sendScheduleReminders(weekStart, [...selected]);
      setSuccess(`Reminder sent to ${result.notified_users} user${result.notified_users === 1 ? '' : 's'}. ${result.sent} push device${result.sent === 1 ? '' : 's'} reached.`);
    } catch {
      setError('The selected reminders could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div><p className="text-sm font-bold uppercase text-amber-700">Schedule reminders</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Notify selected users</h2></div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close reminder modal"><FaTimes /></button>
        </header>
        <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-semibold text-slate-700">Week starting Monday<input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
            <button type="button" onClick={() => void loadPreview()} disabled={loading} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">{loading ? 'Loading…' : 'Preview'}</button>
          </div>
          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          {success && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{success}</p>}
          {preview && <div className="mt-5">
            <div className="flex items-center justify-between"><p className="font-bold text-slate-950">Eligible recipients ({preview.recipients.length})</p><button type="button" onClick={() => setSelected(selected.size === preview.recipients.length ? new Set() : new Set(preview.recipients.map((item) => item.user_id)))} className="text-sm font-bold text-amber-700">{selected.size === preview.recipients.length ? 'Clear all' : 'Select all'}</button></div>
            <div className="mt-3 divide-y divide-slate-200 rounded-md border border-slate-200">
              {preview.recipients.length ? preview.recipients.map((recipient) => <label key={recipient.user_id} className="flex gap-3 p-4 hover:bg-slate-50"><input type="checkbox" checked={selected.has(recipient.user_id)} onChange={() => setSelected((current) => { const next = new Set(current); next.has(recipient.user_id) ? next.delete(recipient.user_id) : next.add(recipient.user_id); return next; })} className="mt-1" /><span><span className="block font-bold text-slate-950">{recipient.worker_name}</span>{recipient.schedules.map((schedule) => <span key={schedule.schedule_id} className="mt-1 block text-sm text-slate-600">{formatLongDate(schedule.date)} · {schedule.service_type} · {schedule.roles.join(', ')}</span>)}</span></label>) : <p className="p-5 text-sm text-slate-600">No linked users have assignments this week.</p>}
            </div>
          </div>}
          <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700">Close</button><button type="submit" disabled={!selected.size || sending} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-50"><FaBell />{sending ? 'Sending…' : `Send to ${selected.size}`}</button></div>
        </form>
      </section>
    </div>
  );
};

export default ScheduleReminderModal;
