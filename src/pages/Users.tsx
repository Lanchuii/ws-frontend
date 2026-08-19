import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCheck,
  FaPlus,
  FaShieldAlt,
  FaTimes,
  FaUserCheck,
  FaUsers,
} from 'react-icons/fa';
import UserEditorModal from '../components/Users/UserEditorModal';
import { useAuth } from '../context/useAuth';
import { AuthUser, UserRole } from '../models/Auth';
import { Worker } from '../models/Worker';
import {
  fetchUsers,
  updateUserRole,
  updateUserStatus,
  updateUserVerification,
} from '../services/users';
import {
  fetchWorkers,
  SaveWorkerPayload,
  updateWorker,
} from '../services/workers';

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super admin' },
];

const Users = () => {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [userItems, workerItems] = await Promise.all([
      fetchUsers(),
      fetchWorkers(),
    ]);
    setUsers(userItems);
    setWorkers(workerItems);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadData()
      .then(() => setError(''))
      .catch((requestError) => {
        setError(getRequestError(requestError, 'Users could not be loaded.'));
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isSuperAdmin, loadData]);

  const pendingCount = useMemo(() => {
    return users.filter((user) => !user.is_verified).length;
  }, [users]);

  const runUserUpdate = async (
    userId: string,
    request: () => Promise<AuthUser>,
  ) => {
    setBusyUserId(userId);
    setError('');

    try {
      await request();
      await loadData();
    } catch (requestError) {
      setError(getRequestError(requestError, 'User could not be updated.'));
    } finally {
      setBusyUserId('');
    }
  };

  const handleWorkerLink = async (account: AuthUser, workerId: string) => {
    const currentWorker = workers.find((worker) => {
      return worker.user_id === account._id;
    });
    const nextWorker = workers.find((worker) => worker._id === workerId);

    if (currentWorker?._id === nextWorker?._id) {
      return;
    }

    setBusyUserId(account._id);
    setError('');

    try {
      if (currentWorker) {
        await saveWorkerAccountLink(currentWorker, null);
      }

      if (nextWorker) {
        try {
          await saveWorkerAccountLink(nextWorker, account._id);
        } catch (requestError) {
          if (currentWorker) {
            await saveWorkerAccountLink(currentWorker, account._id);
          }

          throw requestError;
        }
      }

      await loadData();
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          'The user could not be linked to that worker.',
        ),
      );
    } finally {
      setBusyUserId('');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Log in as a super admin to manage users.
        </div>
      </main>
    );
  }

  if (!isSuperAdmin) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Super-admin access is required to manage users.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Super admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">User management</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Approve registrations, control account access, and assign system roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <FaPlus aria-hidden="true" />
          Create user
        </button>
      </section>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FaUsers className="text-amber-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-500">Total users</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{users.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FaUserCheck className="text-emerald-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-500">Verified</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">
            {users.length - pendingCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <FaShieldAlt className="text-sky-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-slate-500">Pending approval</p>
          <p className="mt-1 text-3xl font-bold text-slate-950">{pendingCount}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm font-medium text-slate-600">Loading users...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Account</th>
                  <th className="w-48 px-4 py-3">Role</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Linked worker</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((account) => {
                  const isBusy = busyUserId === account._id;
                  const linkedWorker = workers.find((worker) => {
                    return worker.user_id === account._id;
                  });

                  return (
                    <tr key={account._id}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {account.username || 'No username'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={account.role}
                          onChange={(event) => {
                            const role = event.target.value as UserRole;
                            void runUserUpdate(account._id, () => {
                              return updateUserRole(account._id, role);
                            });
                          }}
                          disabled={isBusy}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
                          aria-label={`Role for ${account.email}`}
                        >
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          active={account.is_verified}
                          activeLabel="Verified"
                          inactiveLabel="Pending"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          active={account.is_active}
                          activeLabel="Active"
                          inactiveLabel="Inactive"
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {account.role === 'member' ? (
                          <select
                            value={linkedWorker?._id ?? ''}
                            onChange={(event) => {
                              void handleWorkerLink(account, event.target.value);
                            }}
                            disabled={
                              isBusy ||
                              ((!account.is_active || !account.is_verified) &&
                                !linkedWorker)
                            }
                            className="w-full min-w-44 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100 disabled:text-slate-500"
                            aria-label={`Linked worker for ${account.email}`}
                          >
                            <option value="">Not linked</option>
                            {workers
                              .filter((worker) => {
                                return (
                                  !worker.user_id ||
                                  worker.user_id === account._id
                                );
                              })
                              .map((worker) => (
                                <option
                                  key={worker._id}
                                  value={worker._id}
                                  disabled={
                                    (!account.is_active ||
                                      !account.is_verified) &&
                                    worker._id !== linkedWorker?._id
                                  }
                                >
                                  {worker.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          linkedWorker?.name ?? 'Members only'
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              void runUserUpdate(account._id, () => {
                                return updateUserVerification(
                                  account._id,
                                  !account.is_verified,
                                );
                              });
                            }}
                            disabled={isBusy}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md disabled:opacity-50 ${
                              account.is_verified
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            aria-label={
                              account.is_verified
                                ? `Return ${account.email} to pending`
                                : `Approve ${account.email}`
                            }
                          >
                            {account.is_verified ? <FaTimes /> : <FaCheck />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void runUserUpdate(account._id, () => {
                                return updateUserStatus(
                                  account._id,
                                  !account.is_active,
                                );
                              });
                            }}
                            disabled={isBusy}
                            className={`rounded-md px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                              account.is_active
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-slate-950 text-white hover:bg-slate-800'
                            }`}
                          >
                            {account.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm font-medium text-slate-600">No users found.</div>
        )}
      </section>

      {showEditor && (
        <UserEditorModal
          onClose={() => setShowEditor(false)}
          onSaved={loadData}
        />
      )}
    </main>
  );
};

interface StatusBadgeProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

const StatusBadge = ({
  active,
  activeLabel,
  inactiveLabel,
}: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
};

const getRequestError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

const saveWorkerAccountLink = (
  worker: Worker,
  userId: string | null,
) => {
  const payload: SaveWorkerPayload = {
    user_id: userId,
    name: worker.name,
    roles: worker.roles,
    label: worker.label,
    status: worker.status,
    leader_songs: worker.leader_songs ?? [],
  };

  return updateWorker(worker._id, payload);
};

export default Users;
