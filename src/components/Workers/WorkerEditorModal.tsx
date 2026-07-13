import { FormEvent, useState } from 'react';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { Worker, WorkerLabel, WorkerRole, WorkerStatus } from '../../models/Worker';
import { createWorker, SaveWorkerPayload, updateWorker } from '../../services/workers';

interface Props {
  worker?: Worker;
  onClose: () => void;
  onSaved: () => void;
}

const workerRoles: WorkerRole[] = [
  'Leader',
  'Backup',
  'Acoustic',
  'Bass',
  'Drums',
  'Keyboard',
  'Electric',
];

const WorkerEditorModal = ({ worker, onClose, onSaved }: Props) => {
  const [name, setName] = useState(worker?.name ?? '');
  const [label, setLabel] = useState<WorkerLabel>(worker?.label ?? 'main');
  const [status, setStatus] = useState<WorkerStatus>(worker?.status ?? 'active');
  const [roles, setRoles] = useState<WorkerRole[]>(worker?.roles ?? []);
  const [leaderSongs, setLeaderSongs] = useState(
    worker?.leader_songs?.length ? worker.leader_songs : [{ title: '', key: '' }],
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLeader = roles.includes('Leader');

  const toggleRole = (role: WorkerRole) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((currentRole) => currentRole !== role)
        : [...current, role],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Worker name is required.');
      return;
    }

    if (!roles.length) {
      setError('Select at least one worker role.');
      return;
    }

    const payload: SaveWorkerPayload = {
      name: name.trim(),
      roles,
      label,
      status,
      leader_songs: isLeader
        ? leaderSongs.filter((song) => song.title.trim() && song.key.trim())
        : [],
    };

    setSubmitting(true);

    try {
      if (worker) {
        await updateWorker(worker._id, payload);
      } else {
        await createWorker(payload);
      }

      onSaved();
      onClose();
    } catch {
      setError('Worker could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              {worker ? 'Edit worker' : 'Create worker'}
            </p>
            <h2 className="text-xl font-bold text-slate-950">
              {worker ? worker.name : 'New worship team worker'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close"
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

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Label</span>
              <select
                value={label}
                onChange={(event) => setLabel(event.target.value as WorkerLabel)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="main">Main</option>
                <option value="youth">Youth</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as WorkerStatus)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Roles</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {workerRoles.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="h-4 w-4 accent-amber-600"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {isLeader && (
            <div className="rounded-md bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Leader songs</p>
                  <p className="text-xs text-slate-500">Optional songs and keys for this leader.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLeaderSongs([...leaderSongs, { title: '', key: '' }])}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  <FaPlus />
                  Add
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {leaderSongs.map((song, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_40px]">
                    <input
                      value={song.title}
                      onChange={(event) => {
                        const nextSongs = [...leaderSongs];
                        nextSongs[index] = { ...song, title: event.target.value };
                        setLeaderSongs(nextSongs);
                      }}
                      placeholder="Song title"
                      className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                    <input
                      value={song.key}
                      onChange={(event) => {
                        const nextSongs = [...leaderSongs];
                        nextSongs[index] = { ...song, key: event.target.value };
                        setLeaderSongs(nextSongs);
                      }}
                      placeholder="Key"
                      className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => setLeaderSongs(leaderSongs.filter((_, itemIndex) => itemIndex !== index))}
                      className="inline-flex h-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                      aria-label="Remove song"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {submitting ? 'Saving...' : 'Save worker'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default WorkerEditorModal;
