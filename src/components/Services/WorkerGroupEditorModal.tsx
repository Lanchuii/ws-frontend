import axios from 'axios';
import { FormEvent, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { WorkerGroup } from '../../models/ServiceConfiguration';
import {
  createWorkerGroup,
  updateWorkerGroup,
} from '../../services/serviceConfiguration';

interface Props {
  group?: WorkerGroup;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const WorkerGroupEditorModal = ({ group, onClose, onSaved }: Props) => {
  const [name, setName] = useState(group?.name ?? '');
  const [code, setCode] = useState(group?.code ?? '');
  const [displayOrder, setDisplayOrder] = useState(group?.display_order ?? 0);
  const [isActive, setIsActive] = useState(group?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (group) {
        await updateWorkerGroup(group._id, {
          name,
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createWorkerGroup({
          code,
          name,
          display_order: displayOrder,
          is_active: isActive,
        });
      }

      await onSaved();
      onClose();
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-700">Worker group</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {group ? `Edit ${group.name}` : 'Create worker group'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close worker group editor"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Group name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={Boolean(group)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Display order</span>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(event) => setDisplayOrder(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-amber-600"
            />
            Active group
          </label>

          <footer className="flex justify-end gap-3">
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
              className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save group'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

const getError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Worker group could not be saved.';
  }

  return 'Worker group could not be saved.';
};

export default WorkerGroupEditorModal;
