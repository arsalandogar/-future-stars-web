import { createFileRoute, Outlet, notFound } from '@tanstack/react-router';

import { isLegalDocumentType, type LegalDocumentType } from '@/features/legal';

export const Route = createFileRoute('/_authenticated/admin/legal/$type')({
  params: {
    parse: (params): { type: LegalDocumentType } => {
      if (!isLegalDocumentType(params.type)) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw notFound();
      }
      return { type: params.type };
    },
    stringify: (params) => ({ type: params.type }),
  },
  component: LegalTypeLayout,
});

function LegalTypeLayout() {
  return <Outlet />;
}
