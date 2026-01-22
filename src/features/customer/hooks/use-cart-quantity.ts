import { useDebouncedCallback } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import type { CartItem } from '@/types';

import { useDeleteCartItem } from '../api/delete-cart-item';
import { type CartItemsResponse, useCartItems } from '../api/get-cart-items';
import { useUpdateCartItem } from '../api/update-cart-item';

const DEBOUNCE_DELAY = 3000; // 3 seconds

export function useCartQuantity(cartItems: CartItem[]) {
  const queryClient = useQueryClient();
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();

  // Track pending updates for debounced sync
  const pendingUpdates = useRef<Map<number, number>>(new Map());

  // Debounced sync function - batches rapid clicks
  const syncToApi = useDebouncedCallback(() => {
    const updates = Array.from(pendingUpdates.current.entries());
    pendingUpdates.current.clear();

    for (const [id, quantity] of updates) {
      updateCartItem.mutate(
        { id, quantity },
        {
          onError: () => {
            // Refetch to get correct server state on error
            void queryClient.invalidateQueries({
              queryKey: useCartItems.getKey(),
            });
          },
        }
      );
    }
  }, DEBOUNCE_DELAY);

  const handleQuantityChange = useCallback(
    (itemId: number, newQuantity: number) => {
      // 1. Update cache IMMEDIATELY for instant UI feedback
      queryClient.setQueryData<CartItemsResponse>(
        useCartItems.getKey(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: (item.totalPrice / item.quantity) * newQuantity,
                  }
                : item
            ),
          };
        }
      );

      // 2. Queue for debounced API sync
      pendingUpdates.current.set(itemId, newQuantity);
      syncToApi();
    },
    [queryClient, syncToApi]
  );

  const handleDelete = useCallback(
    (itemId: number) => {
      // Cancel pending updates for this item
      pendingUpdates.current.delete(itemId);

      // Optimistically remove from cache immediately
      queryClient.setQueryData<CartItemsResponse>(
        useCartItems.getKey(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== itemId),
          };
        }
      );

      // API call (no debounce for delete)
      deleteCartItem.mutate(itemId, {
        onError: () => {
          // Refetch to restore item on error
          void queryClient.invalidateQueries({
            queryKey: useCartItems.getKey(),
          });
        },
      });
    },
    [queryClient, deleteCartItem]
  );

  // Calculate totals using cart items directly (already optimistic from cache)
  const calculateTotals = useCallback(() => {
    let totalPriceInCents = 0;
    let totalPacks = 0;

    for (const item of cartItems) {
      totalPriceInCents += item.totalPrice;
      totalPacks += item.quantity;
    }

    return { totalPrice: totalPriceInCents / 100, totalPacks };
  }, [cartItems]);

  return {
    handleQuantityChange,
    handleDelete,
    calculateTotals,
    isDeleting: deleteCartItem.isPending,
  };
}
