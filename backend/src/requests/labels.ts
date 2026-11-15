import type {
  Priority,
  RequestStatus,
  RequestType,
} from '../generated/prisma/client.js';

/**
 * Labels for notifications and emails. The screens use
 * frontend/src/lib/labels.ts; keep the two in step.
 */

export const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_CUSTOMER: 'Waiting for Customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TYPE_LABELS: Record<RequestType, string> = {
  TECHNICAL_ISSUE: 'Technical Issue',
  BUG_REPORT: 'Bug Report',
  FEATURE_REQUEST: 'Feature Request',
  INTEGRATION_PROBLEM: 'Integration Problem',
  DESIGN_MODIFICATION: 'Design Modification',
  GENERAL_INQUIRY: 'General Inquiry',
  MAINTENANCE_REQUEST: 'Maintenance Request',
};
