import { Employee, LeaveApproval, LeaveRequest, LeaveType } from '@prisma/client';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type SideNavItemGroup = {
  title: string;
  menuList: SideNavItem[]
}

export interface SidebarItems {
  links: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
  }>;
  extras?: ReactNode;
}


export type Approver = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  isManager: boolean;
  isHR: boolean;
};

export type PendingApprovalWithDetails = LeaveApproval & {
  leaveRequest: LeaveRequest & {
    employee: Employee;
    leaveType: LeaveType;
    approvals: (LeaveApproval & {
      approver: Employee;
    })[];
  };
};