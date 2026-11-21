import type { NextFunction, Request, Response } from 'express';

/** Methods that only read: never refused here. */
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Refuses changes sent by a page on another site (cross-site request
 * forgery), as a second wall behind the sign-in cookie's SameSite rule:
 * a POST, PUT, PATCH or DELETE whose browser `Origin` is not the website
 * (or this backend, for its own API docs) answers 403 BAD_ORIGIN.
 *
 * Requests with no Origin at all (the website's server, scripts, tests)
 * pass: browsers always send one with a cross-site change.
 */
export function sameOrigin(allowed: string[]) {
  const origins = new Set(allowed.map((url) => new URL(url).origin));
  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.headers.origin;
    if (SAFE.has(request.method) || !origin || origins.has(origin)) {
      next();
      return;
    }
    response.status(403).json({
      code: 'BAD_ORIGIN',
      message: 'This request did not come from the FlyConnect Tech website.',
    });
  };
}
