import { execFileSync } from "node:child_process";
import path from "node:path";

import type { TestPerson } from "./accounts";
import { e2e } from "./e2e-env";

/** A tiny real PNG picture (the backend checks a file's first bytes). */
export const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from("a test picture"),
]);

/** Reads from the backend as this person. */
export async function asPerson<T>(person: TestPerson, path: string) {
  const response = await fetch(`${e2e.apiUrl}${path}`, {
    headers: { Cookie: person.cookie },
  });
  if (!response.ok) {
    throw new Error(`${path} answered ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * Sends a support request as this customer, for their first project, the
 * way the New request screen does. Returns its code.
 */
export async function sendRequest(
  person: TestPerson,
  options: { title?: string; file?: string } = {},
): Promise<string> {
  const [project] = await asPerson<{ id: string }[]>(
    person,
    "/portal/projects",
  );
  if (!project) throw new Error(`${person.email} has no project.`);
  const form = new FormData();
  form.set("projectId", project.id);
  form.set("type", "TECHNICAL_ISSUE");
  form.set("priority", "MEDIUM");
  form.set("title", options.title ?? "Payment page times out on mobile");
  form.set("description", "The payment page spins and never finishes.");
  if (options.file) {
    form.append("files", new Blob([PNG], { type: "image/png" }), options.file);
  }
  const response = await fetch(`${e2e.apiUrl}/portal/requests`, {
    method: "POST",
    headers: { Cookie: person.cookie },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Sending a request answered ${response.status}`);
  }
  return ((await response.json()) as { code: string }).code;
}

/**
 * Helpers for the client portal tests. Both run the backend's own tools on
 * the test database.
 */

const backendDir = path.resolve(__dirname, "../../../backend");
const env = { ...process.env, ...e2e.backendEnv } as NodeJS.ProcessEnv;

/** Gives a customer a project, with the backend's command (npm run project:add). */
export function addProject(
  email: string,
  name: string,
  type = "travel-booking-platform",
  status = "live",
): string {
  const output = execFileSync(
    "node",
    [
      "dist/cli/add-project.js",
      "--email",
      email,
      "--name",
      name,
      "--type",
      type,
      "--status",
      status,
    ],
    { cwd: backendDir, env, encoding: "utf8" },
  );
  const code = output.match(/P-\d{4,}/);
  if (!code) throw new Error(`project:add printed no code:\n${output}`);
  return code[0];
}

/**
 * Does what the team panel will do from Phase 6: changes a request's status
 * and/or adds a reply from a team member.
 */
export function teamUpdate(
  code: string,
  options: {
    status?: "WAITING_FOR_CUSTOMER" | "RESOLVED" | "IN_PROGRESS";
    reply?: { text: string; authorEmail: string };
  },
): void {
  const args = ["--import", "tsx", "test/e2e-tools/request-state.ts", code];
  if (options.status) args.push(options.status);
  if (options.reply) {
    args.push(
      "--reply",
      options.reply.text,
      "--author",
      options.reply.authorEmail,
    );
  }
  execFileSync("node", args, { cwd: backendDir, env, encoding: "utf8" });
}
