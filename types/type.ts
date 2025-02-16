import { ApprovalLevel, ApprovalStatus, LeaveApproval, LeaveDay, LeaveRequest, LeaveStatus, LeaveType, User } from '@prisma/client';
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

export interface Approver {
  id: string;
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null;
  isManager: boolean;
  isHR: boolean;
  isTWC: boolean;
  role: ApprovalLevel;
}

export type PendingApprovalWithDetails = LeaveApproval & {
  leaveRequest: LeaveRequest & {
    user: User;
    leaveType: LeaveType;
    approvals: (LeaveApproval & {
      approver: User;
    })[];
  };
};

export type PendingApprovalWithDetailsPMD = {
  id: string;
  leaveRequest: {
    id: string;
    employee: User;
    leaveType: {
      id: string;
      name: string;
      isPaid: boolean;
    };
    startDate: Date;
    endDate: Date;
    leaveDay: LeaveDay;
    daysRequested: { toString: () => string };
    reason: string;
    status: LeaveStatus;
    pmdStatus: LeaveStatus | null;
    approvals: {
      id: string;
      level: ApprovalLevel;
      status: ApprovalStatus;
    }[];
  };
};