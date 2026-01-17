import type { OrderStatus } from '@/features/orders';
import type { PaginationMeta, User, UserRole } from '@/types';

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface UsersListResponse {
  meta: PaginationMeta;
  data: User[];
}

// Card types
export type CardStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface CardTemplate {
  id: number;
  name: string;
  side: 'front' | 'back';
  label: string;
}

export interface UserCard {
  id: number;
  userId: number;
  templateId: number;
  backTemplateId: number | null;
  svgString: string;
  backSvgString: string | null;
  frontCardImage: string | null;
  backCardImage: string | null;
  status: CardStatus;
  hiddenFromGallery: boolean;
  template: CardTemplate;
  backTemplate: CardTemplate | null;
  createdAt: string;
  updatedAt: string;
}

// Pack types
export interface PackCard {
  id: number;
  packId: number;
  cardId: number;
  quantity: number;
  card: UserCard;
}

export interface UserPack {
  id: number;
  userId: number;
  name: string;
  packCards: PackCard[];
  createdAt: string;
  updatedAt: string;
}

// Cart Item types
export interface UserCartItem {
  id: number;
  userId: number;
  packId: number;
  orderId: number | null;
  quantity: number;
  pack: UserPack;
  createdAt: string;
  updatedAt: string;
}

// Address types
export interface UserAddress {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extended user with relations
export interface UserWithRelations extends User {
  ordersCount?: number;
  cardsCount?: number;
  packsCount?: number;
  cartItemsCount?: number;
}

// User order (simplified for listing)
export interface UserOrder {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface UserResponse {
  data: UserWithRelations;
}

// API response types for user relations
export interface UserRelationParams {
  userId: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserOrdersResponse {
  meta: PaginationMeta;
  data: UserOrder[];
}

export interface UserCardsResponse {
  meta: PaginationMeta;
  data: UserCard[];
}

export interface UserPacksResponse {
  meta: PaginationMeta;
  data: UserPack[];
}

export interface UserCartItemsResponse {
  meta: PaginationMeta;
  data: UserCartItem[];
}

export interface UserAddressesResponse {
  meta: PaginationMeta;
  data: UserAddress[];
}
