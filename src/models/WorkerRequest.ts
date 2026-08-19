export type WorkerRequestType = 'swap' | 'unavailable';
export type WorkerRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'failed';
export type SwapMode = 'replacement' | 'exchange';
export type SwapTargetResponse = 'pending' | 'accepted' | 'declined';

export interface RequestAssignmentSnapshot {
  schedule_id: string;
  schedule_date: string;
  service_type: string;
  slot_key: string;
  role: string;
  worker_id: string;
  worker_name: string;
}

export interface WorkerRequest {
  _id: string;
  type: WorkerRequestType;
  swap_mode?: SwapMode;
  status: WorkerRequestStatus;
  requester_user_id: string;
  requester_worker_id: string;
  requester_worker_name: string;
  source_assignment?: RequestAssignmentSnapshot;
  target_assignment?: RequestAssignmentSnapshot;
  target_worker_id?: string;
  target_user_id?: string;
  target_worker_name?: string;
  target_response?: SwapTargetResponse;
  target_responded_at?: string;
  target_response_note?: string;
  unavailable_date?: string;
  reason?: string;
  reviewer_note?: string;
  failure_reason?: string;
  reviewed_at?: string;
  executed_at?: string;
  createdAt: string;
}

export interface WorkerUnavailability {
  _id: string;
  worker_id: string;
  date: string;
  reason?: string;
  is_active: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    last_page: number;
    total_rows: number;
  };
}

export interface SwapOptions {
  source: RequestAssignmentSnapshot;
  options: Array<
    | { worker_id: string; worker_name: string }
    | RequestAssignmentSnapshot
  >;
}
