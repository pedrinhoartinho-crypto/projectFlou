export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'COMMENT_ADDED'
  | 'TEAM_INVITE'
  | 'PROJECT_INVITE'
  | 'DUE_DATE_REMINDER';

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  ownerId: string;
  owner?: User;
  members?: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  _count?: { projects: number; members: number };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  role: Role;
  joinedAt: Date;
}

export interface Invitation {
  id: string;
  teamId: string;
  team?: Team;
  email: string;
  token: string;
  role: Role;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  teamId: string;
  team?: Team;
  ownerId: string;
  owner?: User;
  startDate: Date | null;
  endDate: Date | null;
  status: ProjectStatus;
  columns?: Column[];
  members?: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
  _count?: { tasks: number; members: number };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  role: Role;
  joinedAt: Date;
}

export interface Column {
  id: string;
  name: string;
  projectId: string;
  position: number;
  color: string;
  tasks?: Task[];
  _count?: { tasks: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  column?: Column;
  projectId: string;
  project?: Project;
  creatorId: string;
  creator?: User;
  position: number;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedHours: number | null;
  isArchived: boolean;
  assignees?: TaskAssignee[];
  labels?: TaskLabel[];
  comments?: Comment[];
  checklists?: Checklist[];
  attachments?: Attachment[];
  _count?: {
    comments: number;
    attachments: number;
    checklists: number;
    assignees: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Checklist {
  id: string;
  title: string;
  taskId: string;
  items?: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  checklistId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: Date;
}

export interface TaskLabel {
  id: string;
  taskId: string;
  labelId: string;
  label?: Label;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user?: User;
  projectId: string | null;
  metadata: any;
  createdAt: Date;
}
