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

export interface LeaderSong {
  title: string;
  key: string;
}

export interface Worker {
  _id: string;
  user_id?: string;
  name: string;
  roles: WorkerRole[];
  label?: WorkerLabel;
  worker_group_ids?: string[];
  status: WorkerStatus;
  leader_songs?: LeaderSong[];
}
