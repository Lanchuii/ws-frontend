import { FormEvent, useState } from 'react';
import { isAxiosError } from 'axios';
import { FaTimes } from 'react-icons/fa';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { Song } from '../../models/Song';
import { createSong, updateSong } from '../../services/songs';

interface Props {
  song?: Song;
  onClose: () => void;
  onSaved: (song: Song) => void;
}

const SongEditorModal = ({ song, onClose, onSaved }: Props) => {
  const [title, setTitle] = useState(song?.title ?? '');
  const [artist, setArtist] = useState(song?.artist ?? '');
  const [spotifyUrl, setSpotifyUrl] = useState(song?.spotify_url ?? '');
  const [isActive, setIsActive] = useState(song?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const close = () => {
    if (!submitting) onClose();
  };
  const dialogProps = useAccessibleDialog(close);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (!title.trim()) {
      setError('Enter a song title.');
      return;
    }
    if (spotifyUrl.trim() && !/^https?:\/\//i.test(spotifyUrl.trim())) {
      setError('Enter a full link starting with https:// or http://.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        spotify_url: spotifyUrl.trim(),
        is_active: isActive,
      };
      const saved = song
        ? await updateSong(song._id, payload)
        : await createSong(payload);
      onSaved(saved);
      onClose();
    } catch (error) {
      setError(
        isAxiosError(error) && error.response?.status === 409
          ? 'A song with this title and artist already exists. Check the catalog, including inactive songs.'
          : 'The song could not be saved. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section
        {...dialogProps}
        aria-labelledby="song-editor-title"
        className="song-dialog max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h2
            id="song-editor-title"
            className="text-xl font-bold text-slate-950"
          >
            {song ? 'Edit song' : 'Add song'}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            aria-label="Close song editor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <FaTimes />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <fieldset disabled={submitting} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Title
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Artist (optional)
              <input
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Spotify link (optional)
              <input
                type="url"
                placeholder="https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(event) => setSpotifyUrl(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-amber-600"
              />
              Active song
            </label>
            <p className="text-xs text-slate-500">
              Inactive songs are hidden from the active catalog. Existing
              repertoire and schedule entries are kept.
            </p>
          </fieldset>
          <footer className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save song'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default SongEditorModal;
