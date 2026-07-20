import { useCallback, useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaEdit,
  FaPlus,
  FaUsers,
} from 'react-icons/fa';
import ServiceTypeEditorModal from '../components/Services/ServiceTypeEditorModal';
import WorkerGroupEditorModal from '../components/Services/WorkerGroupEditorModal';
import { useAuth } from '../context/useAuth';
import {
  ServiceTypeConfiguration,
  WorkerGroup,
} from '../models/ServiceConfiguration';
import {
  fetchServiceTypes,
  fetchWorkerGroups,
} from '../services/serviceConfiguration';

type Tab = 'service-types' | 'worker-groups';

const Services = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('service-types');
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeConfiguration[]>([]);
  const [groups, setGroups] = useState<WorkerGroup[]>([]);
  const [editingServiceType, setEditingServiceType] = useState<ServiceTypeConfiguration>();
  const [editingGroup, setEditingGroup] = useState<WorkerGroup>();
  const [showServiceEditor, setShowServiceEditor] = useState(false);
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [serviceItems, groupItems] = await Promise.all([
      fetchServiceTypes(),
      fetchWorkerGroups(),
    ]);
    setServiceTypes(serviceItems);
    setGroups(groupItems);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadData()
      .then(() => setError(''))
      .catch(() => setError('Service configuration could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, loadData]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Admin access is required to configure services.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-amber-700">Services</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Service configuration</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage service recurrence, worker eligibility, and assignment positions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (tab === 'service-types') {
              setEditingServiceType(undefined);
              setShowServiceEditor(true);
            } else {
              setEditingGroup(undefined);
              setShowGroupEditor(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <FaPlus />
          {tab === 'service-types' ? 'Create service type' : 'Create worker group'}
        </button>
      </section>

      {error && (
        <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mb-5 inline-flex rounded-md border border-slate-300 bg-white p-1">
        <TabButton
          active={tab === 'service-types'}
          onClick={() => setTab('service-types')}
          icon={<FaCalendarAlt />}
          label="Service types"
        />
        <TabButton
          active={tab === 'worker-groups'}
          onClick={() => setTab('worker-groups')}
          icon={<FaUsers />}
          label="Worker groups"
        />
      </div>

      {loading ? (
        <section className="border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600">
          Loading service configuration...
        </section>
      ) : tab === 'service-types' ? (
        <ServiceTypesTable
          serviceTypes={serviceTypes}
          groups={groups}
          onEdit={(serviceType) => {
            setEditingServiceType(serviceType);
            setShowServiceEditor(true);
          }}
        />
      ) : (
        <WorkerGroupsTable
          groups={groups}
          serviceTypes={serviceTypes}
          onEdit={(group) => {
            setEditingGroup(group);
            setShowGroupEditor(true);
          }}
        />
      )}

      {showServiceEditor && (
        <ServiceTypeEditorModal
          serviceType={editingServiceType}
          groups={groups}
          onClose={() => setShowServiceEditor(false)}
          onSaved={loadData}
        />
      )}

      {showGroupEditor && (
        <WorkerGroupEditorModal
          group={editingGroup}
          onClose={() => setShowGroupEditor(false)}
          onSaved={loadData}
        />
      )}
    </main>
  );
};

const ServiceTypesTable = ({
  serviceTypes,
  groups,
  onEdit,
}: {
  serviceTypes: ServiceTypeConfiguration[];
  groups: WorkerGroup[];
  onEdit: (serviceType: ServiceTypeConfiguration) => void;
}) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="font-bold text-slate-950">Service types</h2>
      <p className="mt-1 text-sm text-slate-500">{serviceTypes.length} configured services</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-[900px] divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Frequency</th>
            <th className="px-4 py-3">Allowed groups</th>
            <th className="px-4 py-3">Positions</th>
            <th className="px-4 py-3">Auto generation</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {serviceTypes.map((serviceType) => (
            <tr key={serviceType._id}>
              <td className="px-4 py-4">
                <p className="font-bold text-slate-950">{serviceType.name}</p>
                <p className="mt-1 text-xs text-slate-500">{serviceType.code}</p>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-700">
                {formatRecurrence(serviceType)}
              </td>
              <td className="px-4 py-4">
                <GroupList eligibility={serviceType.worker_eligibility} groups={groups} />
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-700">
                  {serviceType.assignment_slots.length} slots
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {serviceType.assignment_slots.filter((slot) => slot.required).length} required
                </p>
              </td>
              <td className="px-4 py-4">
                <StatusBadge active={serviceType.auto_generation_enabled} yes="Enabled" no="Off" />
              </td>
              <td className="px-4 py-4">
                <StatusBadge active={serviceType.is_active} yes="Active" no="Inactive" />
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(serviceType)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  aria-label={`Edit ${serviceType.name}`}
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const WorkerGroupsTable = ({
  groups,
  serviceTypes,
  onEdit,
}: {
  groups: WorkerGroup[];
  serviceTypes: ServiceTypeConfiguration[];
  onEdit: (group: WorkerGroup) => void;
}) => (
  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="font-bold text-slate-950">Worker groups</h2>
      <p className="mt-1 text-sm text-slate-500">
        Reusable eligibility groups for service assignments.
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Used by</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {groups.map((group) => {
            const usage = serviceTypes.filter((serviceType) =>
              serviceType.worker_eligibility.allowed_group_ids.includes(group._id),
            );
            return (
              <tr key={group._id}>
                <td className="px-4 py-4 font-bold text-slate-950">{group.name}</td>
                <td className="px-4 py-4 text-slate-500">{group.code}</td>
                <td className="px-4 py-4 text-slate-700">
                  {usage.length ? usage.map((serviceType) => serviceType.name).join(', ') : 'Not used'}
                </td>
                <td className="px-4 py-4 text-slate-700">{group.display_order}</td>
                <td className="px-4 py-4">
                  <StatusBadge active={group.is_active} yes="Active" no="Inactive" />
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(group)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    aria-label={`Edit ${group.name}`}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

const TabButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold ${
      active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const GroupList = ({
  eligibility,
  groups,
}: {
  eligibility: ServiceTypeConfiguration['worker_eligibility'];
  groups: WorkerGroup[];
}) => {
  if (eligibility.mode === 'any') {
    return <span className="font-semibold text-emerald-700">Any worker</span>;
  }

  const names = eligibility.allowed_group_ids
    .map((id) => groups.find((group) => group._id === id)?.name)
    .filter(Boolean);

  return <span className="font-semibold text-slate-700">{names.join(', ') || 'None'}</span>;
};

const StatusBadge = ({ active, yes, no }: { active: boolean; yes: string; no: string }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
    active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
  }`}>
    {active ? yes : no}
  </span>
);

const formatRecurrence = (serviceType: ServiceTypeConfiguration) => {
  if (serviceType.recurrence.type === 'once') {
    return 'One-time';
  }

  const day = weekdays[serviceType.recurrence.weekday ?? 0];
  return `Every ${day}`;
};

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default Services;
