// Global test setup and utilities
import { Test, TestingModule } from '@nestjs/testing';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

// Utility function to create test modules more efficiently
export const createTestModule = async (
  providers: any[],
): Promise<TestingModule> => {
  return Test.createTestingModule({
    providers,
  }).compile();
};

// Common mock factories
export const createMockRepository = () => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
});

export const createMockUseCase = () => ({
  execute: jest.fn(),
});

export const createMockHashRepository = () => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

// Performance optimization: Clear mocks after each test instead of recreating them
afterEach(() => {
  jest.clearAllMocks();
});
