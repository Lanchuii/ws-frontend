import { FormEvent, useEffect, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaLink,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { ScheduleSong, WorshipSchedule } from '../../models/Schedule';
import { LeaderRepertoireItem } from '../../models/Song';
import { updateScheduleLineup } from '../../services/schedules';
import { fetchMyLeaderRepertoire } from '../../services/workers';
import { formatLongDate } from '../../utils/date';

interface Props {
  schedule: WorshipSchedule;
  onClose: () => void;
  onSaved: (schedule: WorshipSchedule) => void;
}

const LineupEditorModal = ({ schedule, onClose, onSaved }: Props) => {
  const [songs, setSongs] = useState<ScheduleSong[]>(schedule.songs);
  const [spotifyUrl, setSpotifyUrl] = useState(schedule.lineup ?? '');
  const [search, setSearch] = useState('');
  const [repertoire, setRepertoire] = useState<LeaderRepertoireItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newKey, setNewKey] = useState('');
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingSongs(true);
    const timer = window.setTimeout(() => {
      fetchMyLeaderRepertoire({ search, page: 1, limit: 50 })
        .then((result) => { if (active) setRepertoire(result.items); })
        .catch(() => { if (active) setError('Saved songs could not be loaded.'); })
        .finally(() => { if (active) setLoadingSongs(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search]);

  const addSavedSong = (item: LeaderRepertoireItem) => {
    if (songs.some((song) => song.songId === item.song_id)) return;
    setSongs((current) => [...current, {
      songId: item.song_id,
      title: item.song.title,
      artist: item.song.artist || undefined,
      key: item.key || undefined,
    }]);
  };

  const addNewSong = () => {
    const title = newTitle.trim();
    if (!title) return;
    setSongs((current) => [...current, {
      title,
      artist: newArtist.trim() || undefined,
      key: newKey.trim() || undefined,
    }]);
    setNewTitle('');
    setNewArtist('');
    setNewKey('');
  };

  const moveSong = (index: number, amount: number) => {
    setSongs((current) => {
      const target = index + amount;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!songs.length) { setError('Add at least one song before publishing.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const updated = await updateScheduleLineup(schedule.id, {
        songs: songs.map((song) => ({
          song_id: song.songId,
          title: song.songId ? undefined : song.title,
          artist: song.songId ? undefined : song.artist,
          key: song.key ?? '',
        })),
        spotify_url: spotifyUrl.trim() || undefined,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError('The lineup could not be saved. Check the songs and Spotify link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div><p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-amber-700"><FaLink /> Schedule lineup</p><h2 className="mt-1 text-xl font-bold text-slate-950">{formatLongDate(schedule.date)}</h2></div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close lineup editor"><FaTimes /></button>
        </header>
        <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-5">
          {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="font-bold text-slate-950">Choose from your songs</h3>
              <label className="relative mt-3 block"><FaSearch className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or artist" className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3" /></label>
              <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-200">
                {loadingSongs ? <p className="p-4 text-sm text-slate-500">Loading saved songs…</p> : repertoire.length ? repertoire.map((item) => <button key={item._id} type="button" onClick={() => addSavedSong(item)} disabled={songs.some((song) => song.songId === item.song_id)} className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-amber-50 disabled:bg-slate-50 disabled:opacity-50"><span><span className="block text-sm font-semibold text-slate-950">{item.song.title}</span><span className="block text-xs text-slate-500">{item.song.artist || 'Unknown artist'}{item.key ? ` · Key ${item.key}` : ''}</span></span><FaPlus className="text-amber-700" /></button>) : <p className="p-4 text-sm text-slate-500">No saved songs match.</p>}
              </div>
              <div className="mt-5 rounded-md bg-slate-50 p-4"><h3 className="font-bold text-slate-950">Add a new song</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Title" className="rounded-md border border-slate-300 px-3 py-2" /><input value={newArtist} onChange={(event) => setNewArtist(event.target.value)} placeholder="Artist (optional)" className="rounded-md border border-slate-300 px-3 py-2" /><input value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="Key (optional)" className="rounded-md border border-slate-300 px-3 py-2" /><button type="button" onClick={addNewSong} disabled={!newTitle.trim()} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 px-3 py-2 font-semibold text-white disabled:opacity-50"><FaPlus /> Add song</button></div></div>
            </section>
            <section>
              <h3 className="font-bold text-slate-950">Lineup order ({songs.length})</h3>
              <div className="mt-3 space-y-2">{songs.length ? songs.map((song, index) => <div key={`${song.songId ?? song.title}-${index}`} className="rounded-md border border-slate-200 p-3"><div className="flex items-start gap-3"><span className="mt-2 text-sm font-bold text-amber-700">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-950">{song.title}</p>{song.artist && <p className="text-xs text-slate-500">{song.artist}</p>}<input value={song.key ?? ''} onChange={(event) => setSongs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))} placeholder="Key" className="mt-2 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" aria-label={`Key for ${song.title}`} /></div><div className="flex gap-1"><button type="button" onClick={() => moveSong(index, -1)} disabled={index === 0} className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up"><FaArrowUp /></button><button type="button" onClick={() => moveSong(index, 1)} disabled={index === songs.length - 1} className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down"><FaArrowDown /></button><button type="button" onClick={() => setSongs((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-2 text-red-600 hover:bg-red-50" aria-label="Remove song"><FaTrash /></button></div></div></div>) : <p className="rounded-md border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Select or add songs to build the lineup.</p>}</div>
              <label className="mt-5 block text-sm font-semibold text-slate-700">Spotify playlist link<input value={spotifyUrl} onChange={(event) => setSpotifyUrl(event.target.value)} maxLength={2048} placeholder="https://open.spotify.com/playlist/..." className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
            </section>
          </div>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancel</button><button type="submit" disabled={submitting || !songs.length} className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-50">{submitting ? 'Publishing…' : schedule.songs.length ? 'Save and notify' : 'Publish and notify'}</button></div>
        </form>
      </section>
    </div>
  );
};

export default LineupEditorModal;
