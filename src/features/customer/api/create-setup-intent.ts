import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export interface SetupIntentResponseData {
  setupIntentSecret: string;
  customerSessionClientSecret: string;
}

export interface SetupIntentResponse {
  data: SetupIntentResponseData;
}

export const useCreateSetupIntent = createMutation({
  mutationFn: (): Promise<SetupIntentResponse> =>
    api.post('users/setup-intent'),
});
