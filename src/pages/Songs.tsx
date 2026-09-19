import { useEffect, useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaMusic,
  FaPlus,
  FaSearch,
  FaSpotify,
} from 'react-icons/fa';
import SongEditorModal from '../components/Songs/SongEditorModal';
import { useAuth } from '../context/useAuth';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { PaginatedResult, Song } from '../models/Song';
import { fetchSongs } from '../services/songs';

const Songs = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<Song>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<{ song?: Song } | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const searchPending = search !== debouncedSearch;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchSongs({ search: debouncedSearch, page, limit: 12, includeInactive })
      .then((data) => {
        if (!active) return;
        const lastPage = Math.max(1, data.pagination.last_page);
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }
        setResult(data);
      })
      .catch(() => {
        if (active)
          setError('The song catalog could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedSearch, includeInactive, page, revision]);

  const busy = loading || searchPending;
  const pagination = result?.pagination;
  const buttonClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-amber-700">
            <FaMusic /> Songs
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Song catalog
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {isAdmin
              ? 'Manage the songs shared across the worship team.'
              : 'Browse the songs shared across the worship team.'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditor({})}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FaPlus /> Add song
          </button>
        )}
      </section>

      {notice && (
        <p
          role="status"
          className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}

      <section
        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        aria-label="Song catalog"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">Search songs by title or artist</span>
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title or artist"
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>
          <label className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => {
                setIncludeInactive(event.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 accent-amber-600"
            />
            Include inactive songs
          </label>
        </div>

        {error ? (
          <div role="alert" className="p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setRevision((value) => value + 1)}
              className="mt-3 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Try again
            </button>
          </div>
        ) : busy ? (
          <p role="status" className="p-12 text-center text-sm text-slate-500">
            Loading songs...
          </p>
        ) : result?.items.length ? (
          <ul className="divide-y divide-slate-200">
            {result.items.map((song) => (
              <li
                key={song._id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1 basis-40">
                  <p className="break-words font-semibold text-slate-950">
                    {song.title}
                  </p>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    {song.artist || 'No artist listed'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${song.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                >
                  {song.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-2">
                  {song.spotify_url &&
                    /^https?:\/\//i.test(song.spotify_url) && (
                      <a
                        href={song.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Listen to ${song.title} on Spotify`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50"
                      >
                        <FaSpotify />
                      </a>
                    )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEditor({ song })}
                      aria-label={`Edit ${song.title}`}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <FaEdit /> Edit
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <FaMusic className="mx-auto mb-3 text-2xl text-slate-400" />
            <p className="font-semibold text-slate-700">
              {search.trim() ? 'No matching songs' : 'No songs found'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {search.trim()
                ? 'Try another title or artist.'
                : isAdmin
                  ? 'Add a song to start building the catalog, or include inactive songs.'
                  : 'The song catalog will appear here once songs are added.'}
            </p>
          </div>
        )}

        {!error && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {busy
                ? 'Loading...'
                : `${pagination?.total_rows ?? 0} ${pagination?.total_rows === 1 ? 'song' : 'songs'}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={busy || page <= 1}
                aria-label="Previous songs page"
                className={buttonClass}
              >
                <FaChevronLeft />
              </button>
              <span className="min-w-20 text-center text-sm font-semibold text-slate-700">
                {pagination?.last_page
                  ? `${page} of ${pagination.last_page}`
                  : '0 of 0'}
              </span>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={busy || page >= (pagination?.last_page ?? 0)}
                aria-label="Next songs page"
                className={buttonClass}
              >
                <FaChevronRight />
              </button>
            </div>
          </footer>
        )}
      </section>

      {editor && isAdmin && (
        <SongEditorModal
          song={editor.song}
          onClose={() => setEditor(null)}
          onSaved={(song) => {
            setNotice(`“${song.title}” saved.`);
            setRevision((value) => value + 1);
          }}
        />
      )}
    </main>
  );
};

export default Songs;
