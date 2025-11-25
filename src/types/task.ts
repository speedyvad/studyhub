// Tipos para Tasks
export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  subject?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  completed?: boolean;
  dueDate?: string;
}
