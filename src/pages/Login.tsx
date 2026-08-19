import axios from 'axios';
import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const session = await login(form);
      navigate(
        session.user.password_reset_required
          ? '/reset-password'
          : redirectTo,
        { replace: true },
      );
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string }>(requestError)) {
        const message = requestError.response?.data?.message;

        if (message === 'Account is pending verification') {
          setError('Your account is awaiting super-admin approval.');
          return;
        }

        if (message === 'Account is inactive') {
          setError('Your account is inactive. Contact a super admin.');
          return;
        }
      }

      setError('Invalid email/username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <FaLock />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Welcome</p>
            <h1 className="text-2xl font-bold text-slate-950">Log in</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email or username</span>
            <input
              value={form.login}
              onChange={(event) => setForm({ ...form, login: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link to="/signup" className="font-bold text-amber-700 hover:text-amber-800">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
