import axios from 'axios';
import { FormEvent, useState } from 'react';
import { FaBell, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { Meeting, SaveMeetingPayload } from '../../models/Meeting';
import { createMeeting, updateMeeting } from '../../services/meetings';

interface Props {
  date: string;
  meeting?: Meeting;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

interface ReminderInput {
  daysBefore: number;
  time: string;
}

const defaultReminders: ReminderInput[] = [
  { daysBefore: 3, time: '19:00' },
  { daysBefore: 1, time: '19:00' },
];

const MeetingEditorModal = ({ date, meeting, onClose, onSaved }: Props) => {
  const [title, setTitle] = useState(meeting?.title ?? '');
  const [meetingDate, setMeetingDate] = useState(meeting?.date ?? date);
  const [reminders, setReminders] = useState<ReminderInput[]>(() =>
    meeting
      ? meeting.reminders.map((reminder) => ({
          daysBefore: reminder.daysBefore,
          time: reminder.time,
        }))
      : defaultReminders,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateReminder = (
    index: number,
    changes: Partial<ReminderInput>,
  ) => {
    setReminders((current) =>
      current.map((reminder, reminderIndex) =>
        reminderIndex === index ? { ...reminder, ...changes } : reminder,
      ),
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const uniqueReminders = new Set(
      reminders.map((reminder) => `${reminder.daysBefore}:${reminder.time}`),
    );
    if (uniqueReminders.size !== reminders.length) {
      setError('Each reminder must use a different day and time.');
      return;
    }

    const payload: SaveMeetingPayload = {
      title: title.trim(),
      date: meetingDate,
      reminders: reminders.map((reminder) => ({
        days_before: reminder.daysBefore,
        time: reminder.time,
      })),
    };

    setSubmitting(true);
    try {
      if (meeting) {
        await updateMeeting(meeting.id, payload);
      } else {
        await createMeeting(payload);
      }
      await onSaved();
      onClose();
    } catch (requestError) {
      setError(getRequestError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-bold uppercase text-violet-700">
              {meeting ? 'Edit meeting' : 'Create meeting'}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Team calendar event
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close meeting editor"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-5 p-5">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm font-semibold text-slate-700">
            Meeting title
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Monthly worship team meeting"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Date
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-bold text-slate-950">
                  <FaBell className="text-violet-600" /> Reminders
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sent to all active team accounts using church local time.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReminders((current) => [
                    ...current,
                    { daysBefore: 0, time: '08:00' },
                  ])
                }
                disabled={reminders.length >= 10}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FaPlus /> Add reminder
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {reminders.map((reminder, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-md bg-slate-50 p-3"
                >
                  <label className="text-xs font-bold text-slate-600">
                    Days before
                    <input
                      type="number"
                      min={0}
                      max={365}
                      required
                      value={reminder.daysBefore}
                      onChange={(event) =>
                        updateReminder(index, {
                          daysBefore: Number(event.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-600">
                    Send at
                    <input
                      type="time"
                      required
                      value={reminder.time}
                      onChange={(event) =>
                        updateReminder(index, { time: event.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setReminders((current) =>
                        current.filter((_, reminderIndex) => reminderIndex !== index),
                      )
                    }
                    className="mb-0.5 rounded-md p-2.5 text-red-600 hover:bg-red-50"
                    aria-label={`Remove reminder ${index + 1}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {!reminders.length && (
                <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                  This meeting will appear on the calendar without sending reminders.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-violet-700 px-4 py-2 font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save meeting'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const getRequestError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(' ');
  }
  return 'Meeting could not be saved.';
};

export default MeetingEditorModal;
