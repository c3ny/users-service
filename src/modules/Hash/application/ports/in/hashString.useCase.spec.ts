import { Test, TestingModule } from '@nestjs/testing';
import { HashStringUseCase } from './hashString.useCase';
import { HashRepositoryPort } from '../out/hash-repository.port';
import { HASH_REPOSITORY } from '../../../constants';

describe('HashStringUseCase', () => {
  let useCase: HashStringUseCase;
  let hashRepository: jest.Mocked<HashRepositoryPort>;

  beforeEach(async () => {
    const mockHashRepository = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashStringUseCase,
        {
          provide: HASH_REPOSITORY,
          useValue: mockHashRepository,
        },
      ],
    }).compile();

    useCase = module.get<HashStringUseCase>(HashStringUseCase);
    hashRepository = module.get(HASH_REPOSITORY);
  });

  describe('execute', () => {
    it('should hash a password successfully', () => {
      const password = 'mySecretPassword123';
      const hashedPassword: `${string}:${string}` = 'salt:hashedPassword123';

      hashRepository.hash.mockReturnValue(hashedPassword);

      const result = useCase.execute(password);

      expect(result).toBe(hashedPassword);
      expect(hashRepository.hash).toHaveBeenCalledWith(password);
    });

    it('should handle empty password', () => {
      const password = '';
      const hashedPassword: `${string}:${string}` = 'salt:hashedEmptyString';

      hashRepository.hash.mockReturnValue(hashedPassword);

      const result = useCase.execute(password);

      expect(result).toBe(hashedPassword);
      expect(hashRepository.hash).toHaveBeenCalledWith(password);
    });

    it('should handle different password lengths', () => {
      const passwords = [
        'a', // Single character
        'short', // Short password
        'mediumLengthPassword123', // Medium password
        'veryLongPasswordWithManyCharactersAndNumbers123456789', // Long password
      ];

      passwords.forEach((password, index) => {
        const hashedPassword: `${string}:${string}` = `salt:hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
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
        const hashedPassword: `${string}:${string}` = `salt:special_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
      });
    });

    it('should handle passwords with numbers only', () => {
      const numericPasswords = [
        '123456',
        '987654321',
        '0000000000',
        '1234567890',
      ];

      numericPasswords.forEach((password, index) => {
        const hashedPassword: `${string}:${string}` = `salt:numeric_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
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
        const hashedPassword: `${string}:${string}` = `salt:space_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
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
        const hashedPassword: `${string}:${string}` = `salt:unicode_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
      });
    });

    it('should handle same password multiple times', () => {
      const password = 'samePassword123';
      const hashedPassword1: `${string}:${string}` = 'salt1:hashed1';
      const hashedPassword2: `${string}:${string}` = 'salt2:hashed2';

      hashRepository.hash
        .mockReturnValueOnce(hashedPassword1)
        .mockReturnValueOnce(hashedPassword2);

      const result1 = useCase.execute(password);
      const result2 = useCase.execute(password);

      expect(result1).toBe(hashedPassword1);
      expect(result2).toBe(hashedPassword2);
      expect(hashRepository.hash).toHaveBeenCalledTimes(2);
      expect(hashRepository.hash).toHaveBeenNthCalledWith(1, password);
      expect(hashRepository.hash).toHaveBeenNthCalledWith(2, password);
    });

    it('should handle repository errors gracefully', () => {
      const password = 'testPassword';
      hashRepository.hash.mockImplementation(() => {
        throw new Error('Hashing service unavailable');
      });

      expect(() => useCase.execute(password)).toThrow(
        'Hashing service unavailable',
      );
      expect(hashRepository.hash).toHaveBeenCalledWith(password);
    });

    it('should handle very long passwords', () => {
      const veryLongPassword = 'a'.repeat(10000); // 10,000 characters
      const hashedPassword: `${string}:${string}` =
        'salt:hashedVeryLongPassword';

      hashRepository.hash.mockReturnValue(hashedPassword);

      const result = useCase.execute(veryLongPassword);

      expect(result).toBe(hashedPassword);
      expect(hashRepository.hash).toHaveBeenCalledWith(veryLongPassword);
    });

    it('should handle common password patterns', () => {
      const commonPatterns = [
        '123456789',
        'password123',
        'qwerty123',
        'admin123',
        'user123',
        'test123',
      ];

      commonPatterns.forEach((password, index) => {
        const hashedPassword: `${string}:${string}` = `salt:common_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
      });
    });

    it('should handle concurrent hashing requests', () => {
      const passwords = [
        'password1',
        'password2',
        'password3',
        'password4',
        'password5',
      ];
      const hashedPasswords: `${string}:${string}`[] = passwords.map(
        (_, index): `${string}:${string}` => `salt${index}:hashed_${index}`,
      );

      hashRepository.hash
        .mockReturnValueOnce(hashedPasswords[0])
        .mockReturnValueOnce(hashedPasswords[1])
        .mockReturnValueOnce(hashedPasswords[2])
        .mockReturnValueOnce(hashedPasswords[3])
        .mockReturnValueOnce(hashedPasswords[4]);

      const results = passwords.map((password) => useCase.execute(password));

      results.forEach((result, index) => {
        expect(result).toBe(hashedPasswords[index]);
      });

      expect(hashRepository.hash).toHaveBeenCalledTimes(5);
      passwords.forEach((password, index) => {
        expect(hashRepository.hash).toHaveBeenNthCalledWith(
          index + 1,
          password,
        );
      });
    });

    it('should handle edge case characters', () => {
      const edgeCasePasswords = [
        '\n', // Newline
        '\t', // Tab
        '\r', // Carriage return
        '\0', // Null character
        '\\', // Backslash
        '"', // Quote
        "'", // Single quote
      ];

      edgeCasePasswords.forEach((password, index) => {
        const hashedPassword: `${string}:${string}` = `salt:edge_hashed_${index}`;
        hashRepository.hash.mockReturnValue(hashedPassword);

        const result = useCase.execute(password);

        expect(result).toBe(hashedPassword);
        expect(hashRepository.hash).toHaveBeenCalledWith(password);
      });
    });
  });
});
