
import { addDays, subDays, format } from 'date-fns';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type Status = 'Todo' | 'In Progress' | 'Done' | 'Blocked';

export interface Task {
  id: string;
  ticketNumber?: string;
  title: string;
  project: string;
  priority: Priority;
  status: Status;
  estimatedHours: number;
  actualHoursSpent?: number;
  dueDate?: string;
  tags: string[];
}

const today = new Date();

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    ticketNumber: 'PR-5234',
    title: 'Fix Payment Summary responsive layout issues',
    project: 'Payments Service',
    priority: 'High',
    status: 'In Progress',
    estimatedHours: 4,
    actualHoursSpent: 1.5,
    dueDate: format(subDays(today, 2), 'yyyy-MM-dd'), // Overdue (Red)
    tags: ['frontend', 'bug'],
  },
  {
    id: '3',
    ticketNumber: 'PR-4412',
    title: 'Payroll UI responsive redesign for Mobile',
    project: 'Payroll Hub',
    priority: 'Urgent',
    status: 'Todo',
    estimatedHours: 8,
    actualHoursSpent: 8, // Green Bar (Exact Match)
    dueDate: format(addDays(today, 1), 'yyyy-MM-dd'), // Tomorrow (Orange)
    tags: ['design', 'mobile'],
  },
  {
    id: '5',
    ticketNumber: 'PR-8964',
    title: 'Fix critical Auth timeout bug in Production',
    project: 'Auth Service',
    priority: 'Urgent',
    status: 'In Progress',
    estimatedHours: 2,
    actualHoursSpent: 2.5, // Yellow Bar (Over estimate)
    dueDate: format(today, 'yyyy-MM-dd'), // Today (Blue/Default)
    tags: ['bug', 'urgent'],
  },
  {
    id: '6',
    ticketNumber: 'DOC-101',
    title: 'Update API Documentation for V2',
    project: 'Core Platform',
    priority: 'Low',
    status: 'Done',
    estimatedHours: 3,
    actualHoursSpent: 3,
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    tags: ['docs'],
  },
];
