import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAuth } from '../context/useAuth';
import { createSong, fetchSongs, updateSong } from '../services/songs';
import { PaginatedResult, Song } from '../models/Song';
import Songs from './Songs';

const setupUser = () => {
  const user = userEvent.setup();
  return {
    click: (element: Element) =>
      act(async () => {
        await user.click(element);
      }),
    clear: (element: Element) =>
      act(async () => {
        await user.clear(element);
      }),
    type: (element: Element, value: string) =>
      act(async () => {
        await user.type(element, value);
      }),
  };
};

vi.mock('../context/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../services/songs', () => ({
  fetchSongs: vi.fn(),
  createSong: vi.fn(),
  updateSong: vi.fn(),
}));

const song: Song = {
  _id: 'one',
  title: 'Holy Forever',
  artist: 'Chris Tomlin',
  is_active: true,
  spotify_url: 'https://open.spotify.com/track/example',
};
const results = (
  items: Song[] = [song],
  page = 1,
  lastPage = 1,
): PaginatedResult<Song> => ({
  items,
  pagination: {
    page,
    last_page: lastPage,
    per_page: 12,
    total_rows: lastPage === 1 ? items.length : 13,
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useAuth).mockReturnValue({ isAdmin: true } as ReturnType<
    typeof useAuth
  >);
  vi.mocked(fetchSongs).mockResolvedValue(results());
});
afterEach(cleanup);

it('lets members browse without catalog mutation controls', async () => {
  vi.mocked(useAuth).mockReturnValue({ isAdmin: false } as ReturnType<
    typeof useAuth
  >);
  render(<Songs />);
  expect(await screen.findByText('Holy Forever')).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Add song' }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Edit Holy Forever' }),
  ).not.toBeInTheDocument();
});

it('creates a song and refreshes the catalog', async () => {
  const user = setupUser();
  vi.mocked(createSong).mockResolvedValue({ ...song, title: 'New song' });
  render(<Songs />);
  await screen.findByText('Holy Forever');
  await user.click(screen.getByRole('button', { name: 'Add song' }));
  await user.type(screen.getByLabelText('Title'), '  New song  ');
  await user.click(screen.getByRole('button', { name: 'Save song' }));
  await waitFor(() =>
    expect(createSong).toHaveBeenCalledWith({
      title: 'New song',
      artist: '',
      spotify_url: '',
      is_active: true,
    }),
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(await screen.findByText('“New song” saved.')).toBeInTheDocument();
  expect(fetchSongs).toHaveBeenCalledTimes(2);
});

it('edits details, clears a link, and deactivates a song', async () => {
  const user = setupUser();
  vi.mocked(updateSong).mockResolvedValue({
    ...song,
    spotify_url: '',
    is_active: false,
  });
  render(<Songs />);
  await user.click(
    await screen.findByRole('button', { name: 'Edit Holy Forever' }),
  );
  await user.clear(screen.getByLabelText('Spotify link (optional)'));
  await user.click(screen.getByLabelText('Active song'));
  await user.click(screen.getByRole('button', { name: 'Save song' }));
  await waitFor(() =>
    expect(updateSong).toHaveBeenCalledWith('one', {
      title: song.title,
      artist: song.artist,
      spotify_url: '',
      is_active: false,
    }),
  );
});

it('keeps entered values when a duplicate song is rejected', async () => {
  const user = setupUser();
  vi.mocked(createSong).mockRejectedValue({
    isAxiosError: true,
    response: { status: 409 },
  });
  render(<Songs />);
  await user.click(screen.getByRole('button', { name: 'Add song' }));
  await user.type(screen.getByLabelText('Title'), song.title);
  await user.click(screen.getByRole('button', { name: 'Save song' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('already exists');
  expect(screen.getByLabelText('Title')).toHaveValue(song.title);
});

it('restores an inactive song from the catalog', async () => {
  const user = setupUser();
  vi.mocked(fetchSongs)
    .mockResolvedValueOnce(results([]))
    .mockResolvedValue(results([{ ...song, is_active: false }]));
  vi.mocked(updateSong).mockResolvedValue(song);
  render(<Songs />);
  await screen.findByText('No songs found');
  await user.click(screen.getByLabelText('Include inactive songs'));
  await user.click(
    await screen.findByRole('button', { name: 'Edit Holy Forever' }),
  );
  expect(screen.getByLabelText('Active song')).not.toBeChecked();
  await user.click(screen.getByLabelText('Active song'));
  await user.click(screen.getByRole('button', { name: 'Save song' }));
  await waitFor(() =>
    expect(updateSong).toHaveBeenCalledWith(
      'one',
      expect.objectContaining({ is_active: true }),
    ),
  );
});

it('resets pagination when searching or including inactive songs', async () => {
  const user = setupUser();
  vi.mocked(fetchSongs).mockResolvedValue(results([song], 1, 2));
  render(<Songs />);
  await screen.findByText('Holy Forever');
  await user.click(screen.getByRole('button', { name: 'Next songs page' }));
  await waitFor(() =>
    expect(fetchSongs).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    ),
  );
  await user.type(screen.getByRole('searchbox'), 'Tomlin');
  await waitFor(() =>
    expect(fetchSongs).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'Tomlin', page: 1 }),
    ),
  );
  await user.click(screen.getByLabelText('Include inactive songs'));
  await waitFor(() =>
    expect(fetchSongs).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'Tomlin',
        page: 1,
        includeInactive: true,
      }),
    ),
  );
});

it('ignores stale catalog responses after a filter change', async () => {
  const user = setupUser();
  let resolveOld!: (value: PaginatedResult<Song>) => void;
  vi.mocked(fetchSongs).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve;
    }),
  );
  vi.mocked(fetchSongs).mockResolvedValue(
    results([{ ...song, title: 'Inactive song', is_active: false }]),
  );
  render(<Songs />);
  await user.click(screen.getByLabelText('Include inactive songs'));
  expect(await screen.findByText('Inactive song')).toBeInTheDocument();
  await act(async () => resolveOld(results()));
  expect(screen.queryByText('Holy Forever')).not.toBeInTheDocument();
});

it('retries a failed catalog request', async () => {
  const user = setupUser();
  vi.mocked(fetchSongs).mockRejectedValueOnce(new Error('offline'));
  render(<Songs />);
  await user.click(await screen.findByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Holy Forever')).toBeInTheDocument();
});
