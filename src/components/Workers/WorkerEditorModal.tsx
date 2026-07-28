import { FormEvent, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AuthUser } from '../../models/Auth';
import { Worker, WorkerLabel, WorkerRole, WorkerStatus } from '../../models/Worker';
import { createWorker, SaveWorkerPayload, updateWorker } from '../../services/workers';
import { WorkerGroup } from '../../models/ServiceConfiguration';

interface Props {
  worker?: Worker;
  users: AuthUser[];
  groups: WorkerGroup[];
  onClose: () => void;
  onSaved: () => void;
}

const workerRoles: WorkerRole[] = [
  'Leader',
  'Backup',
  'Acoustic',
  'Bass',
  'Drums',
  'Beatbox',
  'Keyboard',
  'Electric',
];

const WorkerEditorModal = ({ worker, users, groups, onClose, onSaved }: Props) => {
  const [name, setName] = useState(worker?.name ?? '');
  const [userId, setUserId] = useState(worker?.user_id ?? '');
  const [label, setLabel] = useState<WorkerLabel>(worker?.label ?? 'main');
  const [status, setStatus] = useState<WorkerStatus>(worker?.status ?? 'active');
  const [roles, setRoles] = useState<WorkerRole[]>(worker?.roles ?? []);
  const [workerGroupIds, setWorkerGroupIds] = useState<string[]>(
    worker?.worker_group_ids?.length
      ? worker.worker_group_ids
      : groups
          .filter((group) => group.code === (worker?.label === 'youth' ? 'youth' : 'main'))
          .map((group) => group._id),
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    if (!workerGroupIds.length) {
      setError('Select at least one worker group.');
      return;
    }

    const payload: SaveWorkerPayload = {
      user_id: userId || null,
      name: name.trim(),
      roles,
      label,
      worker_group_ids: workerGroupIds,
      status,
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

          <div className="grid gap-4 sm:grid-cols-2">
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
              <span className="text-sm font-semibold text-slate-700">Member account</span>
              <select
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">Not linked</option>
                {users
                  .filter((user) => user.role === 'member')
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username ? `${user.username} (${user.email})` : user.email}
                    </option>
                  ))}
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
            <p className="text-sm font-semibold text-slate-700">Worker groups</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {groups.filter((group) => group.is_active || workerGroupIds.includes(group._id)).map((group) => (
                <label
                  key={group._id}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={workerGroupIds.includes(group._id)}
                    onChange={() => {
                      setWorkerGroupIds((current) =>
                        current.includes(group._id)
                          ? current.filter((id) => id !== group._id)
                          : [...current, group._id],
                      );
                      if (group.code === 'main' || group.code === 'youth') {
                        setLabel(group.code as WorkerLabel);
                      }
                    }}
                    className="h-4 w-4 accent-amber-600"
                  />
                  {group.name}
                </label>
              ))}
            </div>
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
