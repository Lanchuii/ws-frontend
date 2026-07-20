import axios from 'axios';
import { FormEvent, useMemo, useState } from 'react';
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import {
  AssignmentSlot,
  ServiceTypeConfiguration,
  WorkerEligibility,
  WorkerGroup,
} from '../../models/ServiceConfiguration';
import { WorkerRole } from '../../models/Worker';
import {
  createServiceType,
  updateServiceType,
} from '../../services/serviceConfiguration';

interface Props {
  serviceType?: ServiceTypeConfiguration;
  groups: WorkerGroup[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const roles: WorkerRole[] = [
  'Leader',
  'Backup',
  'Acoustic',
  'Bass',
  'Drums',
  'Beatbox',
  'Keyboard',
  'Electric',
];

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ServiceTypeEditorModal = ({ serviceType, groups, onClose, onSaved }: Props) => {
  const firstGroupId = groups.find((group) => group.is_active)?._id ?? '';
  const [form, setForm] = useState<ServiceTypeConfiguration>(() =>
    serviceType ?? {
      _id: '',
      code: '',
      name: '',
      recurrence: { type: 'weekly', weekday: 0 },
      worker_eligibility: {
        mode: firstGroupId ? 'groups' : 'any',
        allowed_group_ids: firstGroupId ? [firstGroupId] : [],
        preferred_group_ids: firstGroupId ? [firstGroupId] : [],
      },
      assignment_slots: [],
      auto_generation_enabled: true,
      is_active: true,
      display_order: 0,
    },
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orderedSlots = useMemo(
    () => [...form.assignment_slots].sort((a, b) => a.display_order - b.display_order),
    [form.assignment_slots],
  );

  const updateEligibility = (
    next: WorkerEligibility,
    slotIndex?: number,
  ) => {
    if (slotIndex === undefined) {
      setForm({ ...form, worker_eligibility: normalizeEligibility(next) });
      return;
    }

    const slots = [...form.assignment_slots];
    slots[slotIndex] = {
      ...slots[slotIndex],
      worker_eligibility_override: normalizeEligibility(next),
    };
    setForm({ ...form, assignment_slots: slots });
  };

  const updateSlot = (slotIndex: number, updates: Partial<AssignmentSlot>) => {
    const slots = [...form.assignment_slots];
    slots[slotIndex] = { ...slots[slotIndex], ...updates };
    setForm({ ...form, assignment_slots: slots });
  };

  const addSlot = () => {
    const order = form.assignment_slots.length
      ? Math.max(...form.assignment_slots.map((slot) => slot.display_order)) + 10
      : 10;
    setForm({
      ...form,
      assignment_slots: [
        ...form.assignment_slots,
        {
          key: '',
          label: '',
          allowed_roles: [],
          required: false,
          display_order: order,
        },
      ],
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.assignment_slots.length) {
      setError('Add at least one assignment slot.');
      return;
    }

    if (form.assignment_slots.some((slot) => !slot.allowed_roles.length)) {
      setError('Every assignment slot needs at least one worker role.');
      return;
    }

    const payload = {
      code: form.code,
      name: form.name,
      recurrence: form.recurrence,
      worker_eligibility: normalizeEligibility(form.worker_eligibility),
      assignment_slots: form.assignment_slots.map((slot) => ({
        ...slot,
        ...(slot.worker_eligibility_override
          ? {
              worker_eligibility_override: normalizeEligibility(
                slot.worker_eligibility_override,
              ),
            }
          : {}),
      })),
      auto_generation_enabled: form.auto_generation_enabled,
      is_active: form.is_active,
      display_order: form.display_order,
    };

    setSubmitting(true);

    try {
      if (serviceType) {
        await updateServiceType(serviceType._id, {
          name: payload.name,
          recurrence: payload.recurrence,
          worker_eligibility: payload.worker_eligibility,
          assignment_slots: payload.assignment_slots,
          auto_generation_enabled: payload.auto_generation_enabled,
          is_active: payload.is_active,
          display_order: payload.display_order,
        });
      } else {
        await createServiceType(payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4">
      <section className="max-h-full w-full max-w-6xl overflow-auto rounded-lg bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-semibold uppercase text-amber-700">Service type</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {serviceType ? `Edit ${serviceType.name}` : 'Create service type'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close service type editor"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 p-5">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <section>
            <h3 className="text-base font-bold text-slate-950">Service details</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-4">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Code">
                <input
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  disabled={Boolean(serviceType)}
                  className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`}
                  required
                />
              </Field>
              <Field label="Frequency">
                <select
                  value={form.recurrence.type}
                  onChange={(event) => {
                    const type = event.target.value as 'weekly' | 'once';
                    setForm({
                      ...form,
                      recurrence: type === 'weekly'
                        ? { type, weekday: form.recurrence.weekday ?? 0 }
                        : { type },
                      auto_generation_enabled:
                        type === 'weekly'
                          ? form.auto_generation_enabled
                          : false,
                    });
                  }}
                  className={inputClass}
                >
                  <option value="weekly">Weekly</option>
                  <option value="once">One-time</option>
                </select>
              </Field>
              {form.recurrence.type === 'weekly' ? (
                <Field label="Recurring day">
                  <select
                    value={form.recurrence.weekday}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        recurrence: {
                          ...form.recurrence,
                          weekday: Number(event.target.value),
                        },
                      })
                    }
                    className={inputClass}
                  >
                    {weekdays.map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Display order">
                  <input
                    type="number"
                    min={0}
                    value={form.display_order}
                    onChange={(event) =>
                      setForm({ ...form, display_order: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
              )}
            </div>
            {form.recurrence.type === 'weekly' && (
              <div className="mt-4 max-w-xs">
                <Field label="Display order">
                  <input
                    type="number"
                    min={0}
                    value={form.display_order}
                    onChange={(event) =>
                      setForm({ ...form, display_order: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="text-base font-bold text-slate-950">Worker eligibility</h3>
            <p className="mt-1 text-sm text-slate-500">
              Choose which worker groups may serve in this service.
            </p>
            <EligibilityEditor
              value={form.worker_eligibility}
              groups={groups}
              onChange={updateEligibility}
            />
          </section>

          <section className="border-t border-slate-200 pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Assignment slots</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Define required positions, role eligibility, and group exceptions.
                </p>
              </div>
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FaPlus />
                Add slot
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {orderedSlots.map((slot) => {
                const slotIndex = form.assignment_slots.indexOf(slot);
                return (
                  <div key={`${slot.key}-${slotIndex}`} className="border border-slate-200 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_110px_110px_40px]">
                      <Field label="Label">
                        <input
                          value={slot.label}
                          onChange={(event) => updateSlot(slotIndex, { label: event.target.value })}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="Key">
                        <input
                          value={slot.key}
                          onChange={(event) => updateSlot(slotIndex, { key: event.target.value })}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="Order">
                        <input
                          type="number"
                          min={0}
                          value={slot.display_order}
                          onChange={(event) =>
                            updateSlot(slotIndex, { display_order: Number(event.target.value) })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <label className="mt-6 flex h-10 items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={slot.required}
                          onChange={(event) => updateSlot(slotIndex, { required: event.target.checked })}
                          className="h-4 w-4 accent-amber-600"
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            assignment_slots: form.assignment_slots.filter((_, index) => index !== slotIndex),
                          })
                        }
                        className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${slot.label || 'assignment'} slot`}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase text-slate-500">Allowed roles</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {roles.map((role) => (
                          <label key={role} className="flex items-center gap-2 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={slot.allowed_roles.includes(role)}
                              onChange={() =>
                                updateSlot(slotIndex, {
                                  allowed_roles: slot.allowed_roles.includes(role)
                                    ? slot.allowed_roles.filter((item) => item !== role)
                                    : [...slot.allowed_roles, role],
                                })
                              }
                              className="h-4 w-4 accent-amber-600"
                            />
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(slot.worker_eligibility_override)}
                        onChange={(event) =>
                          updateSlot(slotIndex, {
                            worker_eligibility_override: event.target.checked
                              ? { ...form.worker_eligibility }
                              : undefined,
                          })
                        }
                        className="h-4 w-4 accent-amber-600"
                      />
                      Use different worker groups for this slot
                    </label>

                    {slot.worker_eligibility_override && (
                      <EligibilityEditor
                        value={slot.worker_eligibility_override}
                        groups={groups}
                        compact
                        onChange={(value) => updateEligibility(value, slotIndex)}
                      />
                    )}
                  </div>
                );
              })}
              {!orderedSlots.length && (
                <p className="border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                  No assignment slots yet.
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-wrap gap-5 border-t border-slate-200 pt-5">
            <Check
              label="Active service type"
              checked={form.is_active}
              onChange={(checked) => setForm({ ...form, is_active: checked })}
            />
            <Check
              label="Available for auto generation"
              checked={form.auto_generation_enabled}
              disabled={form.recurrence.type === 'once'}
              onChange={(checked) =>
                setForm({ ...form, auto_generation_enabled: checked })
              }
            />
          </section>

          <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white py-4">
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
              {submitting ? 'Saving...' : 'Save service type'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

const EligibilityEditor = ({
  value,
  groups,
  compact = false,
  onChange,
}: {
  value: WorkerEligibility;
  groups: WorkerGroup[];
  compact?: boolean;
  onChange: (value: WorkerEligibility) => void;
}) => (
  <div className={`${compact ? 'mt-3 bg-slate-50 p-3' : 'mt-3'} space-y-3`}>
    <div className="flex flex-wrap gap-4">
      <Check
        label="Any worker group"
        checked={value.mode === 'any'}
        onChange={() =>
          onChange({ mode: 'any', allowed_group_ids: [], preferred_group_ids: [] })
        }
      />
      <Check
        label="Selected groups"
        checked={value.mode === 'groups'}
        onChange={() =>
          onChange({
            mode: 'groups',
            allowed_group_ids: value.allowed_group_ids,
            preferred_group_ids: value.preferred_group_ids,
          })
        }
      />
    </div>
    {value.mode === 'groups' && (
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const allowed = value.allowed_group_ids.includes(group._id);
          const preferred = value.preferred_group_ids.includes(group._id);
          return (
            <div key={group._id} className="flex items-center gap-3 border border-slate-200 bg-white px-3 py-2 text-sm">
              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={allowed}
                  onChange={() => {
                    const allowedIds = allowed
                      ? value.allowed_group_ids.filter((id) => id !== group._id)
                      : [...value.allowed_group_ids, group._id];
                    onChange({
                      ...value,
                      allowed_group_ids: allowedIds,
                      preferred_group_ids: allowed
                        ? value.preferred_group_ids.filter((id) => id !== group._id)
                        : value.preferred_group_ids,
                    });
                  }}
                  className="h-4 w-4 accent-amber-600"
                />
                {group.name}
              </label>
              {allowed && (
                <label className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <input
                    type="checkbox"
                    checked={preferred}
                    onChange={() =>
                      onChange({
                        ...value,
                        preferred_group_ids: preferred
                          ? value.preferred_group_ids.filter((id) => id !== group._id)
                          : [...value.preferred_group_ids, group._id],
                      })
                    }
                    className="h-3.5 w-3.5 accent-emerald-600"
                  />
                  Preferred
                </label>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const normalizeEligibility = (value: WorkerEligibility): WorkerEligibility =>
  value.mode === 'any'
    ? { mode: 'any', allowed_group_ids: [], preferred_group_ids: [] }
    : value;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
    {children}
  </label>
);

const Check = ({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 accent-amber-600 disabled:opacity-50"
    />
    {label}
  </label>
);

const inputClass =
  'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const getError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Service type could not be saved.';
  }

  return 'Service type could not be saved.';
};

export default ServiceTypeEditorModal;
