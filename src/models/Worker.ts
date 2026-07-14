export type WorkerRole =
  | 'Leader'
  | 'Backup'
  | 'Acoustic'
  | 'Bass'
  | 'Drums'
  | 'Beatbox'
  | 'Keyboard'
  | 'Electric';

export type WorkerStatus = 'active' | 'inactive';
export type WorkerLabel = 'main' | 'youth';

export interface Worker {
  _id: string;
  user_id?: string;
  name: string;
  roles: WorkerRole[];
  label?: WorkerLabel;
  status: WorkerStatus;
  leader_songs?: Array<{
    title: string;
    key: string;
  }>;
}
