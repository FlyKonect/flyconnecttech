import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

import type { BrowserContext } from "@playwright/test";

import { e2e } from "./e2e-env";
import { totp } from "./totp";

/**
 * Test accounts, made the real way: invited with the backend's command
 * (npm run user:invite), activated through the backend, and for the team,
 * with two-factor set up. Each test gets fresh people with unique emails.
 */

export type Role =
  "super-admin" | "admin" | "manager" | "developer" | "customer";

export const PASSWORD = "Skyline-2027";
const backendDir = path.resolve(__dirname, "../../../backend");

export function uniqueEmail(label: string): string {
  return `${label}-${randomUUID().slice(0, 8)}@e2e.test`;
}

/** Runs the backend's invite command. Returns the invitation link it prints. */
export function inviteWithCommand(options: {
  role: Role;
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
}): string {
  const args = [
    "dist/cli/invite-user.js",
    "--role",
    options.role,
    "--name",
    options.name,
    "--email",
    options.email,
  ];
  if (options.company) args.push("--company", options.company);
  if (options.jobTitle) args.push("--job-title", options.jobTitle);

  let output = "";
  for (let attempt = 1; ; attempt++) {
    try {
      output = execFileSync("node", args, {
        cwd: backendDir,
        env: { ...process.env, ...e2e.backendEnv } as NodeJS.ProcessEnv,
        encoding: "utf8",
      });
      break;
    } catch (error) {
      const failed = error as {
        stdout?: string;
        stderr?: string;
        status?: number | null;
        signal?: string | null;
      };
      const said = `${failed.stdout ?? ""}${failed.stderr ?? ""}`.trim();
      // With many test windows open, Windows now and then fails to start
      // the process at all: it then says nothing. Try once more.
      if (!said && attempt < 2) continue;
      // Show what the command said, not only that it failed.
      throw new Error(
        `The invite command failed (exit ${failed.status ?? failed.signal}):\n${said}`,
      );
    }
  }
  const link = output.match(/https?:\/\/\S+\/invite\/[A-Za-z0-9_-]+/);
  if (!link) throw new Error(`The invite command printed no link:\n${output}`);
  return link[0];
}

/** Cookies from a backend answer, as "name=value; name=value". */
function cookiesFrom(response: Response, previous = ""): string {
  const jar = new Map(
    previous
      .split("; ")
      .filter(Boolean)
      .map((pair) => [pair.split("=")[0], pair] as const),
  );
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0];
    jar.set(pair.split("=")[0], pair);
  }
  return [...jar.values()].join("; ");
}

/** fetch, tried once more if the connection drops (busy test machine). */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return fetch(url, init);
  }
}

async function backend(
  pathName: string,
  body: unknown,
  cookie = "",
): Promise<Response> {
  const response = await fetchWithRetry(`${e2e.apiUrl}${pathName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: e2e.siteUrl,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${pathName} answered ${response.status}: ${await response.text()}`,
    );
  }
  return response;
}

export type TestPerson = {
  name: string;
  email: string;
  password: string;
  /** Team members only: the authenticator secret, for making codes. */
  secret?: string;
  /** A signed-in session, as "name=value" cookie pairs. */
  cookie: string;
};

/**
 * A fresh, active person of this role, signed in. Team members also have
 * two-factor set up, as the team panel requires.
 */
export async function createPerson(role: Role): Promise<TestPerson> {
  const email = uniqueEmail(role);
  const name = `Test ${role.replace("-", " ")}`;
  const link = inviteWithCommand({
    role,
    name,
    email,
    company: role === "customer" ? "E2E Travel Ltd" : undefined,
    jobTitle: role === "customer" ? undefined : "Tester",
  });
  const token = link.split("/invite/")[1];
  await backend(`/accounts/invitations/${token}/accept`, {
    name,
    password: PASSWORD,
  });

  const signedIn = await backend("/api/auth/sign-in/email", {
    email,
    password: PASSWORD,
  });
  let cookie = cookiesFrom(signedIn);

  if (role === "customer") return { name, email, password: PASSWORD, cookie };

  const enabled = await backend(
    "/api/auth/two-factor/enable",
    { password: PASSWORD },
    cookie,
  );
  const { totpURI } = (await enabled.json()) as { totpURI: string };
  const secret = new URL(totpURI).searchParams.get("secret")!;
  const verified = await backend(
    "/api/auth/two-factor/verify-totp",
    { code: totp(secret) },
    cookie,
  );
  cookie = cookiesFrom(verified, cookie);
  return { name, email, password: PASSWORD, secret, cookie };
}

/** Puts the person's session into the browser, so pages open signed in. */
export async function signInBrowser(
  context: BrowserContext,
  person: TestPerson,
): Promise<void> {
  await context.addCookies(
    person.cookie
      .split("; ")
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=");
        return {
          name: pair.slice(0, index),
          value: pair.slice(index + 1),
          domain: "localhost",
          path: "/",
          httpOnly: true,
          sameSite: "Lax" as const,
        };
      }),
  );
}
