import { WorkerRole } from './Worker';

export type RecurrenceType = 'weekly' | 'once';
export type WorkerEligibilityMode = 'any' | 'groups';

export interface WorkerGroup {
  _id: string;
  code: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export interface WorkerEligibility {
  mode: WorkerEligibilityMode;
  allowed_group_ids: string[];
  preferred_group_ids: string[];
}

export interface AssignmentSlot {
  key: string;
  label: string;
  allowed_roles: WorkerRole[];
  required: boolean;
  display_order: number;
  worker_eligibility_override?: WorkerEligibility;
}

export interface ServiceTypeConfiguration {
  _id: string;
  code: string;
  name: string;
  recurrence: {
    type: RecurrenceType;
    weekday?: number;
  };
  worker_eligibility: WorkerEligibility;
  assignment_slots: AssignmentSlot[];
  auto_generation_enabled: boolean;
  is_active: boolean;
  display_order: number;
}

export type SaveWorkerGroupPayload = Omit<WorkerGroup, '_id'>;
export type SaveServiceTypePayload = Omit<ServiceTypeConfiguration, '_id'>;
