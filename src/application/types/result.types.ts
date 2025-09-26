import { ErrorsEnum } from '../core/errors/errors.enum';

export type PartialSuccessResult<T> = {
  isSuccess: true;
  value: T;
  error?: undefined;
  isPartialSuccess: true;
};

export type SuccessResult<T> = {
  isSuccess: true;
  value: T;
  error?: undefined;
  isPartialSuccess?: false;
};

export type FailureResult = {
  isSuccess: false;
  value?: undefined;
  error: ErrorsEnum;
  isPartialSuccess?: false;
};

export type Result<T> =
  | SuccessResult<T>
  | PartialSuccessResult<T>
  | FailureResult;

export class ResultFactory {
  static success<T>(value: T): Result<T> {
    return { isSuccess: true, value };
  }

  static failure<T>(error: ErrorsEnum): Result<T> {
    return { isSuccess: false, error };
  }

  static partialSuccess<T>(value: T): Result<T> {
    return { isSuccess: true, value, isPartialSuccess: true };
  }
}
