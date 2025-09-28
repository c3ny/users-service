import { ResultFactory } from './result.types';
import { ErrorsEnum } from '../core/errors/errors.enum';

describe('ResultFactory', () => {
  describe('success', () => {
    it('should create a successful result with value', () => {
      const value = { id: '1', name: 'Test' };
      const result = ResultFactory.success(value);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(value);
      expect(result.error).toBeUndefined();
      expect(result.isPartialSuccess).toBeUndefined();
    });

    it('should create a successful result with null value', () => {
      const result = ResultFactory.success(null);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should create a successful result with undefined value', () => {
      const result = ResultFactory.success(undefined);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('failure', () => {
    it('should create a failure result with error', () => {
      const error = ErrorsEnum.UserNotFoundError;
      const result = ResultFactory.failure(error);

      expect(result.isSuccess).toBe(false);
      expect(result.value).toBeUndefined();
      expect(result.error).toBe(error);
      expect(result.isPartialSuccess).toBeUndefined();
    });

    it('should create a failure result with different error types', () => {
      const errors = [
        ErrorsEnum.InvalidPassword,
        ErrorsEnum.UserAlreadyExists,
        ErrorsEnum.CompanyNotFoundError,
        ErrorsEnum.DonorNotFoundError,
      ];

      errors.forEach((error) => {
        const result = ResultFactory.failure(error);
        expect(result.isSuccess).toBe(false);
        expect(result.error).toBe(error);
      });
    });
  });

  describe('partialSuccess', () => {
    it('should create a partial success result with value', () => {
      const value = { id: '1', name: 'Test' };
      const result = ResultFactory.partialSuccess(value);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(value);
      expect(result.error).toBeUndefined();
      expect(result.isPartialSuccess).toBe(true);
    });

    it('should create a partial success result with complex object', () => {
      const value = {
        user: { id: '1', email: 'test@test.com' },
        metadata: { created: true, updated: false },
      };
      const result = ResultFactory.partialSuccess(value);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(value);
      expect(result.isPartialSuccess).toBe(true);
    });
  });

  describe('type guards', () => {
    it('should properly identify success results', () => {
      const successResult = ResultFactory.success('test');
      const failureResult = ResultFactory.failure(ErrorsEnum.UserNotFoundError);
      const partialResult = ResultFactory.partialSuccess('test');

      expect(successResult.isSuccess).toBe(true);
      expect(failureResult.isSuccess).toBe(false);
      expect(partialResult.isSuccess).toBe(true);
    });

    it('should properly identify partial success results', () => {
      const successResult = ResultFactory.success('test');
      const partialResult = ResultFactory.partialSuccess('test');

      expect(successResult.isPartialSuccess).toBeFalsy();
      expect(partialResult.isPartialSuccess).toBe(true);
    });
  });
});
