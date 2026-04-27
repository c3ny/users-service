import { ExecutionContext } from '@nestjs/common';

export interface MockRequest {
  headers?: Record<string, string | string[] | undefined>;
  user?: unknown;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  method?: string;
  url?: string;
  originalUrl?: string;
  ip?: string;
}

export function mockExecutionContext(
  request: MockRequest = {},
): ExecutionContext {
  const fullRequest = {
    headers: {},
    params: {},
    query: {},
    body: {},
    method: 'GET',
    url: '/',
    ...request,
  } as MockRequest;

  const httpArgumentsHost = {
    getRequest: jest.fn(() => fullRequest),
    getResponse: jest.fn(() => ({})),
    getNext: jest.fn(),
  };

  return {
    switchToHttp: jest.fn(() => httpArgumentsHost),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(() => 'http'),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
  } as unknown as ExecutionContext;
}
