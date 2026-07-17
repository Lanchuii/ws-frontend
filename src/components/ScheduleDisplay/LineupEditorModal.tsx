import { FormEvent, useState } from 'react';
import { FaLink, FaTimes } from 'react-icons/fa';
import { WorshipSchedule } from '../../models/Schedule';
import { updateScheduleLineup } from '../../services/schedules';
import { formatLongDate } from '../../utils/date';

interface Props {
  schedule: WorshipSchedule;
  onClose: () => void;
  onSaved: (schedule: WorshipSchedule) => void;
}

const LineupEditorModal = ({ schedule, onClose, onSaved }: Props) => {
  const [lineup, setLineup] = useState(schedule.lineup ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const updatedSchedule = await updateScheduleLineup(schedule.id, lineup);
      onSaved(updatedSchedule);
      onClose();
    } catch {
      setError('The lineup could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-amber-700">
              <FaLink />
              Schedule lineup
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {formatLongDate(schedule.date)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close lineup editor"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Line up</span>
            <input
              value={lineup}
              onChange={(event) => setLineup(event.target.value)}
              maxLength={2048}
              placeholder="Spotify playlist link"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save lineup'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LineupEditorModal;
