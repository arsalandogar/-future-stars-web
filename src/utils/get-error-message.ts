import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ message: string }>;
}

export function getErrorMessage(
  error: Error | null,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (!error) return fallback;

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return (
      data?.errors?.[0]?.message ?? data?.message ?? error.message ?? fallback
    );
  }

  return error.message ?? fallback;
}
