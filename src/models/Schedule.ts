import { ServiceTypeValue } from '../constants/serviceTypes';

export interface ScheduleAssignment {
  slotKey?: string;
  role: string;
  workerId?: string;
  workerName: string;
}

export interface ScheduleSong {
  songId?: string;
  title: string;
  artist?: string;
  key?: string;
}

export interface WorshipSchedule {
  id: string;
  date: string;
  serviceType: ServiceTypeValue;
  status: string;
  assignments: ScheduleAssignment[];
  songs: ScheduleSong[];
  lineup?: string;
  notes?: string;
}
