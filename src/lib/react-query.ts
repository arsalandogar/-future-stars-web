import type {
  DefaultOptions,
  MutationFunctionContext,
  QueryKey,
} from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { Middleware, MutationHook } from 'react-query-kit';

export {
  createQuery,
  createInfiniteQuery,
  createMutation,
  createSuspenseQuery,
  createSuspenseInfiniteQuery,
} from 'react-query-kit';
export type { inferData, inferVariables } from 'react-query-kit';

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

interface GuardedInvalidation<TData, TVariables, TOnMutateResult> {
  queryKey: QueryKey;
  guard: (
    data: TData,
    variables: TVariables,
    onMutateResult: TOnMutateResult
  ) => boolean;
}

type InvalidationEntry<TData, TVariables, TOnMutateResult> =
  | QueryKey
  | GuardedInvalidation<TData, TVariables, TOnMutateResult>;

/**
 * Middleware that invalidates queries after a successful mutation.
 * @example use: [invalidateQueries([useConfigs.getKey()])]
 */
export function invalidateQueries<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
  TOnMutateResult = unknown,
>(
  entries: InvalidationEntry<TData, TVariables, TOnMutateResult>[]
): Middleware<MutationHook<TData, TVariables, TError, TOnMutateResult>> {
  return (useMutationNext) => {
    return (options) => {
      const queryClient = useQueryClient();

      const onSuccess = (
        data: TData,
        variables: TVariables,
        onMutateResult: TOnMutateResult,
        mutationContext: MutationFunctionContext
      ) => {
        for (const entry of entries) {
          if (Array.isArray(entry)) {
            void queryClient.invalidateQueries({ queryKey: entry });
          } else {
            const guarded = entry as GuardedInvalidation<
              TData,
              TVariables,
              TOnMutateResult
            >;
            if (guarded.guard(data, variables, onMutateResult)) {
              void queryClient.invalidateQueries({
                queryKey: guarded.queryKey,
              });
            }
          }
        }
        options.onSuccess?.(data, variables, onMutateResult, mutationContext);
      };

      return useMutationNext({ ...options, onSuccess });
    };
  };
}
