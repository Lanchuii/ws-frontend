import axios from 'axios';
import { FormEvent, useState } from 'react';
import { FaKey } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/auth';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      setMessage(await requestPasswordReset(username));
      setUsername('');
    } catch (requestError) {
      if (axios.isAxiosError<{ message?: string | string[] }>(requestError)) {
        const responseMessage = requestError.response?.data?.message;
        setError(
          Array.isArray(responseMessage)
            ? responseMessage.join(', ')
            : responseMessage ?? 'The request could not be submitted.',
        );
      } else {
        setError('The request could not be submitted.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <FaKey />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Account recovery
            </p>
            <h1 className="text-2xl font-bold text-slate-950">Forgot password</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Enter your username. A super admin will review the request and provide a temporary password.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Request password reset'}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-5 block text-center text-sm font-bold text-amber-700 hover:text-amber-800"
        >
          Return to login
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
