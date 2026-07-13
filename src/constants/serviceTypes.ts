export type ServiceTypeValue = 'main' | 'youth' | 'midweek' | 'sum-ag' | 'yanson';

export interface ServiceTypeOption {
  value: ServiceTypeValue;
  label: string;
  summaryTitle: string;
  badgeClassName: string;
  tableHeaderClassName: string;
}

export const serviceTypes: ServiceTypeOption[] = [
  {
    value: 'main',
    label: 'Main Service',
    summaryTitle: 'Main Service Summary',
    badgeClassName: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    tableHeaderClassName: 'bg-amber-50 text-slate-700',
  },
  {
    value: 'youth',
    label: 'Youth Service',
    summaryTitle: 'Youth Service Summary',
    badgeClassName: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    tableHeaderClassName: 'bg-sky-50 text-slate-700',
  },
  {
    value: 'midweek',
    label: 'Midweek Service',
    summaryTitle: 'Midweek Service Summary',
    badgeClassName: 'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
    tableHeaderClassName: 'bg-violet-50 text-slate-700',
  },
  {
    value: 'sum-ag',
    label: 'Sum-ag Service',
    summaryTitle: 'Sum-ag Service Summary',
    badgeClassName: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    tableHeaderClassName: 'bg-emerald-50 text-slate-700',
  },
  {
    value: 'yanson',
    label: 'Yanson Service',
    summaryTitle: 'Yanson Service Summary',
    badgeClassName: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
    tableHeaderClassName: 'bg-rose-50 text-slate-700',
  },
];

export const getServiceTypeOption = (value: string) => {
  return serviceTypes.find((serviceType) => serviceType.value === value) ?? serviceTypes[0];
};
