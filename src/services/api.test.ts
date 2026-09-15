import axios from 'axios';
import { clearStoredSession } from './tokenStorage';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { getAuthBaseUrl, refreshStoredSession } from './api';

describe('session refresh', () => {
  afterEach(() => {
    clearStoredSession();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses the frontend origin for production authentication', () => {
    vi.stubEnv('MODE', 'production');

    expect(getAuthBaseUrl()).toBe(window.location.origin);
  });

  it('shares one rotating refresh request between simultaneous callers', async () => {
    let resolveRefresh!: (value: unknown) => void;
    const pendingRefresh = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    vi.mocked(axios.post).mockReturnValue(pendingRefresh);

    const first = refreshStoredSession('legacy-refresh-token');
    const second = refreshStoredSession('legacy-refresh-token');

    expect(first).toBe(second);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      { refreshToken: 'legacy-refresh-token' },
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-auth-first-party': '1' }),
      }),
    );

    resolveRefresh({
      data: {
        data: {
          accessToken: 'new-access-token',
          csrfToken: 'new-csrf-token',
          user: {
            _id: 'user-id',
            email: 'member@example.com',
            role: 'member',
            is_active: true,
            is_verified: true,
            password_reset_required: false,
          },
        },
      },
    });

    await expect(first).resolves.toMatchObject({
      accessToken: 'new-access-token',
    });
    await expect(second).resolves.toMatchObject({
      accessToken: 'new-access-token',
    });
  });
});
