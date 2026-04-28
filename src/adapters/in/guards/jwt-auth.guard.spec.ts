import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard, JwtPayload } from './jwt-auth.guard';
import {
  ensureJwtSecret,
  signTestToken,
  TEST_JWT_SECRET,
} from './__test-utils__/auth';
import { mockExecutionContext } from './__test-utils__/execution-context';

const validPayload: JwtPayload = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'donor@example.com',
  personType: 'DONOR',
  isProfileComplete: true,
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  const ORIGINAL_SECRET = process.env.JWT_SECRET;

  beforeEach(() => {
    guard = new JwtAuthGuard();
    ensureJwtSecret();
  });

  afterAll(() => {
    if (ORIGINAL_SECRET === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = ORIGINAL_SECRET;
  });

  it('throws UnauthorizedException when Authorization header is missing', () => {
    const ctx = mockExecutionContext({ headers: {} });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(ctx)).toThrow('No token provided');
  });

  it('throws UnauthorizedException when scheme is not Bearer', () => {
    const ctx = mockExecutionContext({
      headers: { authorization: 'Basic abc' },
    });
    expect(() => guard.canActivate(ctx)).toThrow('No token provided');
  });

  it('throws UnauthorizedException when token is empty after Bearer', () => {
    const ctx = mockExecutionContext({
      headers: { authorization: 'Bearer ' },
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('populates request.user on valid token', () => {
    const token = signTestToken(validPayload);
    const request = { headers: { authorization: `Bearer ${token}` } };
    const ctx = mockExecutionContext(request);
    expect(guard.canActivate(ctx)).toBe(true);
    const populated = ctx.switchToHttp().getRequest().user;
    expect(populated?.id).toBe(validPayload.id);
    expect(populated?.email).toBe(validPayload.email);
  });

  it('throws Token has expired on TokenExpiredError', () => {
    const token = signTestToken(validPayload, { expiresIn: '-1s' });
    const ctx = mockExecutionContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow('Token has expired');
  });

  it('throws Invalid token on JsonWebTokenError (malformed)', () => {
    const ctx = mockExecutionContext({
      headers: { authorization: 'Bearer not-a-jwt-token' },
    });
    expect(() => guard.canActivate(ctx)).toThrow('Invalid token');
  });

  it('throws Invalid token payload when id is missing', () => {
    const token = jwt.sign(
      { email: 'x@y.com', personType: 'DONOR', isProfileComplete: true },
      TEST_JWT_SECRET,
    );
    const ctx = mockExecutionContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow('Invalid token payload');
  });

  it('throws Invalid token payload when email is missing', () => {
    const token = jwt.sign(
      { id: 'abc', personType: 'DONOR', isProfileComplete: true },
      TEST_JWT_SECRET,
    );
    const ctx = mockExecutionContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow('Invalid token payload');
  });

  it('throws when JWT_SECRET env is not configured', () => {
    delete process.env.JWT_SECRET;
    const token = jwt.sign(validPayload, 'any');
    const ctx = mockExecutionContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow(
      /JWT_SECRET environment variable is not set/,
    );
  });

  it('rejects token signed with a different secret as Invalid token', () => {
    const token = jwt.sign(validPayload, 'different-secret');
    const ctx = mockExecutionContext({
      headers: { authorization: `Bearer ${token}` },
    });
    expect(() => guard.canActivate(ctx)).toThrow('Invalid token');
  });
});
