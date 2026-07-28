import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaMusic,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  LeaderRepertoireItem,
  PaginatedResult,
  Pagination,
  Song,
} from '../../models/Song';
import { fetchSongs } from '../../services/songs';
import {
  addToLeaderRepertoire,
  addToMyLeaderRepertoire,
  fetchLeaderRepertoire,
  fetchMyLeaderRepertoire,
  removeFromLeaderRepertoire,
  removeFromMyLeaderRepertoire,
  updateLeaderRepertoireKey,
  updateMyLeaderRepertoireKey,
} from '../../services/workers';

interface Props {
  workerId?: string;
  workerName?: string;
  onClose: () => void;
  onChanged?: () => void;
}

type AddMode = 'catalog' | 'new';

const emptyPagination: Pagination = {
  page: 0,
  per_page: 8,
  last_page: 0,
  total_rows: 0,
};

const LeaderSongsEditorModal = ({
  workerId,
  workerName,
  onClose,
  onChanged,
}: Props) => {
  const [items, setItems] = useState<LeaderRepertoireItem[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<AddMode>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalog, setCatalog] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEntryId, setSavingEntryId] = useState('');
  const [error, setError] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch);

  const loadRepertoire = useCallback(async () => {
    setLoading(true);

    try {
      const query = { search: debouncedSearch, page, limit: 8 };
      const result = workerId
        ? await fetchLeaderRepertoire(workerId, query)
        : await fetchMyLeaderRepertoire(query);
      setItems(result.items);
      setPagination(result.pagination);
      setKeys(
        Object.fromEntries(result.items.map((item) => [item._id, item.key])),
      );
      setError('');
    } catch {
      setError('Your song repertoire could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, workerId]);

  useEffect(() => {
    void loadRepertoire();
  }, [loadRepertoire]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (mode !== 'catalog') {
      return;
    }

    let active = true;
    setCatalogLoading(true);

    fetchSongs({ search: debouncedCatalogSearch, page: 1, limit: 8 })
      .then((result: PaginatedResult<Song>) => {
        if (active) {
          setCatalog(result.items);
        }
      })
      .catch(() => {
        if (active) {
          setError('The song catalog could not be loaded.');
        }
      })
      .finally(() => {
        if (active) {
          setCatalogLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedCatalogSearch, mode]);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!newKey.trim()) {
      setError('Enter the key used for this song.');
      return;
    }

    if (mode === 'catalog' && !selectedSong) {
      setError('Select a song from the catalog.');
      return;
    }

    if (mode === 'new' && !newTitle.trim()) {
      setError('Enter the new song title.');
      return;
    }

    setSubmitting(true);

    try {
      const payload =
        mode === 'catalog'
          ? { song_id: selectedSong?._id, key: newKey.trim() }
          : {
              title: newTitle.trim(),
              artist: newArtist.trim(),
              key: newKey.trim(),
            };

      if (workerId) {
        await addToLeaderRepertoire(workerId, payload);
      } else {
        await addToMyLeaderRepertoire(payload);
      }
      setSelectedSong(null);
      setNewTitle('');
      setNewArtist('');
      setNewKey('');
      setCatalogSearch('');
      setPage(1);
      await loadRepertoire();
      onChanged?.();
    } catch {
      setError('This song could not be added. It may already be in your repertoire.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveKey = async (item: LeaderRepertoireItem) => {
    const key = keys[item._id]?.trim();

    if (!key) {
      setError('Song key cannot be empty.');
      return;
    }

    setSavingEntryId(item._id);
    setError('');

    try {
      if (workerId) {
        await updateLeaderRepertoireKey(workerId, item._id, key);
      } else {
        await updateMyLeaderRepertoireKey(item._id, key);
      }
      await loadRepertoire();
      onChanged?.();
    } catch {
      setError('The song key could not be saved.');
    } finally {
      setSavingEntryId('');
    }
  };

  const handleRemove = async (item: LeaderRepertoireItem) => {
    if (!window.confirm(`Remove ${item.song.title} from your repertoire?`)) {
      return;
    }

    setSavingEntryId(item._id);
    setError('');

    try {
      if (workerId) {
        await removeFromLeaderRepertoire(workerId, item._id);
      } else {
        await removeFromMyLeaderRepertoire(item._id);
      }
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);

      if (nextPage === page) {
        await loadRepertoire();
      }

      onChanged?.();
    } catch {
      setError('The song could not be removed.');
    } finally {
      setSavingEntryId('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-amber-700">
              <FaMusic />
              Leader songs
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {workerName ? `${workerName}'s songs and keys` : 'My songs and keys'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close song editor"
          >
            <FaTimes />
          </button>
        </header>

        <div className="overflow-y-auto">
          {error && (
            <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <section className="border-b border-slate-200 p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold text-slate-950">Saved repertoire</h3>
              <label className="relative block w-full sm:max-w-xs">
                <span className="sr-only">Search saved songs</span>
                <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search saved songs"
                  className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
              </label>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm font-medium text-slate-500">
                Loading songs...
              </p>
            ) : items.length ? (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Song</th>
                      <th className="w-36 px-4 py-3">Key</th>
                      <th className="w-24 px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item) => {
                      const keyChanged = (keys[item._id] ?? '') !== item.key;
                      const busy = savingEntryId === item._id;

                      return (
                        <tr key={item._id}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-950">{item.song.title}</p>
                            {item.song.artist && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {item.song.artist}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={keys[item._id] ?? ''}
                              onChange={(event) =>
                                setKeys((current) => ({
                                  ...current,
                                  [item._id]: event.target.value,
                                }))
                              }
                              className="w-full rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                              aria-label={`Key for ${item.song.title}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => void handleSaveKey(item)}
                                disabled={!keyChanged || busy}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label={`Save key for ${item.song.title}`}
                              >
                                <FaCheck />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemove(item)}
                                disabled={busy}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40"
                                aria-label={`Remove ${item.song.title}`}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-600">
                {search ? 'No matching saved songs.' : 'No songs saved yet.'}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {pagination.total_rows} {pagination.total_rows === 1 ? 'song' : 'songs'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous saved songs page"
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
                  aria-label="Next saved songs page"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </section>

          <form onSubmit={handleAdd} className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-950">Add song</h3>
              <div className="inline-flex rounded-md border border-slate-300 p-1">
                <button
                  type="button"
                  onClick={() => setMode('catalog')}
                  className={`rounded px-3 py-1.5 text-sm font-semibold ${
                    mode === 'catalog'
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`rounded px-3 py-1.5 text-sm font-semibold ${
                    mode === 'new'
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  New song
                </button>
              </div>
            </div>

            {mode === 'catalog' ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_150px_auto] lg:items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Song catalog
                    <span className="relative mt-2 block">
                      <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
                      <input
                        type="search"
                        value={catalogSearch}
                        onChange={(event) => {
                          setCatalogSearch(event.target.value);
                          setSelectedSong(null);
                        }}
                        placeholder="Search title or artist"
                        className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                      />
                    </span>
                  </label>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200">
                    {catalogLoading ? (
                      <p className="px-3 py-4 text-center text-sm text-slate-500">
                        Loading catalog...
                      </p>
                    ) : catalog.length ? (
                      catalog.map((song) => (
                        <button
                          key={song._id}
                          type="button"
                          onClick={() => setSelectedSong(song)}
                          className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-0 ${
                            selectedSong?._id === song._id
                              ? 'bg-amber-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-semibold text-slate-950">
                              {song.title}
                            </span>
                            {song.artist && (
                              <span className="block text-xs text-slate-500">{song.artist}</span>
                            )}
                          </span>
                          {selectedSong?._id === song._id && (
                            <FaCheck className="shrink-0 text-amber-700" />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-center text-sm text-slate-500">
                        No catalog songs found.
                      </p>
                    )}
                  </div>
                </div>
                <label className="block text-sm font-semibold text-slate-700">
                  Key
                  <input
                    value={newKey}
                    onChange={(event) => setNewKey(event.target.value)}
                    placeholder="e.g. G#"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <AddButton submitting={submitting} />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_120px_auto] lg:items-end">
                <label className="block text-sm font-semibold text-slate-700">
                  Title
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Artist
                  <input
                    value={newArtist}
                    onChange={(event) => setNewArtist(event.target.value)}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Key
                  <input
                    value={newKey}
                    onChange={(event) => setNewKey(event.target.value)}
                    placeholder="e.g. G#"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <AddButton submitting={submitting} />
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

const AddButton = ({ submitting }: { submitting: boolean }) => (
  <button
    type="submit"
    disabled={submitting}
    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    <FaPlus />
    {submitting ? 'Adding...' : 'Add'}
  </button>
);

export default LeaderSongsEditorModal;
