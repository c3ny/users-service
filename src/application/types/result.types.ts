import { ErrorsEnum } from '../core/errors/errors.enum';

export type Result<T> =
  | { isSuccess: true; value: T; error?: undefined }
  | { isSuccess: false; value?: undefined; error: ErrorsEnum };

export class ResultFactory {
  static success<T>(value: T): Result<T> {
    return { isSuccess: true, value };
  }

  static failure<T>(error: ErrorsEnum): Result<T> {
    return { isSuccess: false, error };
  }
}
