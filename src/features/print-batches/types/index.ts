import type { Order, PaginationMeta } from '@/types';

export type PrintBatchStatus = 'pending' | 'printing' | 'printed' | 'error';

export interface PrintBatchCreatedBy {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PrintBatch {
  id: number;
  name: string;
  status: PrintBatchStatus;
  totalOrders: number;
  totalPacks: number;
  totalCards: number;
  creator?: PrintBatchCreatedBy;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface PrintBatchesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PrintBatchStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PrintBatchesListResponse {
  meta: PaginationMeta;
  data: PrintBatch[];
}

export interface InvalidOrder {
  orderId: number;
  reasons: string[];
}

export interface CreatePrintBatchParams {
  name?: string;
  orderIds: number[];
  exclude?: boolean;
}

export interface UpdatePrintBatchParams {
  id: number;
  name?: string;
  status?: PrintBatchStatus;
}

export interface AddOrdersToBatchParams {
  batchId: number;
  orderIds: number[];
  exclude?: boolean;
}

export interface RemoveOrdersFromBatchParams {
  batchId: number;
  orderIds: number[];
}

export interface BulkUpdateBatchStatusParams {
  batchIds: number[];
  status: PrintBatchStatus;
}
