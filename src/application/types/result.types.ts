export type Result<T> =
  | { isSuccess: true; value: T; error?: undefined }
  | { isSuccess: false; value?: undefined; error: string };

export class ResultFactory {
  static success<T>(value: T): Result<T> {
    return { isSuccess: true, value };
  }

  static failure<T>(error: string): Result<T> {
    return { isSuccess: false, error };
  }
}
