import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from './tokenStorage';

const session = {
  accessToken: 'access-token',
  refreshToken: 'legacy-refresh-token',
  user: {
    _id: 'user-id',
    email: 'member@example.com',
    role: 'member' as const,
    is_active: true,
    is_verified: true,
  },
};

describe('token storage', () => {
  afterEach(() => clearStoredSession());

  it('keeps new sessions in memory instead of localStorage', () => {
    setStoredSession(session);
    expect(getStoredSession()).toEqual({
      ...session,
      refreshToken: undefined,
    });
    expect(localStorage.getItem('ws_auth_session')).toBeNull();
  });

  it('reads an existing persisted session for one-time migration', () => {
    localStorage.setItem('ws_auth_session', JSON.stringify(session));
    expect(getStoredSession()).toEqual(session);
  });
});
