export function isSupportedPasswordHash(value: unknown): value is string;
export function createPasswordHash(password: string): Promise<string>;
export function verifyPasswordHash(password: string, encodedHash: string): Promise<boolean>;
