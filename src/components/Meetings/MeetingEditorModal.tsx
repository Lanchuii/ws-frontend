import axios from 'axios';
import { Dispatch, FormEvent, SetStateAction, useMemo, useState } from 'react';
import {
  FaBell,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUsers,
} from 'react-icons/fa';
import { Meeting, MeetingAudienceMode, SaveMeetingPayload } from '../../models/Meeting';
import { WorkerGroup } from '../../models/ServiceConfiguration';
import { Worker } from '../../models/Worker';
import { createMeeting, updateMeeting } from '../../services/meetings';

interface Props {
  date: string;
  meeting?: Meeting;
  workers: Worker[];
  workerGroups: WorkerGroup[];
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

const audienceOptions: Array<{
  value: MeetingAudienceMode;
  label: string;
  description: string;
}> = [
  {
    value: 'all_active',
    label: 'All active workers',
    description: 'Everyone with an active worker profile and linked account.',
  },
  {
    value: 'groups',
    label: 'Specific groups',
    description: 'Active workers who belong to any selected group.',
  },
  {
    value: 'workers',
    label: 'Specific workers',
    description: 'Only the individual workers you select.',
  },
];

const MeetingEditorModal = ({
  date,
  meeting,
  workers,
  workerGroups,
  onClose,
  onSaved,
}: Props) => {
  const [title, setTitle] = useState(meeting?.title ?? '');
  const [meetingDate, setMeetingDate] = useState(meeting?.date ?? date);
  const [audienceMode, setAudienceMode] = useState<MeetingAudienceMode>(
    meeting?.audience.mode ?? 'all_active',
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    meeting?.audience.workerGroupIds ?? [],
  );
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(
    meeting?.audience.workerIds ?? [],
  );
  const [workerSearch, setWorkerSearch] = useState('');
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

  const reachableWorkers = useMemo(
    () =>
      workers
        .filter((worker) => worker.status === 'active' && Boolean(worker.user_id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [workers],
  );
  const filteredWorkers = useMemo(() => {
    const query = workerSearch.trim().toLowerCase();
    return query
      ? reachableWorkers.filter((worker) => worker.name.toLowerCase().includes(query))
      : reachableWorkers;
  }, [reachableWorkers, workerSearch]);
  const selectableGroups = workerGroups.filter(
    (group) => group.is_active || selectedGroupIds.includes(group._id),
  );
  const selectedAudience = audienceOptions.find(
    (option) => option.value === audienceMode,
  )!;

  const toggleSelection = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

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

    if (audienceMode === 'groups' && !selectedGroupIds.length) {
      setError('Select at least one worker group.');
      return;
    }
    if (audienceMode === 'workers' && !selectedWorkerIds.length) {
      setError('Select at least one worker.');
      return;
    }

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
      audience: {
        mode: audienceMode,
        worker_group_ids: audienceMode === 'groups' ? selectedGroupIds : [],
        worker_ids: audienceMode === 'workers' ? selectedWorkerIds : [],
      },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
      <section className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:max-h-[90vh]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase text-violet-700">
              {meeting ? 'Edit meeting' : 'Create meeting'}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
              Team calendar event
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close meeting editor"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={submit} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="space-y-6">
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <label className="block min-w-0 text-sm font-semibold text-slate-700">
                Meeting title
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Monthly worship team meeting"
                  className="mt-1 h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <label className="block min-w-0 text-sm font-semibold text-slate-700">
                Date
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(event) => setMeetingDate(event.target.value)}
                  className="mt-1 h-11 w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </label>
            </div>

            <section aria-labelledby="meeting-audience-heading">
              <p
                id="meeting-audience-heading"
                className="flex items-center gap-2 font-bold text-slate-950"
              >
                <FaUsers className="text-violet-600" /> Recipients
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Only active workers linked to an active account can receive reminders.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {audienceOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      audienceMode === option.value
                        ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="meeting-audience"
                        value={option.value}
                        checked={audienceMode === option.value}
                        onChange={() => setAudienceMode(option.value)}
                        className="mt-0.5 accent-violet-700"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-800">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-4 text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {audienceMode === 'groups' && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Select groups
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {selectableGroups.map((group) => (
                      <label
                        key={group._id}
                        className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group._id)}
                          onChange={() =>
                            toggleSelection(group._id, setSelectedGroupIds)
                          }
                          className="accent-violet-700"
                        />
                        {group.name}
                      </label>
                    ))}
                    {!selectableGroups.length && (
                      <p className="text-sm text-slate-500">No active groups are available.</p>
                    )}
                  </div>
                </div>
              )}

              {audienceMode === 'workers' && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <label className="relative block">
                    <span className="sr-only">Search workers</span>
                    <FaSearch className="pointer-events-none absolute left-3 top-3 text-sm text-slate-400" />
                    <input
                      type="search"
                      value={workerSearch}
                      onChange={(event) => setWorkerSearch(event.target.value)}
                      placeholder="Search active workers"
                      className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                  <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1">
                    {filteredWorkers.map((worker) => (
                      <label
                        key={worker._id}
                        className="flex cursor-pointer items-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:ring-violet-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWorkerIds.includes(worker._id)}
                          onChange={() =>
                            toggleSelection(worker._id, setSelectedWorkerIds)
                          }
                          className="accent-violet-700"
                        />
                        <span className="min-w-0 flex-1 truncate">{worker.name}</span>
                      </label>
                    ))}
                    {!filteredWorkers.length && (
                      <p className="py-3 text-center text-sm text-slate-500">
                        No linked active workers match this search.
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-violet-700">
                    {selectedWorkerIds.length} worker{selectedWorkerIds.length === 1 ? '' : 's'} selected
                  </p>
                </div>
              )}
            </section>

            <section aria-labelledby="meeting-reminders-heading">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    id="meeting-reminders-heading"
                    className="flex items-center gap-2 font-bold text-slate-950"
                  >
                    <FaBell className="text-violet-600" /> Reminders
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Sent to {selectedAudience.label.toLowerCase()} using church local time.
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
                  className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <FaPlus /> Add reminder
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-end gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <label className="min-w-0 text-xs font-bold text-slate-600">
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
                        className="mt-1 h-11 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm"
                      />
                    </label>
                    <label className="min-w-0 text-xs font-bold text-slate-600">
                      Send at
                      <input
                        type="time"
                        required
                        value={reminder.time}
                        onChange={(event) =>
                          updateReminder(index, { time: event.target.value })
                        }
                        className="mt-1 h-11 w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-2 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setReminders((current) =>
                          current.filter((_, reminderIndex) => reminderIndex !== index),
                        )
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
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
            </section>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-4 mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full whitespace-nowrap rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full whitespace-nowrap rounded-md bg-violet-700 px-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50 sm:text-base"
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
