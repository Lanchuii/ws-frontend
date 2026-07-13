import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaEdit, FaMusic, FaPlus, FaTimes, FaTrash, FaUsers } from 'react-icons/fa';
import WorkerEditorModal from '../components/Workers/WorkerEditorModal';
import { useAuth } from '../context/useAuth';
import { Worker, WorkerStatus } from '../models/Worker';
import { deleteWorker, fetchWorkers } from '../services/workers';

const Workers = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingWorker, setEditingWorker] = useState<Worker | undefined>();
  const [songWorker, setSongWorker] = useState<Worker | undefined>();
  const [showEditor, setShowEditor] = useState(false);

  const loadWorkers = useCallback(async () => {
    const items = await fetchWorkers(statusFilter === 'all' ? undefined : statusFilter);
    setWorkers(items);
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadWorkers()
      .then(() => setError(''))
      .catch(() => setError('Workers could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, loadWorkers]);

  const activeCount = useMemo(
    () => workers.filter((worker) => worker.status === 'active').length,
    [workers],
  );

  const handleDelete = async (worker: Worker) => {
    const confirmed = window.confirm(`Delete ${worker.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteWorker(worker._id);
      await loadWorkers();
    } catch {
      setError('Worker could not be deleted.');
    }
  };

  const openCreate = () => {
    setEditingWorker(undefined);
    setShowEditor(true);
  };

  const openEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setShowEditor(true);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Workers
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Worship team workers</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            View team members, role eligibility, status, and leader song keys.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FaPlus />
            Create worker
          </button>
        )}
      </section>

      {!isAuthenticated && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Log in to view workers.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {isAuthenticated && (
        <>
          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <FaUsers className="text-amber-600" />
              <p className="mt-3 text-sm font-medium text-slate-500">Shown workers</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{workers.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{activeCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as WorkerStatus | 'all')}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="all">All workers</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-6 text-sm font-medium text-slate-600">Loading workers...</div>
            ) : workers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Roles</th>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Leader Songs</th>
                      {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {workers.map((worker) => (
                      <tr key={worker._id}>
                        <td className="px-4 py-4 font-bold text-slate-950">{worker.name}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {worker.roles.map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                              worker.label === 'youth'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {worker.label ?? 'main'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {worker.leader_songs?.length ? (
                            <button
                              type="button"
                              onClick={() => setSongWorker(worker)}
                              className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              aria-label={`View ${worker.name}'s leader songs`}
                            >
                              {worker.leader_songs.length}
                            </button>
                          ) : (
                            <span>0</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(worker)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                                aria-label={`Edit ${worker.name}`}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(worker)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                                aria-label={`Delete ${worker.name}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-sm font-medium text-slate-600">
                No workers found for this filter.
              </div>
            )}
          </section>
        </>
      )}

      {showEditor && isAdmin && (
        <WorkerEditorModal
          worker={editingWorker}
          onClose={() => setShowEditor(false)}
          onSaved={loadWorkers}
        />
      )}

      {songWorker && (
        <LeaderSongsModal worker={songWorker} onClose={() => setSongWorker(undefined)} />
      )}
    </main>
  );
};

interface LeaderSongsModalProps {
  worker: Worker;
  onClose: () => void;
}

const LeaderSongsModal = ({ worker, onClose }: LeaderSongsModalProps) => {
  const songs = worker.leader_songs ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
              <FaMusic />
              Leader songs
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{worker.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close leader songs"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {songs.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Song</th>
                    <th className="w-28 px-4 py-3">Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {songs.map((song, index) => (
                    <tr key={`${song.title}-${song.key}-${index}`}>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {song.title}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-700">
                        {song.key || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No leader songs saved for this worker.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Workers;
