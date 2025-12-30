export interface TaskUpdateDto {
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  groupId?: number | null;
  assignedToId?: number | null;
}
