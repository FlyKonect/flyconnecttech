import { z } from "zod";

import {
  projectTypes,
  roles,
  type ProjectType,
  type TeamRole,
} from "@/lib/labels";
import {
  DESCRIPTION_MAX,
  isWebAddress,
  itemLinesProblem,
  NOTES_MAX,
} from "@/lib/projects";

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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max.toLocaleString("en-GB")} characters`);

/** "What's included": one item a line (lib/projects.ts has the rules). */
const itemLines = z.string().superRefine((text, context) => {
  const problem = itemLinesProblem(text);
  if (problem) context.addIssue({ code: "custom", message: problem });
});

const optionalAddress = z
  .string()
  .trim()
  .max(500, "Keep it under 500 characters")
  .refine(
    (text) => !text || isWebAddress(text),
    "Enter a full web address starting with https://",
  );

/** A date field's value: "2026-11-21", or empty. */
const optionalDay = z.string();

const targetAfterStart = (input: { startDate: string; targetDate: string }) =>
  !input.startDate || !input.targetDate || input.targetDate >= input.startDate;
const TARGET_BEFORE_START = {
  path: ["targetDate"],
  message: "The target date is before the start",
};

/** Add customer: each project row, with its description and items. */
export const customerProjectSchema = projectSchema.extend({
  description: optionalText(DESCRIPTION_MAX),
  items: itemLines,
});

/** Add project (the Projects menu). */
export const addProjectSchema = customerProjectSchema
  .extend({
    customerId: z.string().min(1, "Choose a customer"),
    startDate: optionalDay,
    targetDate: optionalDay,
    leadId: z.string(),
  })
  .refine(targetAfterStart, TARGET_BEFORE_START);

/** Edit details on a project's page. */
export const projectDetailsSchema = projectSchema
  .extend({
    description: optionalText(DESCRIPTION_MAX),
    startDate: optionalDay,
    targetDate: optionalDay,
    liveDate: optionalDay,
    supportUntil: optionalDay,
    liveUrl: optionalAddress,
    testUrl: optionalAddress,
    builtWith: optionalText(300),
    leadId: z.string(),
    teamNotes: optionalText(NOTES_MAX),
  })
  .refine(targetAfterStart, TARGET_BEFORE_START);

export type CustomerProjectInput = z.infer<typeof customerProjectSchema>;
export type AddProjectInput = z.infer<typeof addProjectSchema>;
export type ProjectDetailsInput = z.infer<typeof projectDetailsSchema>;

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
  projects: z.array(customerProjectSchema).min(1).max(MAX_NEW_PROJECTS),
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
