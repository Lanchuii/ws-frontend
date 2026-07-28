import { useCallback, useEffect, useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaMusic,
  FaPlus,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { LeaderRepertoireItem, Pagination } from '../../models/Song';
import { Worker } from '../../models/Worker';
import { fetchLeaderRepertoire } from '../../services/workers';
import LeaderSongsEditorModal from './LeaderSongsEditorModal';

interface Props {
  worker: Worker;
  onClose: () => void;
  onChanged?: () => void;
}

const emptyPagination: Pagination = {
  page: 0,
  per_page: 10,
  last_page: 0,
  total_rows: 0,
};

const LeaderSongsViewerModal = ({ worker, onClose, onChanged }: Props) => {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LeaderRepertoireItem[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const isLinkedUser = Boolean(user?._id && worker.user_id === user._id);
  const canManage = isAdmin || isLinkedUser;

  const loadSongs = useCallback(async () => {
    setLoading(true);

    try {
      const result = await fetchLeaderRepertoire(worker._id, {
        search: debouncedSearch,
        page,
        limit: 10,
      });
      setItems(result.items);
      setPagination(result.pagination);
      setError('');
    } catch {
      setError('Leader songs could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, worker._id]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (showEditor) {
    return (
      <LeaderSongsEditorModal
        workerId={isAdmin ? worker._id : undefined}
        workerName={worker.name}
        onClose={() => {
          setShowEditor(false);
          void loadSongs();
        }}
        onChanged={() => {
          void loadSongs();
          onChanged?.();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-amber-700">
              <FaMusic />
              Leader songs
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{worker.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FaPlus />
                Add song
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close leader songs"
            >
              <FaTimes />
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200 p-4">
          <label className="relative block">
            <span className="sr-only">Search leader songs</span>
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search songs or artists"
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>
        </div>

        <div className="min-h-64 overflow-auto p-4">
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : loading ? (
            <p className="py-8 text-center text-sm font-medium text-slate-500">
              Loading songs...
            </p>
          ) : items.length ? (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Song</th>
                    <th className="w-28 px-4 py-3">Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">{item.song.title}</p>
                        {item.song.artist && (
                          <p className="mt-0.5 text-xs text-slate-500">{item.song.artist}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-700">{item.key}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-600">
              {search ? 'No matching songs found.' : 'No leader songs saved.'}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">
            {pagination.total_rows} {pagination.total_rows === 1 ? 'song' : 'songs'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </button>
            <span className="min-w-20 text-center text-sm font-semibold text-slate-700">
              {pagination.last_page ? `${page} of ${pagination.last_page}` : '0 of 0'}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= pagination.last_page || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <FaChevronRight />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default LeaderSongsViewerModal;
