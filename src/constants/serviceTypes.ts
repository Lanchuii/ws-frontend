import { ServiceTypeConfiguration } from '../models/ServiceConfiguration';

export type ServiceTypeValue = string;

export interface ServiceTypeOption {
  value: ServiceTypeValue;
  label: string;
  badgeClassName: string;
  tableHeaderClassName: string;
}

export const serviceTypes: ServiceTypeOption[] = [
  {
    value: 'main',
    label: 'Main Service',
    badgeClassName: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    tableHeaderClassName: 'bg-amber-50 text-slate-700',
  },
  {
    value: 'youth',
    label: 'Youth Service',
    badgeClassName: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200',
    tableHeaderClassName: 'bg-sky-50 text-slate-700',
  },
  {
    value: 'midweek',
    label: 'Midweek Service',
    badgeClassName: 'bg-violet-50 text-violet-800 ring-1 ring-violet-200',
    tableHeaderClassName: 'bg-violet-50 text-slate-700',
  },
  {
    value: 'sum-ag',
    label: 'Sum-ag Service',
    badgeClassName: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    tableHeaderClassName: 'bg-emerald-50 text-slate-700',
  },
  {
    value: 'yanson',
    label: 'Yanson Service',
    badgeClassName: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
    tableHeaderClassName: 'bg-rose-50 text-slate-700',
  },
];

export const getServiceTypeOption = (value: string) => {
  return serviceTypes.find((serviceType) => serviceType.value === value) ?? {
    value,
    label: value
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' '),
    badgeClassName: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    tableHeaderClassName: 'bg-slate-50 text-slate-700',
  };
};

const colorStyles = [
  ['bg-amber-50 text-amber-800 ring-1 ring-amber-200', 'bg-amber-50 text-slate-700'],
  ['bg-sky-50 text-sky-800 ring-1 ring-sky-200', 'bg-sky-50 text-slate-700'],
  ['bg-violet-50 text-violet-800 ring-1 ring-violet-200', 'bg-violet-50 text-slate-700'],
  ['bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200', 'bg-emerald-50 text-slate-700'],
  ['bg-rose-50 text-rose-800 ring-1 ring-rose-200', 'bg-rose-50 text-slate-700'],
  ['bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200', 'bg-cyan-50 text-slate-700'],
];

export const toServiceTypeOptions = (
  configurations: ServiceTypeConfiguration[],
): ServiceTypeOption[] =>
  configurations.map((serviceType, index) => ({
    value: serviceType.code,
    label: serviceType.name,
    badgeClassName: colorStyles[index % colorStyles.length][0],
    tableHeaderClassName: colorStyles[index % colorStyles.length][1],
  }));

export const findServiceTypeOption = (
  value: string,
  options: ServiceTypeOption[],
) => options.find((option) => option.value === value) ?? getServiceTypeOption(value);
