export interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  createdOn: string | Date;
}
