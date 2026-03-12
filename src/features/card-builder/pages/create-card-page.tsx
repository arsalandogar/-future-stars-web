import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { useTemplate } from '@/features/templates-browse';

import { useSaveCard, type PersistCardPayload } from '../api/save-card';
import { CardBuilderShell } from '../components/card-builder-shell';

const routeApi = getRouteApi('/_authenticated/_customer/_card-builder');

export function CreateCardPage() {
  const navigate = useNavigate();
  const saveCard = useSaveCard();
  const { templateId } = routeApi.useSearch();

  const { data: selectedTemplate } = useTemplate({
    variables: templateId,
    enabled: !!templateId,
  });

  const backTemplateId = selectedTemplate?.backTemplateId ?? null;

  const handleSave = (payload: PersistCardPayload) => {
    saveCard.mutate(payload, {
      onSuccess: (card) => {
        void navigate({
          to: '/card/$cardId',
          params: { cardId: String(card.id) },
        });
      },
    });
  };

  return (
    <>
      <Head title="Create Card" description="Create your custom card" />
      <CardBuilderShell
        templateId={templateId ?? null}
        backTemplateId={backTemplateId}
        isSaving={saveCard.isPending}
        onSave={handleSave}
      />
    </>
  );
}
