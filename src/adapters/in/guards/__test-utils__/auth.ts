import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../jwt-auth.guard';

export const TEST_JWT_SECRET = 'test-secret-not-for-prod';

export interface SignTestTokenOptions {
  secret?: string;
  expiresIn?: string | number;
}

export function signTestToken(
  payload: Partial<JwtPayload> & Pick<JwtPayload, 'id' | 'email'>,
  opts: SignTestTokenOptions = {},
): string {
  const secret = opts.secret ?? process.env.JWT_SECRET ?? TEST_JWT_SECRET;
  const fullPayload: JwtPayload = {
    personType: 'DONOR',
    isProfileComplete: true,
    ...payload,
  };
  const signOptions: jwt.SignOptions = {};
  if (opts.expiresIn !== undefined) {
    signOptions.expiresIn = opts.expiresIn as never;
  }
  return jwt.sign(fullPayload, secret, signOptions);
}

export function ensureJwtSecret(secret: string = TEST_JWT_SECRET): void {
  process.env.JWT_SECRET = secret;
}
