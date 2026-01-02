import { createFileRoute } from '@tanstack/react-router';

import { PublicLegalPage } from '@/features/legal';

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return <PublicLegalPage type="privacy-policy" title="Privacy Policy" />;
}
