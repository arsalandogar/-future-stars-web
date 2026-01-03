import type { Token, User } from '@/types';

export interface AuthResponse {
  token: Token;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PolicyVersions {
  privacyPolicy: string;
  terms: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userId?: number;
  acceptPolicies: boolean;
  policyVersions: PolicyVersions;
}
