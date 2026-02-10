import type { Token, User } from '@/types';

export interface GuestLoginParams {
  userId?: number;
}

export interface GuestLoginResponse {
  token: Token;
  user: User;
}

export interface CheckPhoneParams {
  phone: string;
}

export interface CheckPhoneResponse {
  exists: boolean;
  expiresIn?: number;
}

export interface RequestOtpParams {
  phone: string;
  type?: string;
}

export interface RequestOtpResponse {
  message: string;
  expiresIn: number;
}

export interface VerifyOtpParams {
  phone: string;
  otp: string;
  type?: string;
  firstName?: string;
  lastName?: string;
}

export interface VerifyOtpResponse {
  token: Token;
  user: User;
  message: string;
}

export interface MergeGuestParams {
  phone: string;
  otp: string;
}

export interface MergeGuestResponse {
  token: Token;
  user: User;
  message: string;
}
