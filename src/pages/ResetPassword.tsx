import axios from 'axios';
import { FormEvent, useState } from 'react';
import { FaKey, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ResetPassword = () => {
  const { user, resetPassword, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(password);
      navigate('/', { replace: true });
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            'Your password could not be reset.',
        );
      } else {
        setError('Your password could not be reset.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <FaKey />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Action required
            </p>
            <h1 className="text-2xl font-bold text-slate-950">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-600">
              A super admin has required a password reset for {user?.email}.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Confirm new password</span>
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FaSignOutAlt />
          Log out
        </button>
      </section>
    </main>
  );
};

export default ResetPassword;
