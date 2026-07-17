import { FormEvent, useState } from 'react';
import { FaMusic, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { LeaderSong } from '../../models/Worker';
import { updateMyLeaderSongs } from '../../services/workers';

interface Props {
  songs: LeaderSong[];
  onClose: () => void;
  onSaved: (songs: LeaderSong[]) => void;
}

const LeaderSongsEditorModal = ({ songs, onClose, onSaved }: Props) => {
  const [items, setItems] = useState<LeaderSong[]>(
    songs.length ? songs : [{ title: '', key: '' }],
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const hasIncompleteSong = items.some((song) => {
      return Boolean(song.title.trim()) !== Boolean(song.key.trim());
    });

    if (hasIncompleteSong) {
      setError('Each song needs both a title and key.');
      return;
    }

    const leaderSongs = items
      .map((song) => ({ title: song.title.trim(), key: song.key.trim() }))
      .filter((song) => song.title && song.key);

    setSubmitting(true);

    try {
      const worker = await updateMyLeaderSongs(leaderSongs);
      onSaved(worker.leader_songs ?? []);
      onClose();
    } catch {
      setError('Leader songs could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-amber-700">
              <FaMusic />
              Leader songs
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">My songs and keys</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close song editor"
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

          <div className="space-y-3">
            {items.map((song, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_40px]">
                <label>
                  <span className="sr-only">Song title</span>
                  <input
                    value={song.title}
                    onChange={(event) => {
                      const nextItems = [...items];
                      nextItems[index] = { ...song, title: event.target.value };
                      setItems(nextItems);
                    }}
                    placeholder="Song title"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label>
                  <span className="sr-only">Song key</span>
                  <input
                    value={song.key}
                    onChange={(event) => {
                      const nextItems = [...items];
                      nextItems[index] = { ...song, key: event.target.value };
                      setItems(nextItems);
                    }}
                    placeholder="Key"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}
                  className="inline-flex h-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                  aria-label="Remove song"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setItems([...items, { title: '', key: '' }])}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FaPlus />
            Add song
          </button>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
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
              {submitting ? 'Saving...' : 'Save songs'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LeaderSongsEditorModal;
