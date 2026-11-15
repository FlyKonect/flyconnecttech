import { execFileSync } from "node:child_process";
import path from "node:path";

import type { TestPerson } from "./accounts";
import { e2e } from "./e2e-env";

/**
 * Helpers for the support request tests: projects (the backend's
 * project:add command), and the customer's and team's actions through the
 * backend, for setting a request up before the browser looks at it.
 */

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

/** Sends a change to the backend as this person (a team action, say). */
export async function postAs(person: TestPerson, path: string, body = {}) {
  const response = await fetch(`${e2e.apiUrl}${path}`, {
    method: "POST",
    headers: { Cookie: person.cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${path} answered ${response.status}: ${await response.text()}`,
    );
  }
  return response.json() as Promise<unknown>;
}

/** The person's own id, from "who am I". */
export async function idOf(person: TestPerson): Promise<string> {
  return (await asPerson<{ id: string }>(person, "/me")).id;
}

/**
 * Sends a support request as this customer, for their first project, the
 * way the New request screen does. Returns its code.
 */
export async function sendRequest(
  person: TestPerson,
  options: { title?: string; file?: string; priority?: string } = {},
): Promise<string> {
  const [project] = await asPerson<{ id: string }[]>(
    person,
    "/portal/projects",
  );
  if (!project) throw new Error(`${person.email} has no project.`);
  const form = new FormData();
  form.set("projectId", project.id);
  form.set("type", "TECHNICAL_ISSUE");
  form.set("priority", options.priority ?? "MEDIUM");
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
