import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaEdit, FaPlus, FaTrash, FaUsers } from 'react-icons/fa';
import WorkerEditorModal from '../components/Workers/WorkerEditorModal';
import LeaderSongsViewerModal from '../components/Workers/LeaderSongsViewerModal';
import { useAuth } from '../context/useAuth';
import { AuthUser } from '../models/Auth';
import { Worker, WorkerStatus } from '../models/Worker';
import { deleteWorker, fetchWorkers } from '../services/workers';
import { fetchLinkableUsers } from '../services/users';
import { WorkerGroup } from '../models/ServiceConfiguration';
import { fetchWorkerGroups } from '../services/serviceConfiguration';

const Workers = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [groups, setGroups] = useState<WorkerGroup[]>([]);
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
    Promise.all([
      loadWorkers(),
      isAdmin ? fetchLinkableUsers().then(setUsers) : Promise.resolve(),
      fetchWorkerGroups().then(setGroups),
    ])
      .then(() => setError(''))
      .catch(() => setError('Workers could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, loadWorkers]);

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
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
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
                      <th className="px-4 py-3">Groups</th>
                      <th className="px-4 py-3">Status</th>
                      {isAdmin && <th className="px-4 py-3">Member Account</th>}
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
                          <div className="flex flex-wrap gap-2">
                            {getWorkerGroups(worker, groups).map((group) => (
                              <span key={group._id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                                {group.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                            {worker.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-4 text-slate-600">
                            {getLinkedAccountLabel(worker.user_id, users)}
                          </td>
                        )}
                        <td className="px-4 py-4 text-slate-600">
                          {worker.roles.includes('Leader') ? (
                            <button
                              type="button"
                              onClick={() => setSongWorker(worker)}
                              className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              aria-label={`View ${worker.name}'s leader songs`}
                            >
                              {worker.leader_song_count ?? worker.leader_songs?.length ?? 0}
                            </button>
                          ) : (
                            <span>-</span>
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
          users={users.filter((user) => {
            return !workers.some((worker) => {
              return worker.user_id === user._id && worker._id !== editingWorker?._id;
            });
          })}
          groups={groups}
          onClose={() => setShowEditor(false)}
          onSaved={loadWorkers}
        />
      )}

      {songWorker && (
        <LeaderSongsViewerModal
          worker={songWorker}
          onClose={() => setSongWorker(undefined)}
          onChanged={() => void loadWorkers()}
        />
      )}
    </main>
  );
};

const getLinkedAccountLabel = (userId: string | undefined, users: AuthUser[]) => {
  if (!userId) {
    return 'Not linked';
  }

  const user = users.find((item) => item._id === userId);
  return user?.username || user?.email || 'Linked account';
};

export default Workers;

const getWorkerGroups = (worker: Worker, groups: WorkerGroup[]) => {
  const ids = worker.worker_group_ids?.length
    ? worker.worker_group_ids
    : groups
        .filter((group) => group.code === (worker.label === 'youth' ? 'youth' : 'main'))
        .map((group) => group._id);

  return groups.filter((group) => ids.includes(group._id));
};
