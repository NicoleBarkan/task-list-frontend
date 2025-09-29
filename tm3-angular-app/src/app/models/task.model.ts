export interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  createdOn: string;  
  updatedOn?: string | null;
  assignedTo?: number | null;
  groupId: number | null;
}
