import { env } from "@/env";

/**
 * Calls to our backend from the browser. The sign-in cookie goes along.
 *
 *   const result = await apiFetch<{ ok: true }>("/accounts/password/forgot", {
 *     method: "POST",
 *     body: { email },
 *   });
 *
 * A failed call throws ApiError, with the backend's code ("LINK_NOT_VALID",
 * "TOO_MANY_ATTEMPTS"...) and the HTTP status.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** `body` is sent as JSON, or as it is when it is FormData (files). */
type Options = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, options: Options = {}) {
  const { body, headers, ...rest } = options;
  const form = body instanceof FormData;
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body === undefined || form
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: form ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  return readResponse<T>(response);
}

export async function readResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const info = (data ?? {}) as { code?: string; message?: unknown };
    const message = Array.isArray(info.message)
      ? info.message.join(" ")
      : typeof info.message === "string"
        ? info.message
        : "Something went wrong. Please try again.";
    throw new ApiError(response.status, info.code, message, data);
  }
  return data as T;
}

/** A friendly sentence for a failed call, for showing in a form. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Too many attempts. Please wait a minute and try again.";
    }
    if (error.code === "LINK_NOT_VALID") {
      return "This link has expired or has already been used.";
    }
    return error.message;
  }
  return "We could not reach the server. Check your connection and try again.";
}
