import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';
import { HashStringUseCase } from '../../ports/in/hashString.useCase';
import { CompareHashUseCase } from '../../ports/in/compareHash.useCase';

describe('HashService', () => {
  let service: HashService;
  let hashStringUseCase: jest.Mocked<HashStringUseCase>;
  let compareHashUseCase: jest.Mocked<CompareHashUseCase>;

  beforeEach(async () => {
    const mockHashStringUseCase = { execute: jest.fn() };
    const mockCompareHashUseCase = { execute: jest.fn() };

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
      const passwords = [
        'simplePassword',
        'Complex@Password123!',
        '12345678',
        'password with spaces',
        'àáâãäåæçèéêë',
      ];

      passwords.forEach((password, index) => {
        const hashedPassword = `hashed_${index}`;
        hashStringUseCase.execute.mockReturnValue(hashedPassword);

        const result = service.hash(password);

        expect(result).toBe(hashedPassword);
        expect(hashStringUseCase.execute).toHaveBeenCalledWith(password);
      });
    });

    it('should handle long passwords', () => {
      const longPassword = 'a'.repeat(1000);
      const hashedPassword = 'hashedLongPassword';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);

      const result = service.hash(longPassword);

      expect(result).toBe(hashedPassword);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(longPassword);
    });

    it('should handle special characters', () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashedPassword = 'hashedSpecialPassword';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);

      const result = service.hash(specialPassword);

      expect(result).toBe(hashedPassword);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(specialPassword);
    });

    it('should handle Unicode characters', () => {
      const unicodePassword = '🔐🔑🛡️密码パスワード';
      const hashedPassword = 'hashedUnicodePassword';

      hashStringUseCase.execute.mockReturnValue(hashedPassword);

      const result = service.hash(unicodePassword);

      expect(result).toBe(hashedPassword);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(unicodePassword);
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

    it('should handle different hash formats', () => {
      const password = 'testPassword';
      const hashFormats: `${string}:${string}`[] = [
        'salt:hash',
        'longsalt:longhash',
        '123:456',
        'special@salt:special#hash',
      ];

      hashFormats.forEach((passwordWithHash, index) => {
        const expected = index % 2 === 0;
        compareHashUseCase.execute.mockReturnValue(expected);

        const result = service.compare(password, passwordWithHash);

        expect(result).toBe(expected);
        expect(compareHashUseCase.execute).toHaveBeenCalledWith({
          password,
          hash: passwordWithHash,
        });
      });
    });

    it('should handle different password types in comparison', () => {
      const passwords = [
        'simplePassword',
        'Complex@Password123!',
        '12345678',
        'password with spaces',
        'àáâãäåæçèéêë',
      ];

      const passwordWithHash: `${string}:${string}` = 'salt:hash';

      passwords.forEach((password, index) => {
        const expected = index % 2 === 0;
        compareHashUseCase.execute.mockReturnValue(expected);

        const result = service.compare(password, passwordWithHash);

        expect(result).toBe(expected);
        expect(compareHashUseCase.execute).toHaveBeenCalledWith({
          password,
          hash: passwordWithHash,
        });
      });
    });

    it('should handle long passwords in comparison', () => {
      const longPassword = 'a'.repeat(1000);
      const passwordWithHash: `${string}:${string}` = 'salt:hashedLongPassword';

      compareHashUseCase.execute.mockReturnValue(true);

      const result = service.compare(longPassword, passwordWithHash);

      expect(result).toBe(true);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: longPassword,
        hash: passwordWithHash,
      });
    });

    it('should handle special characters in comparison', () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const passwordWithHash: `${string}:${string}` =
        'salt:hashedSpecialPassword';

      compareHashUseCase.execute.mockReturnValue(true);

      const result = service.compare(specialPassword, passwordWithHash);

      expect(result).toBe(true);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: specialPassword,
        hash: passwordWithHash,
      });
    });

    it('should handle Unicode characters in comparison', () => {
      const unicodePassword = '🔐🔑🛡️密码パスワード';
      const passwordWithHash: `${string}:${string}` =
        'salt:hashedUnicodePassword';

      compareHashUseCase.execute.mockReturnValue(true);

      const result = service.compare(unicodePassword, passwordWithHash);

      expect(result).toBe(true);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: unicodePassword,
        hash: passwordWithHash,
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

    it('should handle authentication scenarios', () => {
      const authenticationTests = [
        {
          scenario: 'Valid login',
          password: 'userPassword123',
          hash: 'salt:validHashForUser123' as `${string}:${string}`,
          expected: true,
        },
        {
          scenario: 'Invalid password',
          password: 'wrongPassword',
          hash: 'salt:validHashForUser123' as `${string}:${string}`,
          expected: false,
        },
        {
          scenario: 'Brute force attempt',
          password: '123456',
          hash: 'salt:validHashForUser123' as `${string}:${string}`,
          expected: false,
        },
      ];

      authenticationTests.forEach((test) => {
        compareHashUseCase.execute.mockReturnValue(test.expected);

        const result = service.compare(test.password, test.hash);

        expect(result).toBe(test.expected);
        expect(compareHashUseCase.execute).toHaveBeenCalledWith({
          password: test.password,
          hash: test.hash,
        });
      });
    });

    it('should handle concurrent comparison requests', () => {
      const testCases = [
        {
          password: 'password1',
          hash: 'salt1:hash1' as `${string}:${string}`,
          expected: true,
        },
        {
          password: 'password2',
          hash: 'salt2:hash2' as `${string}:${string}`,
          expected: false,
        },
        {
          password: 'password3',
          hash: 'salt3:hash3' as `${string}:${string}`,
          expected: true,
        },
        {
          password: 'password4',
          hash: 'salt4:hash4' as `${string}:${string}`,
          expected: false,
        },
        {
          password: 'password5',
          hash: 'salt5:hash5' as `${string}:${string}`,
          expected: true,
        },
      ];

      testCases.forEach((testCase) => {
        compareHashUseCase.execute.mockReturnValueOnce(testCase.expected);
      });

      const results = testCases.map((testCase) =>
        service.compare(testCase.password, testCase.hash),
      );

      results.forEach((result, index) => {
        expect(result).toBe(testCases[index].expected);
      });

      expect(compareHashUseCase.execute).toHaveBeenCalledTimes(5);
    });

    it('should handle edge case hash formats', () => {
      const password = 'testPassword';
      const edgeCaseHashes: `${string}:${string}`[] = [
        ':hash', // Empty salt
        'salt:', // Empty hash
        'a:b', // Minimal format
        'very-long-salt-with-many-characters:very-long-hash-with-many-characters',
      ];

      edgeCaseHashes.forEach((passwordWithHash, index) => {
        const expected = index % 2 === 0;
        compareHashUseCase.execute.mockReturnValue(expected);

        const result = service.compare(password, passwordWithHash);

        expect(result).toBe(expected);
        expect(compareHashUseCase.execute).toHaveBeenCalledWith({
          password,
          hash: passwordWithHash,
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle hash and compare workflow', () => {
      const originalPassword = 'mySecretPassword123';
      const hashedPassword = 'salt:hashedPassword123';
      const passwordWithHash: `${string}:${string}` =
        hashedPassword as `${string}:${string}`;

      // Hash the password
      hashStringUseCase.execute.mockReturnValue(hashedPassword);
      const hashResult = service.hash(originalPassword);

      // Compare the password
      compareHashUseCase.execute.mockReturnValue(true);
      const compareResult = service.compare(originalPassword, passwordWithHash);

      expect(hashResult).toBe(hashedPassword);
      expect(compareResult).toBe(true);
      expect(hashStringUseCase.execute).toHaveBeenCalledWith(originalPassword);
      expect(compareHashUseCase.execute).toHaveBeenCalledWith({
        password: originalPassword,
        hash: passwordWithHash,
      });
    });

    it('should handle multiple hash operations', () => {
      const passwords = ['password1', 'password2', 'password3'];
      const hashedPasswords = ['hash1', 'hash2', 'hash3'];

      passwords.forEach((password, index) => {
        hashStringUseCase.execute.mockReturnValueOnce(hashedPasswords[index]);
        const result = service.hash(password);
        expect(result).toBe(hashedPasswords[index]);
      });

      expect(hashStringUseCase.execute).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple compare operations', () => {
      const testCases = [
        {
          password: 'password1',
          hash: 'salt1:hash1' as `${string}:${string}`,
          expected: true,
        },
        {
          password: 'password2',
          hash: 'salt2:hash2' as `${string}:${string}`,
          expected: false,
        },
        {
          password: 'password3',
          hash: 'salt3:hash3' as `${string}:${string}`,
          expected: true,
        },
      ];

      testCases.forEach((testCase) => {
        compareHashUseCase.execute.mockReturnValueOnce(testCase.expected);
        const result = service.compare(testCase.password, testCase.hash);
        expect(result).toBe(testCase.expected);
      });

      expect(compareHashUseCase.execute).toHaveBeenCalledTimes(3);
    });
  });
});
