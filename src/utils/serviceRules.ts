import {
  AssignmentSlot,
  WorkerEligibility,
  WorkerGroup,
} from '../models/ServiceConfiguration';
import { ScheduleAssignment } from '../models/Schedule';
import { Worker } from '../models/Worker';

export const getWorkerGroupIds = (
  worker: Worker,
  groups: WorkerGroup[],
) => {
  if (worker.worker_group_ids?.length) {
    return worker.worker_group_ids;
  }

  const legacyCode = worker.label === 'youth' ? 'youth' : 'main';
  return groups
    .filter((group) => group.code === legacyCode)
    .map((group) => group._id);
};

export const isWorkerEligible = (
  worker: Worker,
  eligibility: WorkerEligibility,
  groups: WorkerGroup[],
) => {
  if (eligibility.mode === 'any') {
    return true;
  }

  const allowed = new Set(eligibility.allowed_group_ids);
  return getWorkerGroupIds(worker, groups).some((id) => allowed.has(id));
};

export const getSlotEligibility = (
  slot: AssignmentSlot,
  serviceEligibility: WorkerEligibility,
) => slot.worker_eligibility_override ?? serviceEligibility;

export const getAssignmentForSlot = <
  T extends Pick<ScheduleAssignment, 'slotKey' | 'role'>
>(
  assignments: T[],
  slot: AssignmentSlot,
  usedIndexes = new Set<number>(),
) => {
  let index = assignments.findIndex(
    (assignment, itemIndex) =>
      !usedIndexes.has(itemIndex) && assignment.slotKey === slot.key,
  );

  if (index < 0) {
    index = assignments.findIndex(
      (assignment, itemIndex) =>
        !usedIndexes.has(itemIndex) &&
        slot.allowed_roles.includes(assignment.role as never),
    );
  }

  if (index >= 0) {
    usedIndexes.add(index);
    return assignments[index];
  }

  return undefined;
};
