import { createFileRoute } from '@tanstack/react-router';

import { PublicLegalPage } from '@/features/legal';

export const Route = createFileRoute('/terms-and-conditions')({
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return <PublicLegalPage type="terms" title="Terms & Conditions" />;
}
