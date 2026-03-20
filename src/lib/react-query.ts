import {
  QueryClient,
  type DefaultOptions,
  type InfiniteData,
  type MutationFunctionContext,
  type QueryKey,
} from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import type { Middleware, MutationHook } from 'react-query-kit';

import type { PaginationMeta } from '@/types';
import { api } from '@/lib/api-client';

export {
  createQuery,
  createInfiniteQuery,
  createMutation,
  createSuspenseQuery,
  createSuspenseInfiniteQuery,
} from 'react-query-kit';
import { createMutation } from 'react-query-kit';
export type { inferData, inferVariables } from 'react-query-kit';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;

export function flattenInfiniteData<T>(
  data: InfiniteData<{ data: T[] }> | undefined
): T[] {
  return data?.pages.flatMap((page) => page.data) ?? [];
}

export function getNextPageParam(lastPage: { meta: PaginationMeta }) {
  if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
    return lastPage.meta.currentPage + 1;
  }
  return undefined;
}

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

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

/**
 * Middleware that seeds query data after a successful mutation.
 * @example use: [seedQueryData<Card, SaveCardParams>((card) => ({ queryKey: cardQuery.getKey(card.id), data: card }))]
 */
export function seedQueryData<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
  TOnMutateResult = unknown,
>(
  resolver: (
    data: TData,
    variables: TVariables
  ) => { queryKey: QueryKey; data: TData }
): Middleware<MutationHook<TData, TVariables, TError, TOnMutateResult>> {
  return (useMutationNext) => {
    return (options) => {
      const onSuccess = (
        data: TData,
        variables: TVariables,
        onMutateResult: TOnMutateResult,
        mutationContext: MutationFunctionContext
      ) => {
        const { queryKey, data: queryData } = resolver(data, variables);
        queryClient.setQueryData(queryKey, queryData);
        options.onSuccess?.(data, variables, onMutateResult, mutationContext);
      };

      return useMutationNext({ ...options, onSuccess });
    };
  };
}

interface CrudMutationsConfig {
  endpoint: string;
  entityName: string;
  listQueryKey: QueryKey;
  extraInvalidations?: QueryKey[];
}

export function createCrudMutations<
  TCreateParams,
  TUpdateParams extends { id: number },
  TEntity,
>(config: CrudMutationsConfig) {
  const {
    endpoint,
    entityName,
    listQueryKey,
    extraInvalidations = [],
  } = config;

  const allKeys = [listQueryKey, ...extraInvalidations];

  const useCreate = createMutation({
    mutationFn: (params: TCreateParams): Promise<TEntity> =>
      api.post(endpoint, params),
    use: [invalidateQueries(allKeys)],
    onSuccess: () => {
      notifications.show({
        title: `${entityName} created`,
        message: `${entityName} has been created successfully.`,
        color: 'green',
      });
    },
  });

  const useUpdate = createMutation({
    mutationFn: ({ id, ...params }: TUpdateParams): Promise<TEntity> =>
      api.put(`${endpoint}/${id}`, params),
    use: [invalidateQueries(allKeys)],
    onSuccess: () => {
      notifications.show({
        title: `${entityName} updated`,
        message: `${entityName} has been saved successfully.`,
        color: 'green',
      });
    },
  });

  const useDelete = createMutation({
    mutationFn: (id: number): Promise<void> => api.delete(`${endpoint}/${id}`),
    use: [invalidateQueries(allKeys)],
    onSuccess: () => {
      notifications.show({
        title: `${entityName} deleted`,
        message: `${entityName} has been deleted successfully.`,
        color: 'green',
      });
    },
  });

  return { useCreate, useUpdate, useDelete };
}
