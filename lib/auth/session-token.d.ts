export const SESSION_TTL_MS: number;
export interface SessionClaims { sub: string; iat: number; exp: number; v: 1 }
export function createSessionToken(subject: string, secret: string, now?: number): string;
export function verifySessionToken(token: unknown, secret: string, now?: number): SessionClaims | null;
