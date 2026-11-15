import type { NextFunction, Request, Response } from 'express';

/**
 * Security headers on every backend answer. The backend only sends data and
 * files, never pages, so its policy lets nothing load or run.
 *
 * Left out of the policy: the API docs and the email previews, which are
 * pages (and only exist outside production).
 */
export const API_POLICY = "default-src 'none'; frame-ancestors 'none'";

/** One year, for the live site's https addresses and their subdomains. */
export const HSTS = 'max-age=31536000; includeSubDomains';

const PAGES = ['/api-docs', '/dev/'];

export function securityHeaders(options: { production: boolean }) {
  return (request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    if (!PAGES.some((page) => request.path.startsWith(page))) {
      response.setHeader('Content-Security-Policy', API_POLICY);
    }
    if (options.production) {
      response.setHeader('Strict-Transport-Security', HSTS);
    }
    next();
  };
}
