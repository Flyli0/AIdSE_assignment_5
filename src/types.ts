export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  finished: boolean;
  createdAt: string;
}
