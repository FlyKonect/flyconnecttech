import {
  createParamDecorator,
  SetMetadata,
  type ExecutionContext,
} from '@nestjs/common';
import type { Action } from '../policies/policies.js';
import type { SignedIn } from './signed-in.js';

/**
 * Route rules, read by SessionGuard. Every route needs a signed-in, active
 * person unless it is marked @Public().
 */

export const PUBLIC = 'auth:public';
export const NO_TWO_FACTOR = 'auth:noTwoFactor';
export const AREA = 'auth:area';
export const ACTION = 'auth:action';

/** Open to everyone, signed in or not (website forms, invitation links, health). */
export const Public = () => SetMetadata(PUBLIC, true);

/**
 * Team members may use this route before they have set up two-factor
 * (the setup itself, and "who am I"). Every other team route needs it.
 */
export const AllowWithoutTwoFactor = () => SetMetadata(NO_TWO_FACTOR, true);

/** Only for the client portal (customers) or the team panel (team roles). */
export const Area = (area: 'portal' | 'team') => SetMetadata(AREA, area);

/** Needs this permission from the table in policies.ts. Implies the team area. */
export const Can = (action: Action) => SetMetadata(ACTION, action);

/** The signed-in person, in a route handler: me(@CurrentUser() user: SignedIn) */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): SignedIn =>
    context.switchToHttp().getRequest<{ user: SignedIn }>().user,
);
