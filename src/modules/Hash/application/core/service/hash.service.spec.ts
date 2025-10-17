import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';
import { HashStringUseCase } from '../../ports/in/hashString.useCase';
import { CompareHashUseCase } from '../../ports/in/compareHash.useCase';
import { createMockUseCase } from '../../../../../test-setup';

describe('HashService', () => {
  let service: HashService;
  let hashStringUseCase: jest.Mocked<HashStringUseCase>;
  let compareHashUseCase: jest.Mocked<CompareHashUseCase>;

  beforeAll(async () => {
    const mockHashStringUseCase = createMockUseCase();
    const mockCompareHashUseCase = createMockUseCase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        { provide: HashStringUseCase, useValue: mockHashStringUseCase },
        { provide: CompareHashUseCase, useValue: mockCompareHashUseCase },
      ],
    }).compile();

    service = module.get<HashService>(HashService);
    hashStringUseCase = module.get(HashStringUseCase);
    compareHashUseCase = module.get(CompareHashUseCase);
  });

  describe('hash', () => {
    it('should hash a password successfully', () => {
      const password = 'mySecretPassword123';
      const hashedPassword = 'hashedPassword123';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);

      const result = service.hash(password);

      expect(result).toBe(hashedPassword);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
    });

    it('should handle empty password', () => {
      const password = '';
      const hashedPassword = 'hashedEmptyString';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);

      const result = service.hash(password);

      expect(result).toBe(hashedPassword);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
    });

    it('should handle different password types', () => {
      const testCases = [
        { password: 'Complex@Password123!', expected: 'hashedComplex' },
        { password: 'àáâãäåæçèéêë', expected: 'hashedUnicode' },
        { password: 'a'.repeat(100), expected: 'hashedLong' },
      ];

      testCases.forEach(({ password, expected }) => {
        hashStringUseCase.execute.mockReturnValue(expected);
        const result = service.hash(password);
        expect(result).toBe(expected);
      });
    });

    it('should handle use case errors', () => {
      const password = 'testPassword';
      hashStringUseCase.execute.mockImplementation(() => {
        throw new Error('Hashing failed');
      });

      expect(() => service.hash(password)).toThrow('Hashing failed');
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
    });

    it('should handle null return from use case', () => {
      const password = 'testPassword';
      hashStringUseCase.execute.mockReturnValue(null as any);

      const result = service.hash(password);

      expect(result).toBeNull();
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
    });

    it('should handle undefined return from use case', () => {
      const password = 'testPassword';
      hashStringUseCase.execute.mockReturnValue(undefined as any);

      const result = service.hash(password);

      expect(result).toBeUndefined();
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
    });
  });

  describe('compare', () => {
    it('should compare password with hash successfully when they match', () => {
      const password = 'mySecretPassword123';
      const passwordWithHash: `${string}:${string}` = 'salt:hashedPassword123';

      compareHashUseCase.execute.mockReturnValue(true);

      const result = service.compare(password, passwordWithHash);

      expect(result).toBe(true);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password,
        hash: passwordWithHash,
      });
    });

    it('should compare password with hash successfully when they do not match', () => {
      const password = 'wrongPassword';
      const passwordWithHash: `${string}:${string}` = 'salt:hashedPassword123';

      compareHashUseCase.execute.mockReturnValue(false);

      const result = service.compare(password, passwordWithHash);

      expect(result).toBe(false);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password,
        hash: passwordWithHash,
      });
    });

    it('should handle empty password comparison', () => {
      const password = '';
      const passwordWithHash: `${string}:${string}` = 'salt:hashedPassword123';

      compareHashUseCase.execute.mockReturnValue(false);

      const result = service.compare(password, passwordWithHash);

      expect(result).toBe(false);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password,
        hash: passwordWithHash,
      });
    });

    it('should handle different password and hash formats', () => {
      const testCases = [
        { password: 'simple', hash: 'salt:hash' as const, expected: true },
        {
          password: 'Complex@123!',
          hash: 'longsalt:longhash' as const,
          expected: false,
        },
        {
          password: '🔐🔑',
          hash: 'special@salt:special#hash' as const,
          expected: true,
        },
      ];

      testCases.forEach(({ password, hash, expected }) => {
        compareHashUseCase.execute.mockReturnValue(expected);
        const result = service.compare(password, hash);
        expect(result).toBe(expected);
      });
    });

    it('should handle use case errors in comparison', () => {
      const password = 'testPassword';
      const passwordWithHash: `${string}:${string}` = 'salt:hash';

      compareHashUseCase.execute.mockImplementation(() => {
        throw new Error('Comparison failed');
      });

      expect(() => service.compare(password, passwordWithHash)).toThrow(
        'Comparison failed',
      );
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password,
        hash: passwordWithHash,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle hash and compare workflow', () => {
      const originalPassword = 'mySecretPassword123';
      const hashedPassword = 'salt:hashedPassword123';
      const passwordWithHash: `${string}:${string}` =
        hashedPassword as `${string}:${string}`;

      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      compareHashUseCase.execute.mockReturnValue(true);

      const hashResult = service.hash(originalPassword);
      const compareResult = service.compare(originalPassword, passwordWithHash);

      expect(hashResult).toBe(hashedPassword);
      expect(compareResult).toBe(true);
    });
  });
});
