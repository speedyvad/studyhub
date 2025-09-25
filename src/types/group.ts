export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}
