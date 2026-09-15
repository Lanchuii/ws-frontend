import { api } from './api';
import { fetchSchedules } from './schedules';

vi.mock('./api', () => ({
  api: { get: vi.fn() },
}));

describe('fetchSchedules', () => {
  it('loads every bounded page for a requested calendar range', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [{ _id: 'one', date: '2026-09-06', service_type: 'main' }],
            pagination: { page: 1, last_page: 2 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            items: [{ _id: 'two', date: '2026-09-13', service_type: 'main' }],
            pagination: { page: 2, last_page: 2 },
          },
        },
      });

    const result = await fetchSchedules({
      from: '2026-09-01',
      to: '2026-10-01',
    });

    expect(result.map((schedule) => schedule.id)).toEqual(['one', 'two']);
    expect(api.get).toHaveBeenNthCalledWith(2, '/schedules', {
      params: {
        from: '2026-09-01',
        to: '2026-10-01',
        page: 2,
        limit: 100,
      },
    });
  });
});
