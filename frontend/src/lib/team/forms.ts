import { z } from "zod";

import {
  projectTypes,
  roles,
  type ProjectType,
  type TeamRole,
} from "@/lib/labels";

/**
 * The team panel's forms: Add customer, Add project and Add user, with the
 * design's error wording. The backend checks the same rules again.
 */

const PROJECT_TYPES = Object.keys(projectTypes) as [
  ProjectType,
  ...ProjectType[],
];
const TEAM_ROLES = (Object.keys(roles) as TeamRole[]).filter(
  (role) => role !== ("CUSTOMER" as string),
) as [TeamRole, ...TeamRole[]];

/** The most projects one Add customer can create (the backend's limit). */
export const MAX_NEW_PROJECTS = 10;

/** The design's email rule: something@something.xx */
const email = z
  .string()
  .trim()
  .max(191, "Enter a valid email address")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address");

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a project name")
    .max(160, "Keep the name under 160 characters"),
  type: z.enum(PROJECT_TYPES),
});

export const newCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the customer's name")
    .max(120, "Keep it under 120 characters"),
  email,
  company: z
    .string()
    .trim()
    .min(1, "Enter the company name")
    .max(160, "Keep it under 160 characters"),
  phone: z.string().trim().max(40, "Keep it under 40 characters"),
  projects: z.array(projectSchema).min(1).max(MAX_NEW_PROJECTS),
});

export const newUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter their name")
    .max(120, "Keep it under 120 characters"),
  email,
  jobTitle: z.string().trim().max(120, "Keep it under 120 characters"),
  role: z.enum(TEAM_ROLES),
});

export type NewCustomerInput = z.infer<typeof newCustomerSchema>;
export type NewProjectInput = z.infer<typeof projectSchema>;
export type NewUserInput = z.infer<typeof newUserSchema>;

/** "Hassan" from "Hassan Qureshi", or the fallback while the name is empty. */
export function firstName(name: string, fallback: string) {
  return name.trim().split(/\s+/)[0] || fallback;
}
