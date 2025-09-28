import { Test, TestingModule } from '@nestjs/testing';
import {
  CompareHashUseCase,
  CompareHashUseCaseParams,
} from './compareHash.useCase';
import { HashRepositoryPort } from '../out/hash-repository.port';
import { HASH_REPOSITORY } from '../../../constants';

describe('CompareHashUseCase', () => {
  let useCase: CompareHashUseCase;
  let hashRepository: jest.Mocked<HashRepositoryPort>;

  beforeEach(async () => {
    const mockHashRepository = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompareHashUseCase,
        {
          provide: HASH_REPOSITORY,
          useValue: mockHashRepository,
        },
      ],
    }).compile();

    useCase = module.get<CompareHashUseCase>(CompareHashUseCase);
    hashRepository = module.get(HASH_REPOSITORY);
  });

  describe('execute', () => {
    it('should return true when password matches hash', () => {
      const params: CompareHashUseCaseParams = {
        password: 'mySecretPassword123',
        hash: 'hashedPassword123',
      };

      hashRepository.compare.mockReturnValue(true);

      const result = useCase.execute(params);

      expect(result).toBe(true);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should return false when password does not match hash', () => {
      const params: CompareHashUseCaseParams = {
        password: 'wrongPassword',
        hash: 'hashedPassword123',
      };

      hashRepository.compare.mockReturnValue(false);

      const result = useCase.execute(params);

      expect(result).toBe(false);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should handle empty password', () => {
      const params: CompareHashUseCaseParams = {
        password: '',
        hash: 'hashedPassword123',
      };

      hashRepository.compare.mockReturnValue(false);

      const result = useCase.execute(params);

      expect(result).toBe(false);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should handle empty hash', () => {
      const params: CompareHashUseCaseParams = {
        password: 'myPassword',
        hash: '',
      };

      hashRepository.compare.mockReturnValue(false);

      const result = useCase.execute(params);

      expect(result).toBe(false);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should handle both empty password and hash', () => {
      const params: CompareHashUseCaseParams = {
        password: '',
        hash: '',
      };

      hashRepository.compare.mockReturnValue(true);

      const result = useCase.execute(params);

      expect(result).toBe(true);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should handle different password lengths', () => {
      const passwords = [
        'a', // Single character
        'short', // Short password
        'mediumLengthPassword123', // Medium password
        'veryLongPasswordWithManyCharactersAndNumbers123456789', // Long password
      ];

      passwords.forEach((password, index) => {
        const params: CompareHashUseCaseParams = {
          password,
          hash: `hash_${index}`,
        };

        const expectedResult = index % 2 === 0; // Alternate true/false
        hashRepository.compare.mockReturnValue(expectedResult);

        const result = useCase.execute(params);

        expect(result).toBe(expectedResult);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          password,
          params.hash,
        );
      });
    });

    it('should handle passwords with special characters', () => {
      const specialPasswords = [
        'password@123',
        'p@ssw0rd!',
        'mY$ecr3t#P@ssw0rd',
        'test!@#$%^&*()_+',
        'àáâãäåæçèéêë',
      ];

      specialPasswords.forEach((password, index) => {
        const params: CompareHashUseCaseParams = {
          password,
          hash: `special_hash_${index}`,
        };

        hashRepository.compare.mockReturnValue(true);

        const result = useCase.execute(params);

        expect(result).toBe(true);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          password,
          params.hash,
        );
      });
    });

    it('should handle case sensitivity', () => {
      const testCases = [
        { password: 'Password123', hash: 'hash1', expected: true },
        { password: 'password123', hash: 'hash1', expected: false },
        { password: 'PASSWORD123', hash: 'hash1', expected: false },
      ];

      testCases.forEach((testCase, index) => {
        const params: CompareHashUseCaseParams = {
          password: testCase.password,
          hash: testCase.hash,
        };

        hashRepository.compare.mockReturnValue(testCase.expected);

        const result = useCase.execute(params);

        expect(result).toBe(testCase.expected);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          testCase.password,
          testCase.hash,
        );
      });
    });

    it('should handle Unicode characters', () => {
      const unicodePasswords = [
        'contraseña123', // Spanish
        'пароль123', // Russian
        '密码123', // Chinese
        'パスワード123', // Japanese
        '🔐🔑🛡️', // Emojis
      ];

      unicodePasswords.forEach((password, index) => {
        const params: CompareHashUseCaseParams = {
          password,
          hash: `unicode_hash_${index}`,
        };

        hashRepository.compare.mockReturnValue(true);

        const result = useCase.execute(params);

        expect(result).toBe(true);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          password,
          params.hash,
        );
      });
    });

    it('should handle passwords with spaces', () => {
      const passwordsWithSpaces = [
        'password with spaces',
        ' leading space',
        'trailing space ',
        '  multiple  spaces  ',
      ];

      passwordsWithSpaces.forEach((password, index) => {
        const params: CompareHashUseCaseParams = {
          password,
          hash: `space_hash_${index}`,
        };

        hashRepository.compare.mockReturnValue(true);

        const result = useCase.execute(params);

        expect(result).toBe(true);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          password,
          params.hash,
        );
      });
    });

    it('should handle repository errors gracefully', () => {
      const params: CompareHashUseCaseParams = {
        password: 'testPassword',
        hash: 'testHash',
      };

      hashRepository.compare.mockImplementation(() => {
        throw new Error('Hash comparison service unavailable');
      });

      expect(() => useCase.execute(params)).toThrow(
        'Hash comparison service unavailable',
      );
      expect(hashRepository.compare).toHaveBeenCalledWith(
        params.password,
        params.hash,
      );
    });

    it('should handle multiple comparison attempts with same credentials', () => {
      const params: CompareHashUseCaseParams = {
        password: 'samePassword123',
        hash: 'sameHash123',
      };

      hashRepository.compare.mockReturnValue(true);

      const result1 = useCase.execute(params);
      const result2 = useCase.execute(params);
      const result3 = useCase.execute(params);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(hashRepository.compare).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent comparison requests', () => {
      const testCases = [
        { password: 'password1', hash: 'hash1', expected: true },
        { password: 'password2', hash: 'hash2', expected: false },
        { password: 'password3', hash: 'hash3', expected: true },
        { password: 'password4', hash: 'hash4', expected: false },
        { password: 'password5', hash: 'hash5', expected: true },
      ];

      testCases.forEach((testCase, index) => {
        hashRepository.compare.mockReturnValueOnce(testCase.expected);
      });

      const results = testCases.map((testCase) =>
        useCase.execute({ password: testCase.password, hash: testCase.hash }),
      );

      results.forEach((result, index) => {
        expect(result).toBe(testCases[index].expected);
      });

      expect(hashRepository.compare).toHaveBeenCalledTimes(5);
    });

    it('should handle authentication scenarios', () => {
      const authenticationTests = [
        {
          scenario: 'Valid login',
          password: 'userPassword123',
          hash: 'validHashForUser123',
          expected: true,
        },
        {
          scenario: 'Invalid password',
          password: 'wrongPassword',
          hash: 'validHashForUser123',
          expected: false,
        },
        {
          scenario: 'Brute force attempt',
          password: '123456',
          hash: 'validHashForUser123',
          expected: false,
        },
      ];

      authenticationTests.forEach((test) => {
        const params: CompareHashUseCaseParams = {
          password: test.password,
          hash: test.hash,
        };

        hashRepository.compare.mockReturnValue(test.expected);

        const result = useCase.execute(params);

        expect(result).toBe(test.expected);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          test.password,
          test.hash,
        );
      });
    });

    it('should handle edge case characters', () => {
      const edgeCases = [
        { password: '\n', hash: 'newline_hash' },
        { password: '\t', hash: 'tab_hash' },
        { password: '\r', hash: 'carriage_return_hash' },
        { password: '\0', hash: 'null_char_hash' },
        { password: '\\', hash: 'backslash_hash' },
        { password: '"', hash: 'quote_hash' },
        { password: "'", hash: 'single_quote_hash' },
      ];

      edgeCases.forEach((edgeCase, index) => {
        const params: CompareHashUseCaseParams = {
          password: edgeCase.password,
          hash: edgeCase.hash,
        };

        const expected = index % 2 === 0;
        hashRepository.compare.mockReturnValue(expected);

        const result = useCase.execute(params);

        expect(result).toBe(expected);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          edgeCase.password,
          edgeCase.hash,
        );
      });
    });

    it('should handle very long passwords and hashes', () => {
      const veryLongPassword = 'a'.repeat(10000); // 10,000 characters
      const veryLongHash = 'h'.repeat(10000); // 10,000 characters

      const params: CompareHashUseCaseParams = {
        password: veryLongPassword,
        hash: veryLongHash,
      };

      hashRepository.compare.mockReturnValue(true);

      const result = useCase.execute(params);

      expect(result).toBe(true);
      expect(hashRepository.compare).toHaveBeenCalledWith(
        veryLongPassword,
        veryLongHash,
      );
    });

    it('should handle common attack patterns', () => {
      const attackPatterns = [
        { password: 'admin', hash: 'user_hash', expected: false },
        { password: 'password', hash: 'user_hash', expected: false },
        { password: '123456', hash: 'user_hash', expected: false },
        { password: 'qwerty', hash: 'user_hash', expected: false },
        { password: '', hash: 'user_hash', expected: false }, // Empty password attack
      ];

      attackPatterns.forEach((pattern) => {
        const params: CompareHashUseCaseParams = {
          password: pattern.password,
          hash: pattern.hash,
        };

        hashRepository.compare.mockReturnValue(pattern.expected);

        const result = useCase.execute(params);

        expect(result).toBe(pattern.expected);
        expect(hashRepository.compare).toHaveBeenCalledWith(
          pattern.password,
          pattern.hash,
        );
      });
    });
  });
});
